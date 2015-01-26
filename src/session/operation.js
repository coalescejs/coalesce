import Coalesce from '../namespace';
import array_from from '../utils/array_from';

/**
@private
An operation that is part of a flush

@namespace rest
@class Operation
*/
export default class Operation {
  constructor(flush, model, shadow, opts) {
    this.model = model;
    this.shadow = shadow;
    this.opts = opts;
    this.flush = flush;
    this.adapter = this.flush.session.context.configFor(model).get('adapter');
    this.session = this.flush.session;
    // forces the operation to be performed
    this.force = false
    this.children = new Set();
    this.parents = new Set();
    this.promise = new Coalesce.Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  
  then(...args) {
    return this.promise.then.apply(this.promise, ...args);
  }
  
  catch(...args) {
    return this.promise.catch.apply(this.promise, ...args);
  }
  
  addChild(child) {
    this.children.add(child);
    child.parents.add(this);
  }
  
  get diff() {
    return this.model.diff(this.shadow);
  }
  
  perform() {
    var promise,
        model = this.model;
    
    // perform after all parents have performed
    if(this.parents.size > 0) {
      promise = Coalesce.Promise.all(array_from(this.parents)).then( () => {
        return this._perform();
      });
    } else {
      promise = this._perform();
    }
    
    // in the case of new records we need to assign the id
    // of the model so dependent operations can use it
    // serverModel could be null (e.g. an embedded record removed from its parent)
    promise = promise.then(function(serverModel) {
      if(serverModel && !model.id) {
        model.id = serverModel.id;
      }
      return serverModel;
    });
    
    // TODO: do we need to wait for children?
    if(this.children.size > 0) {
      promise = promise.then((model) => {
        return Coalesce.Promise.all(array_from(this.children)).then(function(models) {
          return model;
        }, function(models) {
          throw model;
        });
      });
    }
    
    this.resolve(promise);
    return this;
  }
  
  // Fail this operation. This is called externally when this operation's
  // dependencies fail
  fail() {
    var errors = this.adapter.serializerFactory.serializerFor('errors');
    // TODO: for now just set a status code, need to think through differentiating
    // types of errors, especially ones that are not field-specific
    errors.status = 0;
    this.model.errors = errors;
    return this.model;
  }
  
  get isDirty() {
    return this.adapter.isDirty(this.model, this.shadow);
  }
  
  // determine which relationships are affected by this operation
  // TODO: we should unify this with dirty checking
  get dirtyRelationships() {
    var adapter = this.adapter,
    model = this.model,
    rels = [],
    shadow = this.shadow;
    
    if(model.isNew) {
      // if the model is new, all relationships are considered dirty
      model.eachRelationship(function(name, relationship) {
        if(adapter.isRelationshipOwner(relationship)) {
          rels.push({name: name, type: relationship.kind, relationship: relationship, oldValue: null});
        }
      }, this);
    } else {
      // otherwise we check the diff to see if the relationship has changed,
      // in the case of a delete this won't really matter since it will
      // definitely be dirty
      var diff = this.diff;
      for(var i = 0; i < diff.length; i++) {
        var d = diff[i];
        if(d.relationship && adapter.isRelationshipOwner(d.relationship)) {
          rels.push(d);
        }
      }
    }
    
    return rels;
  }
  
}

class PersistOperation extends Operation {
  
  _perform() {
    var adapter = this.adapter,
        session = this.session,
        model = this.model,
        shadow = this.shadow,
        opts = this.opts;
            
    if(this.force || this.isDirty) {
      return adapter.persist(model, shadow, null, opts, session);
    } else {
      return Coalesce.Promise.resolve(model);
    }
  }
  
}

export {PersistOperation};

/**
  @private
  
  Piggy-back on the embedded parent.
*/
class EmbeddedOperation extends Operation {
  
  addChild(child) {
    this.embeddedParent.addChild(child);
  }
  
  _perform() {
    var model = this.model,
    adapter = this.adapter;
    
    function findInParent(parentModel) {
      var res = null;
      parentModel.eachRelatedModel(function(child, embeddedType) {
        if(res) return;
        if(child.isEqual(model)) res = child;
      });
      return res;
    }
    
    return this.embeddedParent.then(function(parent) {
      return findInParent(parent);
    }, function(parent) {
      throw findInParent(parent);
    });
  }
  
}

export {EmbeddedOperation};
