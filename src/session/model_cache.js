import Coalesce from '../namespace';

/**
  Maintains a cache of model-related promises

  @class ModelCache
*/
export default class ModelCache {

  constructor() {
    this._promises = {};
  }

  add(model, promise=null) {
    if(this.shouldCache(model)) {
      if(!promise) {
        promise = Coalesce.Promise.resolve(model);
      }
      this._promises[model.clientId] = promise;
    }
    // unlike query cache, we get the "entry" from the session directly
  }

  remove(model) {
    delete this._promises[model.clientId];
  }

  getPromise(model) {
    console.assert(model.clientId, "Model does not have a client id");

    var cached = this._promises[model.clientId];
    if(cached && this.shouldInvalidate(cached)) {
      this.remove(cached);
      return;
    }
    return cached;
  }
  
  // for now we only add the model if some attributes are loaded,
  // eventually this will be on a per-attribute basis
  shouldCache(model) {
    return model.isPartiallyLoaded;
  }

  shouldInvalidate(model) {
    return false;
  }
  
  destroy() {
    // NOOP: needed for Ember's container
  }
  
  static create(props) {
    return new this(props);
  }


}
