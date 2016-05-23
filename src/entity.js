/**
 * An entity is always associated with a Graph.
 */
export default class Entity {

  _tracking = 0;

  constructor(graph) {
    console.assert(graph, `Entity must be associated with a graph`);
    this._graph = graph;
  }

  /**
   * The graph this entity is a part of.
   */
  get graph() {
    return this._graph;
  }

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
    this._data = source._data;
    return this;
  }


  /**
   * Similar to `clone`, but has no data aside from identifiers.
   *
   * @param  {type}   graph the graph to add to
   * @return {Entity}       the new instance
   */
  ref(graph) {
    return new this.constructor(graph);
  }

  /**
   * Clone this entity to the destination graph.
   *
   * @param  {type}   graph the graph to add to
   * @return {Entity}       the new instance
   */
  clone(graph) {
    let clone = this.ref(graph);
    clone.assign(this);
    return clone;
  }


  /**
   * @private
   *
   * Batches mutations and updates the local revision.
   */
  withChangeTracking(fn) {
    try {
      if(this._tracking++ === 0) {
        if(this.session) {
          this.session.touch(this);
        }
      }
      fn.call(this, this._data);
    } finally {
      this._tracking--;
    }
  }

}
