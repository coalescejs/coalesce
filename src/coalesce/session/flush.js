import Coalesce from '../namespace';
import Graph from '../collections/graph';
import Operation from './operation';
import {PersistOperation, EmbeddedOperation} from './operation';
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
    return this.promise.then.apply(this.promise, args);
  }
  
  catch(...args) {
    return this.promise.catch.apply(this.promise, args);
  }
  
  add(entity, opts) {
    var op;
    if(op = this.ops[entity.clientId]) {
      return op;
    }
    
    if(entity.session !== this.session) {
      entity = this.session.getModel(entity);
    }
    
    var shadow = this.session.shadows.get(entity);
    // take a snapshot of the mode/shadow in this state
    entity = entity.fork(this.models);
    if(shadow) {
      shadow = shadow.fork(this.shadows);
    }
    
    var embeddedParent = this.embeddedParent(entity);
    if(embeddedParent) {
      op = this.ops[entity.clientId] = new EmbeddedOperation(
        this,
        entity,
        shadow,
        opts
      );
      var parentOp = this.add(embeddedParent);
      parentOp.addEmbeddedChild(op);
    } else {
      op = this.ops[entity.clientId] = new PersistOperation(
        this,
        entity,
        shadow,
        opts
      );
    }
    
    for(var embedded of entity.embeddedEntities()) {
      this.add(embedded);
    }
    
    for(var required of entity.requiredEntities()) {
      var requiredOp = this.add(required);
      requiredOp.addChild(op);
    }
    
    return op;
  }
  
  embeddedParent(entity) {
    // TODO: unify the notion of "embeddedness"
    return entity.isModel && entity._embeddedParent ||
      entity.isRelationship && entity.owner;
  }
  
  remove(entity) {
    delete this.ops[entity.clientId];
    this.models.remove(entity);
    this.shadows.remove(entity);
  }
  
  performLater() {
    Coalesce.backburner.deferOnce('actions', this, this.perform);
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
        var entity = op.fail();
        session.merge(entity);
        return entity;
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
    op.then(function(entity) {
      results.push(entity);
      remove(pending, op);
      return entity;
    }, function(entity) {
      results.push(entity);
      remove(pending, op);
      throw entity;
    });
  }
  
}
