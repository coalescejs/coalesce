/**
  @namespace factory
  @class MergeFactory
*/
export default class QueryCacheFactory {

  constructor(container) {
    this.container = container;
  }

  queryCacheFor(typeKey) {
    console.assert(typeof typeKey === 'string', 'Passed in typeKey must be a string');
    var queryCache = this.container.lookup('query-cache:' + typeKey);
    // if none exists, create and register a default
    if(!queryCache) {
      var QueryCache = this.container.lookupFactory('query-cache:default');
      this.container.register('query-cache:' + typeKey, QueryCache);
      queryCache = this.container.lookup('query-cache:' + typeKey);
    }
    queryCache.typeKey = typeKey;
    return queryCache;
  }

}
