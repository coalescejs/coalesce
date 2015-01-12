import Coalesce from '../namespace';
import ModelSet from '../collections/model_set';
import Operation from './operation';
import materializeRelationships from '../utils/materialize_relationships';
import array_from from '../utils/array_from';

var remove = _.remove;

export default class Flush {
  
  constructor(session, models) {
    this.session = session;
    this.models = this.buildDirtySet(models);
    this.shadows = new ModelSet(array_from(this.models).map(function(model) {
      // shadows are already frozen copies so no need to re-copy
      return session.shadows.getModel(model) || model.copy();
    }));
    this.results = [];
    this.pending = [];
    this.ops = new Map();
    this.build();
  }
  
  build() {
    var models = this.models,
        shadows = this.shadows,
        ops = this.ops,
        session = this.session;
        
    this.removeEmbeddedOrphans(models, shadows, session);
    
    // for embedded serialization purposes we need to materialize
    // all the lazy relationships in the set
    // (all of the copies have lazy models in their relationships)
    materializeRelationships(models);
    
    models.forEach(function(model) {
      
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
        var isEmbeddedRel = this.isEmbeddedRelationship(model.constructor, name);
        
        // TODO: handle hasMany's depending on adapter configuration
        if(parentModel && !isEmbeddedRel) {
          var parentOp = this.getOp(parentModel);
          parentOp.addChild(op);
        }
      }
      
      var isEmbedded = model.isEmbedded;
      if(op.isDirty && isEmbedded) {
        // walk up the embedded tree and mark root as dirty
        var rootModel = this.findEmbeddedRoot(model, models);
        var rootOp = this.getOp(rootModel);
        rootOp.force = true;
        
        // ensure the embedded parent is a parent of the operation
        var parentModel = model._parent;
        var parentOp = this.getOp(parentModel);
        
        // if the child already has some parents, they need to become
        // the parents of the embedded root as well
        op.parents.forEach(function(parent) {
          if(parent === rootOp) return;
          if(this.findEmbeddedRoot(parent.model, models) === rootModel) return;
          parent.addChild(rootOp);
        }, this);
        
        parentOp.addChild(op);
      }
      
    }, this);
  }
  
  /**
    @private
    Iterate over the models and remove embedded records
    that are missing their embedded parents.
  */
  removeEmbeddedOrphans(models, shadows, session) {
    var orphans = [];
    models.forEach(function(model) {
      if(!model.isEmbedded) return;
      var root = this.findEmbeddedRoot(model, models);
      if(!root || root.isEqual(model)) {
        orphans.push(model);
      }
    }, this);
    models.removeObjects(orphans);
    shadows.removeObjects(orphans);
  }
  
  findEmbeddedRoot(model, models) {
    var parent = model;
    while(parent) {
      model = parent;
      parent = model._parent;
    }
    // we want the version in the current session
    return models.getModel(model);
  }
  
  isEmbeddedRelationship(type, name) {
    return type.fields.get(name).embedded;
  }
  
  /**
    @private
    
    Build the set of dirty models that are part of the flush.
  */
  buildDirtySet(models) {
    var result = new ModelSet();
    models.forEach(function(model) {
      var copy = model.copy();
      copy.errors = null;
      result.add(copy);
    }, this);
    return result;
  }
  
  perform() {
    var results = this.results,
        pending = this.pending,
        session = this.session;
    
    this.ops.forEach(function(op, model) {
      op.perform();
      this.trackOperation(op);
    }, this); 
    
    return Coalesce.Promise.all(this.pending).then(function() {
      return results;
    }, function(err) {
      // all the promises that haven't finished, we need still merge them into
      // the session for error resolution
      var failures = pending.map(function(op) {
        var model =  op.fail();
        session.merge(model);
        return model;
      });
      return results.concat(failures);
    });
  }
  
  trackOperation(op) {
    var results = this.results,
        pending = this.pending;
    pending.push(op)
    op.then(function(model) {
      results.push(model);
      remove(pending, op);
      return model;
    }, function(model) {
      results.push(model);
      remove(pending, op);
      throw model;
    });
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
      op = new Operation(this, model, this.shadows.getModel(model));
      this.ops.set(model, op);
    }
    return op;
  }
  
}
