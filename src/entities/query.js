import EntityArray from '../collections/entity_array';  

/**
  Represents a query.
  
  TODO session aliased methods
*/
export default class Query extends EntityArray {
  
  constructor(session, type, params) {
    this.session = session;
    this._type = type;
    this._params = params;
    this._hints = {};
    super();
  }
  
  get params() {
    return this._params;
  }
  
  get type() {
    return this._type;
  }
  
  get clientId() {
    return this.constructor.clientId(this.type, this.params);
  }
  
  static clientId(type, params) {
    return type.typeKey + '$' + JSON.stringify(params);
  }
  
}
