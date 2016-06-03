import IdManager from '../id-manager';
import Graph from '../graph';
import Container from '../container';

/**
 * Serializes collections.
 */
export default class EntitySerializer {

  static singleton = true;
  static dependencies = [Container, IdManager];

  constructor(container, idManager) {
    this._container = container;
    this._idManager = idManager;
  }

  serialize(entity) {

  }

  deserialize(graph, data,...args) {

  }

  create(graph, type, ...args) {
    return graph.fetchBy(type, ...args);
  }

  typeFor(type) {
    return this._container.typeFor(type);
  }

  serializerFor(type) {
    return this._container.serializerFor(type);
  }

}
