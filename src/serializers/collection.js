import EntitySerializer from './entity';
import Collection from '../collection';

/**
 * Serializes collections.
 */
export default class CollectionSerializer extends EntitySerializer {

  get type() {
    return Collection;
  }

  serialize(collection) {
    return Array.from(collection).map(function(entity) {
      return entity.clientId;
    });
  }

  deserialize(graph, data, ...args) {
    let self = this;
    return this.create(graph, this.type, ...args, data.map(function(hash) {
      const {type} = hash;
      let serializer = self.serializerFor(type);
      return serializer.deserialize(graph, hash);
    }));
  }


}
