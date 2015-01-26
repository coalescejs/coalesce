export default class Entity {
  
  constructor() {
  }
  
  get graph() {
    return this._graph;
  }
  
  set graph(value) {
    return this._graph = value;
  }
  
  get session() {
    if(this._graph && this._graph.isSession) {
      return this._graph;
    }
    return null;
  }
  
  set session(value) {
    console.assert(!this._session || this._session === value, "Cannot re-assign a model's session");
    this._session = value;
  }
  
}

Entity.prototype._graph = null;
Entity.prototype.isEntity = true;
