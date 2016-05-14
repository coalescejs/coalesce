/**
 * Either a Model or a collection. An entity can be associated with a session,
 * in which case it is a "managed" entity. An entity that is not associated
 * with a session is considered "detached".
 */
export default class Entity {

  /**
   * Iterate all related entities. Related entities correspond to relationships
   * and could be either a model (has one) or a collection (has many).
   *
   * @return {Iterator} the entities
   */
  *relatedEntities() {
  }

  /**
   * Copy all data from the source entity into this entity.
   *
   * @param  {type} source The source entity
   * @return {type}        this
   */
  assign(source) {
    return this;
  }

}
