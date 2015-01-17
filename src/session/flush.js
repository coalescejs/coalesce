import Coalesce from '../namespace';
import Graph from '../collections/graph';
import Operation from './operation';
import array_from from '../utils/array_from';

var remove = _.remove;

export default class Flush {
  
  constructor(session, models) {
    this.session = session;
    this.ops = {};
    this.models = new Graph();
    this.shadows = new Graph();
    this.results = [];
    this.pending = [];
    this.promise = new Coalesce.Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
  }
  
  then(...args) {
    this.promise.then.apply(this.promise, ...args);
  }
  
  catch(...args) {
    this.promise.catch.apply(this.promise, ...args);
  }
  
  add(model, opts) {
    var op;
    if(op = this.ops[model.client]) {
      return op;
    }
    
    if(model.session !== this.session) {
      model = this.session.getModel(model);
    }
    
    var shadow = this.session.shadows.get(model);
    // take a snapshot of the mode/shadow in this state
    model = model.fork(this.models);
    this.models.add(model);
    if(shadow) {
      shadow = shadow.fork(this.shadows);
      this.shadows.add(shadow);
    }
    
    if(model.isEmbedded) {
      op = this.ops[model.clientId] = new EmbeddedOperation(
        model,
        shadow,
        opts
      );
      op.embeddedParent = this.add(model._embeddedParent);
    } else {
      op = this.ops[model.clientId] = new PersistOperation(
        model,
        shadow,
        opts
      );
    }
    
    // all children that are part of a relationship that owned by
    // this model should be saved first
    var rels = op.dirtyRelationships;
    for(var i = 0; i < rels.length; i++) {
      var d = rels[i];
      var name = d.name;
      var parentModel = model[name] || d.oldValue;
      // embedded children should not be dependencies
      var isEmbeddedRel = this._isEmbeddedRelationship(model.constructor, name);
      if(parentModel && !isEmbeddedRel) {
        var parentOp = this.add(parentModel);
        parentOp.addChild(op);
      }
    }
    
    return op;
  }
  
  remove(model) {
    delete this.ops[model.clientId];
    this.models.remove(model);
    this.shadows.remove(model);
  }
  
  performLater() {
    Coalesce.run.once(this, this.perform);
  }
  
  perform() {
    var results = this.results,
        pending = this.pending,
        session = this.session;
        
    for(var clientId in this.ops) {
      if(!this.ops.hasOwnProperty(clientId)) continue;
      var op = this.ops[clientId];
      this._trackOperation(op.perform());
    }
    
    var promise = Coalesce.Promise.all(this.pending).then(function() {
      return results;
    }, function(err) {
      // all the promises that haven't finished, we need still merge them into
      // the session for error resolution
      var failures = pending.map(function(op) {
        // TODO: fail with special error 
        var model = op.fail();
        session.merge(model);
        return model;
      });
      return results.concat(failures);
    });
    
    this.resolve(promise);
    return this;
  }
  
  _trackOperation(op) {
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
  
  _isEmbeddedRelationship(type, name) {
    return type.fields.get(name).embedded;
  }
  
}
