import Entity from './entity';

export default class Relationship extends Entity {
  
  constructor(owner, field) {
    this.owner = owner;
    this._field = field;
    this._suspendInverseUpdates = false;
  }
  
  get clientId() {
    return this.constructor.clientId(this._ownerClientId || this.owner.clientId, this.field);
  }
  
  get field() {
    return this._field;
  }
  
  get type() {
    return this.field.type;
  }
  
  get typeKey() {
    return this.field.typeKey;
  }
  
  get isEmbedded() {
    return this.field.isEmbedded;
  }
  
  get isNew() {
    var owner = this.owner;
    return owner && owner.isNew;
  }
  
  get owner() {
    if(this.isDetached) {
      return this._owner;
    } else {
      return this._ownerClientId && this.graph.getByClientId(this._ownerClientId)
    }
  }
  
  set owner(value) {
    this._ownerClientId = value && value.clientId;
    if(this.isDetached) {
      this._owner = value;
    }
    return value;
  }
  
  get context() {
    return this._field.context;
  }
  
  suspendInverseUpdates(callback, binding) {
    // could be nested
    if(this._suspendInverseUpdates) {
      return callback.call(binding || this);
    }

    try {
      this._suspendInverseUpdates = true;
      callback.call(binding || this);
    } finally {
      this._suspendInverseUpdates = false;
    }
  }
  
  inverseFor(model) {
    var inverseDescriptor = this.field.inverse;
    if(!inverseDescriptor) {
      return null;
    }
    return model.getRelationship(inverseDescriptor.name);
  }
  
  unloadedCopy() {
    return new this.constructor(
      this.owner,
      this.field
    );
  }
  
  static clientId(ownerClientId, field) {
    console.assert(ownerClientId, "Owner must have a clientId set");
    return `${ownerClientId}$${field.name}`;
  }
  
}

Relationship.prototype.isRelationship = true;
