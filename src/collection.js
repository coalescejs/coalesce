import Entity from './entity';

export default class Collection extends Entity {

  _data = [];

  constructor(graph, iterable) {
    super(graph);
    if(iterable) {
      this._loaded = true;
      function* clientIds(iterable) {
        for(var entity of iterable) {
          yield entity.clientId;
        }
      }
      this._data = Array.from(clientIds(iterable));
    }
  }

  // currently all collections are transient
  get isTransient() {
    return true;
  }

  get isCollection() {
    return true;
  }

  *[Symbol.iterator]() {
    for(var clientId of this._data) {
      yield this.graph.get({clientId});
    }
  }

  /**
   * @deprecated
   */
  forEach(...args) {
    return Array.from(this).forEach(...args);
  }

  /**
   * @deprecated
   * Use `Array.from` directly
   */
  toArray() {
    return Array.from(this);
  }

  /**
   * @deprecated
   */
  map(...args) {
    return Array.from(this).map(...args);
  }

  /**
   * @deprecated
   */
  filter(...args) {
    return Array.from(this).filter(...args);
  }

  get(index) {
    let clientId = this._data[index];
    if(!clientId) {
      return;
    }
    return this.graph.get({clientId});
  }

  splice(index, removeNum, ...values) {
    values = values.map((v) => v.clientId);
    this._loaded = true;
    return this.withChangeTracking(() => {
      this._willChange(index, removeNum, values.length);
      let clientIds = this._data.splice(index, removeNum, ...values);
      this._didChange(index, removeNum, values.length);
      return clientIds.map((clientId) => this.graph.get({clientId}));
    });
  }

  push(value) {
    this.splice(this._data.length, 0, value);
    return this._data.length;
  }

  pop() {
    if(this._data.length === 0) {
      return;
    }
    return this.splice(this._data.length - 1, 1)[0];
  }

  unshift(value) {
    this.splice(0, 0, value);
    return this._data.length;
  }

  shift() {
    if(this._data.length === 0) {
      return;
    }
    this.splice(0, 1);
  }

  get size() {
    return this._data.length;
  }

  _willChange(index, removed, added) {
  }

  _didChange(index, removed, added) {
    // This is ugly, but is necessary to bookkeep embedded entities
    if(this._parent) {
      for(let i = index; i < index + added; i++) {
        let entity = this.get(i);
        entity._parent = this.clientId;
      }
    }
  }

  /**
   * @override
   */
  *relatedEntities() {
    yield* this;
  }

}
