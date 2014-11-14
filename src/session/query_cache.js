import Coalesce from '../namespace';

/**
  Maintains a cache of query-related promises

  @class QueryCache
*/
export default class QueryCache {

  constructor({session}) {
    this.session = session;
    this._queries = {};
    this._promises = {};
  }

  add(query, promise=null) {
    var key = this.keyFor(query.type, query.params);
    
    if(promise && this.shouldCache(query)) {
      this._promises[key] = promise;
    }
    
    this._queries[key] = query;
  }
  
  remove(query) {
    var key = this.keyFor(query.type, query.params);
    delete this._queries[key];
    delete this._promises[key];
  }
  
  removeAll(type) {
    var queries = this._queries;
    for(var key in queries) {
      if(!queries.hasOwnProperty(key)) continue;
      var typeKey = key.split('$')[0];
      if(type.typeKey === typeKey) {
        this.remove(queries[key]);
      }
    }
  }
  
  getQuery(type, params) {
    var key = this.keyFor(type, params);
    return this._queries[key];
  }
  
  getPromise(query) {
    var key = this.keyFor(query.type, query.params),
        cached =  this._promises[key];
    if(cached && this.shouldInvalidate(cached)) {
      this.remove(cached);
      return;
    }
    return cached;
  }
  
  keyFor(type, params) {
    var stringifiedParams = (params === undefined) ? "{}" : JSON.stringify(params)
    return type.typeKey + '$' + stringifiedParams;
  }
  
  shouldCache(query) {
    return true;
  }

  /**
    Applies a callback to each query in the queries object
  */
  forEachQuery(callback, binding) {
    var queries = this._queries;
    for(var key in queries) {
      if(!queries.hasOwnProperty(key)) continue;
      
      queries[key] = callback.call(binding, queries[key]);
    }
  }

  shouldInvalidate(query) {
    return false;
  }
  
  destroy() {
    // NOOP: needed for Ember's container
  }
  
  static create(props) {
    return new this(props);
  }


}
