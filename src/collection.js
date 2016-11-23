import Entity from './entity';

import Immutable from 'immutable';

export default class Collection extends Entity {

  static defaults = Immutable.List();

  _data = this.constructor.defaults;

  constructor(graph, iterable) {
    super(graph);
    if(iterable) {
      this._loaded = true;
      function* clientIds(iterable) {
        for(var entity of iterable) {
          yield entity.clientId;
        }
      }
      this._data = Immutable.List(clientIds(iterable));
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
    let clientId = this._data.get(index);
    if(!clientId) {
      return;
    }
    return this.graph.get({clientId});
  }

  splice(index, removeNum, ...values) {
    values = values.map((v) => v.clientId);
    this._loaded = true;
    this.withChangeTracking(() => {
      this._willChange(index, removeNum, values.length);
      this._data = this._data.splice(index, removeNum, ...values);
      this._didChange(index, removeNum, values.length);
    });
  }

  push(value) {
    this.splice(this._data.size - 1, 0, value);
  }

  pop() {
    this.splice(this._data.size - 1, 1);
  }

  shift(value) {
    this.splice(0, 0, value);
  }

  unshift() {
    this.splice(0, 1);
  }

  get size() {
    return this._data.size;
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
