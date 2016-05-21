import EntitySet from './utils/entity-set';
import IdManager from './id-manager';

/**
 * All entities are associated with a Graph. The graph contains the list of all
 * entities and is responsible for "reifying" entities with a proper clientId.
 */
export default class Graph extends EntitySet {

  static dependencies = [IdManager];

  constructor(idManager) {
    super();
    this._idManager = idManager;
  }


  /**
   * @override
   */
  add(entity) {
    console.assert(entity.graph === this, 'Cannot add entity to a different graph');
    console.assert(!this.has(entity) || this.get(entity) === entity, 'Equivalent entity is already part of the graph');
    this._idManager.reifyClientId(entity);
    return super.add(entity);
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
    this._idManager.reifyClientId(entity);
    let res = this.get(entity);
    if(!res) {
      res = entity.ref(this);
      this.add(res);
    }
    return res;
  }


  /**
   * Similar to fetch, but also updates the data of the entity.
   *
   * @param  {Entity} entity the entity to fetch
   * @return {Entity}        the updated entity
   */
  update(entity) {
    this._idManager.reifyClientId(entity);
    let target = this.fetch(entity);
    return target.assign(entity);
  }

}
