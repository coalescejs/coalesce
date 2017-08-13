import IdManager from '../id-manager';
import Graph from '../graph';
import Container from '../container';

/**
 * Abstract base class for entity serializers.
 */
export default class EntitySerializer {
  static singleton = true;
  static dependencies = [Container, IdManager];

  constructor(container, idManager) {
    this.container = container;
    this.idManager = idManager;
  }

  create(graph, type, ...args) {
    return graph.fetchBy(type, ...args);
  }

  typeFor(type) {
    return this.container.typeFor(type);
  }

  serializerFor(type) {
    return this.container.serializerFor(type);
  }

  typeFor(type) {
    return this.container.typeFor(type);
  }
}
