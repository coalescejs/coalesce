import Relationship from './relationship';

// TODO: entityWillChange/entityDidChange
export default class BelongsTo extends Relationship {
  
  get isLoaded() {
    return this._value !== undefined;
  }
  
  get() {
    if(this.isDetached) {
      return this._value;
    } else {
      return this._value && this.graph.getByClientId(this._value);
    }
  }
  
  set(model) {
    var session = this.session,
        owner = this.owner;
        
    if(owner) {
      owner.relationshipWillChange(this.field.name);
    }
    
    if(session) {
      session.touch(this);
      this.suspendInverseUpdates(() => {
        var inverse = this.inverse;
        if(inverse) {
          inverse.inverseWillRemove(this);
        }
      });
    }
    
    this._set(model);
    
    if(session) {
      this.suspendInverseUpdates(() => {
        var inverse = this.inverse;
        if(inverse) {
          inverse.inverseDidAdd(this);
        }
      });
    }
    
    if(owner) {
      owner.relationshipDidChange(this.field.name);
    }
    
    return model;
  }
  
  _set(model) {
    if(this.isDetached) {
      return this._value = model;
    } else {
      if(model) {
        model = this.graph.adopt(model);
      }
      return this._value = model && model.clientId;
    }
  }
  
  get inverse() {
    var model = this.get();
    if(!model) {
      return;
    }
    var inverse = this.inverseFor(model);
    if(inverse) {
      return inverse;
    }
  }
  
  *entities() {
    var model = this.get();
    if(model) {
      yield model;
    }
  }
  
  inverseWillRemove(inverse) {
    if(this._suspendInverseUpdates) return;
    this.set(null);
  }
  
  inverseDidAdd(inverse) {
    if(this._suspendInverseUpdates) return;
    this.set(inverse.owner);
  }
  
  fork(graph) {
    var dest = graph.fetch(this),
        value = this.get();
    if(this.isLoaded) {
      dest.set(value);
    }
    return dest;
  }
}
