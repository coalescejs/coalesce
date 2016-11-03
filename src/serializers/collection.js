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
    return Array.from(collection).map((entity) => {
      let serializer = this.serializerFor(entity.typeKey);
      return serializer.serialize(entity);
    });
  }

  deserialize(graph, data, ...args) {
    return this.create(graph, this.type, ...args, data.map((hash) => {
      const {type} = hash;
      let serializer = this.serializerFor(type);
      return serializer.deserialize(graph, hash);
    }));
  }


}
