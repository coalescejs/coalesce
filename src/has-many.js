import Collection from './collection';
import HasManySerializer from './serializers/has-many';

export default class HasMany extends Collection {

  static serializer = HasManySerializer;

  constructor(graph, owner, name, iterable) {
    super(graph, iterable);
    this._ownerClientId = owner.clientId;
    this.name = name;
    // NOTE: there is a race condition where we cannot compute the clientId
    // when we need it because the owner hasn't been added to the graph yet.
    // This takes place if we populate the relationship via a constructor. To
    // get around this, we eagerly compute the clientId while we have the owner
    // at hand.
    this.clientId = this.constructor.clientId(owner, name);
  }

  get owner() {
    let clientId = this._ownerClientId;
    return this.graph.get({clientId});
  }

  static clientId(owner, name) {
    return `${owner.clientId}$${name}`;
  }

}
