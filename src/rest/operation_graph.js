import Operation from './operation';
import Coalesce from '../namespace';
import array_from from '../utils/array_from';

export default class OperationGraph {

  constructor(models, shadows, adapter, session) {
    this.models = models;
    this.shadows = shadows;
    this.adapter = adapter;
    this.session = session;
    this.ops = new Map();
    this.build();
  }

  perform() {
    var adapter = this.adapter,
        results = [],
        pending = [];

    function createNestedPromise(op) {
      var promise;

      // perform after all parents have performed
      if(op.parents.size > 0) {
        
        var parentOperations = array_from(op.parents);
        
        promise =  Coalesce.RSVP.allSettled(parentOperations).then(function(states) {
          var rejectedOperations = _.filter(states, function(obj){
            return obj.state === 'rejected';
          });

          var fulfilledOperations = _.filter(states, function(obj){
            return obj.state === 'fulfilled';
          });

          if(rejectedOperations.length){
            // if we dont reject, if a complex graph contains duplicate operations throughout
            // then some promises will never finish
            op.reject();
            throw op.model;
          }else{        
            return op.perform();
          }
        });
      } else {
        promise = op.perform();
      }

      // keep track of all models for the resolution of the entire flush
      promise = promise.then(function(model) {
        results.push(model);
        _.remove(pending, op);
        return model;
      }, function(model) {
        results.push(model);
        _.remove(pending, op);
        throw model;
      });

      if(op.children.size > 0) {
        promise = promise.then(function(model) {

          var childrenOperations = array_from(op.children);

          return Coalesce.RSVP.allSettled(childrenOperations).then(function(states) {
            
            var rejectedOperations = _.filter(states, function(obj){
              return obj.state === 'rejected';
            });

            var fulfilledOperations = _.filter(states, function(obj){
              return obj.state === 'fulfilled';
            });

            if(rejectedOperations.length){
              throw model;
            }else{
              var models = fulfilledOperations.map(function(obj){
                return obj.value;
              });

              adapter.rebuildRelationships(models, model);

              return model;
            }
          });
        });
      }
      return promise;
    }

    var promises = [];
    this.ops.forEach(function(op, model) {
      pending.push(op);
      promises.push(createNestedPromise(op));
    }); 

    return Coalesce.RSVP.allSettled(promises).then(function(states) {
      var rejectedOperations = _.filter(states, function(obj){
        return obj.state === 'rejected';
      });

      rejectedOperations.forEach(function(obj){
        var err = obj.reason;

        // all the promises that haven't finished, we need still merge them into
        // the session
        var failures = pending.map(function(op) {
          return op.fail();
        });

        results = results.concat(failures);
      });

      if(rejectedOperations.length){
        throw results;
      }else{
        return results; 
      }
    });
  }

  build() {
    var adapter = this.adapter,
        models = this.models,
        shadows = this.shadows,
        ops = this.ops;

    models.forEach(function(model) {
      // skip any promises that aren't loaded
      // TODO: think through edge cases in depth
      // XXX:
      // if(!model.isLoaded) {
      //   return;
      // }

      var shadow = shadows.getModel(model);

      console.assert(shadow || model.isNew, "Shadow does not exist for non-new model");

      var op = this.getOp(model);
      op.shadow = shadow;

      var rels = op.dirtyRelationships;
      for(var i = 0; i < rels.length; i++) {
        var d = rels[i];
        var name = d.name;
        var parentModel = model[name] || d.oldValue && shadows.getModel(d.oldValue);
        // embedded children should not be dependencies
        var isEmbeddedRel = adapter.embeddedType(model.constructor, name);

        // TODO: handle hasMany's depending on adapter configuration
        if(parentModel && !isEmbeddedRel) {
          var parentOp = this.getOp(parentModel);
          parentOp.addChild(op);
        }
      }

      var isEmbedded = adapter.isEmbedded(model);

      if(op.isDirty && isEmbedded) {
        // walk up the embedded tree and mark root as dirty
        var rootModel = adapter.findEmbeddedRoot(model, models);
        var rootOp = this.getOp(rootModel);
        rootOp.force = true;

        // ensure the embedded parent is a parent of the operation
        var parentModel = adapter._embeddedManager.findParent(model);
        var parentOp = this.getOp(parentModel);

        // if the child already has some parents, they need to become
        // the parents of the embedded root as well
        op.parents.forEach(function(parent) {
          if(parent === rootOp) return;
          if(adapter.findEmbeddedRoot(parent.model, models) === rootModel) return;
          parent.addChild(rootOp);
        });

        parentOp.addChild(op);
      }

    }, this);
  }

  getOp(model) {
    // ops is is a normal Ember.Map and doesn't use client
    // ids so we need to make sure that we are looking up
    // with the correct model instance
    var models = this.models,
        materializedModel = models.getModel(model);
    // TODO: we do this check since it is possible that some
    // lazy models are not part of `models`, a more robust
    // solution needs to be figured out for dealing with operations
    // on lazy models
    if(materializedModel) model = materializedModel;
    var op = this.ops.get(model);
    if(!op) {
      op = new Operation(model, this, this.adapter, this.session);
      this.ops.set(model, op);
    }
    return op;
  }

}
