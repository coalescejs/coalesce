import EntitySerializer from './entity';
import Collection from '../collection';
import Graph from '../graph';

/**
 * Serializes collections.
 */
export default class CollectionSerializer extends EntitySerializer {
  get type() {
    return Collection;
  }

  serialize(collection) {
    return Array.from(collection).map(entity => {
      let serializer = this.serializerFor(entity.typeKey);
      return serializer.serialize(entity);
    });
  }

  deserialize(data, graph = this.container.get(Graph), itemType, ...args) {
    return this.create(
      graph,
      this.type,
      itemType,
      ...args,
      data.map(hash => {
        // allow raw ids
        if (typeof hash !== 'object') {
          hash = { id: hash };
        }
        let serializer = this.serializerFor(itemType);
        return serializer.deserialize(hash, graph, { type: itemType });
      })
    );
  }
}
