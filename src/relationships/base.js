// TODO: entityWillChange/entityDidChange
export default class Base {
  
  constructor(model, field) {
    this._owner = model.clientId;
    this._field = field;
  }
  
  get field() {
    return this._field;
  }
  
  get owner() {
    return this.graph.get(this._owner);
  }
  
  get clientId() {
    return this.constructor.clientId(owner, field);
  }
  
  get isLoaded() {
    return this._value !== undefined;
  }
  
  get() {
    return this.graph.get(this._value);
  }
  
  set(model) {
    this._value = model.clientId;
  }
  
  static clientId(field, model) {
    return `${model.clientId}$${field.name}`;
  }
  
  get context() {
    return this.session.context;
  }
  
  // TODO get raw relationship
  getInverse(model) {
    console.assert(model.constructor === this.field.type);
    var inverseType = this.field.type;

    if (this.field.inverse !== undefined) {
      return inverseType.schema.get(this.field.inverse);
    }
    
    for(var relationship of inverseType.schema.relationships) {
      if(relationship.type === this.field.type) {
        return relationship;
      }
    }
    
    return null;
  }
  
}

Base.prototype._value = null;
