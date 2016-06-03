import EntitySet from './utils/entity-set';
import IdManager from './id-manager';
import Container from './container';

/**
 * All entities are associated with a Graph. The graph contains the list of all
 * entities and is responsible for "reifying" entities with a proper clientId.
 */
export default class Graph extends EntitySet {

  static dependencies = [Container];

  constructor(container) {
    super();
    this.container = container;
    this.idManager = container.get(IdManager);
  }

  /**
   * Build an instance of the type. Unlike `create`, this will not mark the
   * entity for creation.
   *
   * @param  {*}      type type identifier
   * @param  {object} hash initial attributes
   * @return {Model}       instantiated model
   */
  build(type, ...args) {
    type = this.container.typeFor(type);
    let entity = new type(this, ...args);
    this.add(entity);
    return entity;
  }

  /**
   * @override
   */
  add(entity) {
    console.assert(entity.graph === this, 'Cannot add entity to a different graph');
    console.assert(!this.has(entity), 'Equivalent entity is already part of the graph');
    return super.add(entity);
  }

  /**
   * Get the corresponding instance of the entity for this graph based on its
   * id or clientId.
   *
   * @param  {*}      type   type identifier
   * @param  {object} params hash containing `id` or `clientId`
   * @return {Entity}        the entity within this session
   */
  getBy(type, ...args) {
    type = this.container.typeFor(type);
    let clientId = this.idManager.getClientId(type, ...args);
    return this.get({clientId});
  }

  /**
   * Gets the existing entity within this graph that has the same `clientId` as
   * the passed in entity. If the entity does not exist, an unloaded entity in
   * this graph is created.
   *
   * @param  {Entity} entity the equivalent entity to retrieve
   * @return {Entity}        the equivalent entity within the graph
   */
  fetch(entity) {
    let res = this.get(entity);
    if(!res) {
      res = entity.ref(this);
      this.add(res);
    }
    return res;
  }

  /**
   * Similar to `.fetch()`, but takes a type and constructor arguments rather
   * than an actual instance.
   *
   * @param  {*}      type identifier
   * @param  {object} object containing an `id` property
   * @return {Entity} entity within the session
   */
  fetchBy(type, ...args) {
    type = this.container.typeFor(type);
    let entity = this.getBy(type, ...args);
    if(!entity) {
      entity = this.build(type, ...args);
    }
    return entity;
  }

  /**
   * Similar to fetch, but also updates the data of the entity.
   *
   * @param  {Entity} entity the entity to fetch
   * @return {Entity}        the updated entity
   */
  update(entity) {
    let target = this.fetch(entity);
    return target.assign(entity);
  }

}
