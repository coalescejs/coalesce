import Collection from './collection';
import QuerySerializer from './serializers/query';

export default class Query extends Collection {

  static serializer = QuerySerializer;

  constructor(graph, type, params) {
    super(graph);
    this.type = type;
    this.params = params;
  }

  get clientId() {
    return this.constructor.clientId(this.type, this.params);
  }

  static clientId(type, params) {
    return `$${type.typeKey}$${JSON.stringify(params)}`;
  }

}
