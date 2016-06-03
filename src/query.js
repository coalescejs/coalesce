import Collection from './collection';
import QuerySerializer from './serializers/query';

export default class Query extends Collection {

  static serializer = QuerySerializer;

  constructor(graph, type, params, iterable) {
    super(graph, iterable);
    this.clientId = this.constructor.clientId(type, params);
    this.type = type;
    this.params = params;
  }

  get isQuery() {
    return true;
  }

  /**
   * @override
   */
  ref(graph) {
    return new this.constructor(graph, this.type, this.params);
  }

  static clientId(type, params) {
    return `$${type.typeKey}$${JSON.stringify(params)}`;
  }

}
