import PromiseCache from './promise_cache';

/**
  Maintains a cache of query-related promises

  @class QueryCache
*/
export default class QueryCache extends PromiseCache {

  // for now we only add the model if some attributes are loaded,
  // eventually this will be on a per-attribute basis
  shouldCache(query) {
    return query.isLoaded;
  }


}
