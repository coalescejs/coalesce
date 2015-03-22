import Coalesce from '../namespace';
import array_from from '../utils/array_from';

/**
@private
An operation that is part of a flush

@namespace rest
@class Operation
*/
export default class Operation {
  constructor(flush, entity, shadow, opts) {
    this.entity = entity;
    this.shadow = shadow;
    this.opts = opts;
    this.flush = flush;
    this.adapter = this.flush.session.context.configFor(entity).get('adapter');
    this.session = this.flush.session;
    // forces the operation to be performed
    this.force = false
    this.children = new Set();
    this.embeddedChildren = new Set();
    this.parents = new Set();
    this.promise = new Coalesce.Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  
  then(...args) {
    return this.promise.then.apply(this.promise, args);
  }
  
  catch(...args) {
    return this.promise.catch.apply(this.promise, args);
  }
  
  addChild(child) {
    this.children.add(child);
    child.addParent(this);
  }
  
  addParent(parent) {
    this.parents.add(parent);
  }
  
  addEmbeddedChild(child) {
    this.embeddedChildren.add(child);
    console.assert(!child.embeddedParent, "operation already has an embedded parent");
    child.embeddedParent = this;
  }
  
  get diff() {
    return this.entity.diff(this.shadow);
  }
  
  perform() {
    var promise,
        entity = this.entity;
    
    // perform after all parents have performed
    if(this.parents.size > 0) {
      promise = Coalesce.Promise.all(array_from(this.parents)).then( () => {
        return this._perform();
      });
    } else {
      promise = this._perform();
    }
    
    // in the case of new records we need to assign the id
    // of the entity so dependent operations can use it
    // serverModel could be null (e.g. an embedded record removed from its parent)
    promise = promise.then(function(serverModel) {
      if(entity.isModel && serverModel && !entity.id) {
        entity.id = serverModel.id;
      }
      return serverModel;
    });
    
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
    this.entity.errors = errors;
    return this.entity;
  }
  
  get isDirty() {
    if(!this.shadow || this.entity.isNew) {
      return true;
    }
    var diff = this.entity.diff(this.shadow);
    if(diff.length > 0) {
      return true;
    }
    
    for(var embeddedChild of this.embeddedChildren) {
      if(embeddedChild.isDirty) {
        return true;
      }
    }
    
    return false;
  }
  
}

class PersistOperation extends Operation {
  
  _perform() {
    var adapter = this.adapter,
        session = this.session,
        entity = this.entity,
        shadow = this.shadow,
        opts = this.opts;
    
    if(this.force || this.isDirty) {
      return adapter.persist(entity, shadow, opts, session);
    } else {
      return Coalesce.Promise.resolve(entity);
    }
  }
  
}

export {PersistOperation};

/**
  @private
  
  Piggy-back on the embedded parent.
*/
class EmbeddedOperation extends Operation {
  
  addParent(parent) {
    return this.embeddedParent.addParent(parent);
  }
  
  _perform() {
    var findInParent = (parent) => {
      for(var child of parent.entities()) {
        if(child.isEqual(this.entity)) {
          return child;
        }
      }
      return null;
    }
    
    return this.embeddedParent.then(function(parent) {
      return findInParent(parent);
    }, function(parent) {
      throw findInParent(parent);
    });
  }
  
}

export {EmbeddedOperation};
