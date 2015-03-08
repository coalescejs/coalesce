import Coalesce from '../namespace';
import BaseClass from '../utils/base_class';

/**
  Maintains a cache of entity-related promises

  @class PromiseCache
*/
export default class PromiseCache extends BaseClass {

  constructor() {
    this.clear();
  }

  add(entity, promise=null) {
    if(this.shouldCache(entity) || promise) {
      if(!promise) {
        promise = Coalesce.Promise.resolve(entity);
      }
      this._promises[entity.clientId] = promise;
    }
    // unlike query cache, we get the "entry" from the session directly
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
