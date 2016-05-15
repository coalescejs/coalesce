/**
  Maintains a cache of entity-related promises
*/
export default class Cache {

  constructor() {
    this.clear();
  }

  add(entity, promise=null) {
    if(this.shouldCache(entity) || promise) {
      if(!promise) {
        promise = Promise.resolve(entity);
      }
      this._promises[entity.clientId] = promise;
    }
  }

  remove(entity) {
    delete this._promises[entity.clientId];
  }

  clear() {
    this._promises = {};
  }

  getPromise(entity) {
    console.assert(entity.clientId, "Model does not have a client id");

    var cached = this._promises[entity.clientId];
    if(cached && this.shouldInvalidate(cached)) {
      this.remove(cached);
      return;
    }
    return cached;
  }

  // for now we only add the entity if some attributes are loaded,
  // eventually this will be on a per-attribute basis
  shouldCache(entity) {
    return entity.isLoaded;
  }

  shouldInvalidate(entity) {
    return false;
  }

}
