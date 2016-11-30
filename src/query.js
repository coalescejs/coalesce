import Collection from './collection';
import QuerySerializer from './serializers/query';

import CachingStrategy from './caching-strategy';

export default class Query extends Collection {

  static serializer = QuerySerializer;
  static cachingStrategy = CachingStrategy;

  constructor(graph, type, params, iterable) {
    super(graph, iterable);
    this.clientId = this.constructor.clientId(this.graph.idManager, type, params);
    this.type = type;
    this.params = this.constructor.normalizeParams(params);
  }

  get isQuery() {
    return true;
  }

  get isTransient() {
    return !this._parent;
  }

  /**
   * @override
   */
  ref(graph) {
    return new this.constructor(graph, this.type, this.params);
  }

  static clientId(idManager, type, params) {
    params = this.normalizeParams(params);
    return `$${type.typeKey}$${JSON.stringify(params)}`;
  }

  static normalizeParams(params) {
    params = {...params};
    for(var key in params) {
      if(!params.hasOwnProperty(key)) {
        continue;
      }
      let value = params[key];
      // TODO: handle enumerables
      if(value.isModel) {
        params[key] = value.clientId;
      }
    }
    return params;
  }

}
