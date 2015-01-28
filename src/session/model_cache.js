import PromiseCache from './promise_cache';

/**
  Maintains a cache of model-related promises

  @class ModelCache
*/
export default class ModelCache extends PromiseCache {

  // for now we only add the model if some attributes are loaded,
  // eventually this will be on a per-attribute basis
  shouldCache(model) {
    return model.isPartiallyLoaded;
  }


}
