export default class Entity {
  
  get graph() {
    return this._graph;
  }
  
  set graph(value) {
    console.assert(!this._graph, "Cannot move an entity between graphs, consider using adopt instead")
    return this._graph = value;
  }
  
  get session() {
    if(this.graph && this.graph.isSession) {
      return this.graph;
    }
    return null;
  }
  
  isEqual(entity) {
    if(!entity) return false;
    console.assert(this.clientId && entity.clientId, "Must have clientId set");
    return this.clientId === entity.clientId;
  }
  
  get isDetached() {
    return !this.graph;
  }

  get isManaged() {
    return !!this.graph;
  }
  
  get hasSession() {
    return !!this.session;
  }
  
  get isDirty() {
    if(this.session) {
      return this.session.isEntityDirty(this);
    } else {
      return false;
    }
  }
  
  lazyFork(childSession) {
    console.assert(!childSession.has(this), "Model already exists in child session");
    return this.fork(childSession);
  }

}

Entity.prototype._graph = null;
Entity.prototype.isEntity = true;
