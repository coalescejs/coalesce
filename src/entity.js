/**
 * An entity is always associated with a Graph.
 */
export default class Entity {

  _tracking = 0;

  constructor(graph) {
    console.assert(graph, `Entity must be associated with a graph`);
    this._graph = graph;
    if(graph.isSession) {
      this._session = graph;
    }
  }

  /**
   * The graph this entity is a part of.
   *
   * @return {Graph}
   */
  get graph() {
    return this._graph;
  }


  /**
   * The session the entity is associated with (if at all). This is the same
   * object as the graph, but all graphs are not necessarily sessions.
   *
   * @return {Session}
   */
  get session() {
    return this._session;
  }

  get isEntity() {
    return true;
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
   * Similar to `fork`, but has no data aside from identifiers.
   *
   * @param  {type}   graph the graph to add to
   * @return {Entity}       the new instance
   */
  ref(graph) {
    return new this.constructor(graph);
  }

  /**
   * Fork this entity to the destination graph.
   *
   * @param  {type}   graph the graph to add to
   * @return {Entity}       the new instance
   */
  fork(graph) {
    let fork = this.ref(graph);
    fork.assign(this);
    return fork;
  }

  /**
   * @private
   *
   * Batches mutations and updates the local revision.
   */
  withChangeTracking(fn) {
    try {
      if(this._tracking++ === 0) {
        // TODO: think through the .has check here. The reason for it is to deal
        // with initializing attributes inside the model's constructor
        if(this.session && this.session.has(this)) {
          this.session.touch(this);
        }
      }
      fn.call(this, this._data);
    } finally {
      this._tracking--;
    }
  }

  toString() {
    return `${this.constructor.name}<${this.clientId}>`;
  }


  /**
   * Load the entity. This is equivalent to calling `session.load(entity)`.
   *
   * @return {Promise}
   */
  load(...args) {
    console.assert(this.session, "Must be associated with a session");
    return this.session.load(this, ...args);
  }

  isEqual(other) {
    console.assert(this.clientId && other.clientId, "Must have clientId's set");
    return other.clientId === this.clientId;
  }
  
}
