import Entity from './entity';
import CollectionMerge from './merge/collection';

export default class Collection extends Entity {

  static merge = CollectionMerge;

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

  has(entity) {
    for(let current of this) {
      if(current.isEqual(entity)) {
        return true;
      }
    }
    return false;
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

  /**
   * @deprecated
   */
  every(...args) {
    return Array.from(this).every(...args);
  }

  /**
   * @deprecated
   */
  addObject(entity) {
    if(this.has(entity)) {
      return false;
    }
    this.pushObject(entity);
  }

  /**
   * @deprecated
   */
  pushObject(...args) {
    return this.push(...args);
  }

  /**
   * @deprecated
   */
  removeObject(entity) {
    for(let i = 0; i <= this._data.length; i++) {
      let clientId = this._data[i];
      if(entity.clientId === clientId) {
        this.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * @deprecated
   */
  setObjects(iterable) {
    this.splice(0, this.length, iterable);
  }

  get(index) {
    let clientId = this._data[index];
    if(!clientId) {
      return;
    }
    return this.graph.get({clientId});
  }

  splice(index, removeNum, ...values) {
    values = values.map((v) => {
      console.assert(v.clientId, "Must have clientId");
      return v.clientId;
    });
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

  slice(...args) {
    let clientIds = this._data.slice(...args);
    return clientIds.map((clientId) => this.graph.get({clientId}));
  }

  get size() {
    return this._data.length;
  }

  /**
   * @deprecated
   */
  get length() {
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
