/**
  An unordered collection of unique entities.

  Uniqueness is determined by the `clientId`. If a entity is added and an
  equivalent entity already exists in the EntitySet, the existing entity will be
  overwritten.

  @class EntitySet
*/
export default class EntitySet {

  constructor(iterable) {
    this._size = 0;
    if(iterable) {
      for(var o of iterable) {
        this.add(o);
      }
    }
  }

  get size() {
    return this._size;
  }

  /**
    Clears the set. This is useful if you want to reuse an existing set
    without having to recreate it.

    ```javascript
    var entities = new EntitySet([post1, post2, post3]);
    entities.size;  // 3
    entities.clear();
    entities.size;  // 0
    ```

    @method clear
    @return {EntitySet} An empty Set
  */
  clear() {
    var len = this._size;
    if (len === 0) { return this; }

    var guid;

    for (var i=0; i < len; i++){
      guid = this._guidFor(this[i]);
      delete this[guid];
      delete this[i];
    }

    this._size = 0;

    return this;
  }

  add(obj) {

    var guid = this._guidFor(obj),
        idx  = this[guid],
        len  = this._size;

    if (idx>=0 && idx<len && (this[idx] && this._isEqual(this[idx], obj))) {
      // overwrite the existing version
      if(this[idx] !== obj) {
        this[idx] = obj;
      }
      return this; // added
    }

    len = this._size;
    this[guid] = len;
    this[len] = obj;
    this._size = len+1;

    return this;
  }

  delete(obj) {

    var guid = this._guidFor(obj),
        idx  = this[guid],
        len = this._size,
        isFirst = idx === 0,
        isLast = idx === len-1,
        last;


    if (idx>=0 && idx<len && (this[idx] && this._isEqual(this[idx], obj))) {
      // swap items - basically move the item to the end so it can be removed
      if (idx < len-1) {
        last = this[len-1];
        this[idx] = last;
        this[this._guidFor(last)] = idx;
      }

      delete this[guid];
      delete this[len-1];
      this._size = len-1;
      return true;
    }

    return false;
  }

  has(obj) {
    return this[this._guidFor(obj)]>=0;
  }

  copy(deep=false) {
    var C = this.constructor, ret = new C(), loc = this._size;
    ret._size = loc;
    while(--loc>=0) {
      ret[loc] = deep ? this[loc].copy() : this[loc];
      ret[this._guidFor(this[loc])] = loc;
    }
    return ret;
  }

  forEach(callbackFn, thisArg = undefined) {
    for (var i=0; i < this._size; i++) {
      callbackFn.call(thisArg, this[i], this[i], this);
    }
  }

  toString() {
    var len = this.size, idx, array = [];
    for(idx = 0; idx < len; idx++) {
      array[idx] = this[idx];
    }
    return `EntitySet<${array.join(',')}>`;
  }

  get(entity) {
    var idx = this[this._guidFor(entity)];
    if(idx === undefined) return;
    return this[idx];
  }

  *values() {
    for (var i=0; i < this._size; i++) {
      yield this[i];
    }
  }

  *[Symbol.iterator]() {
    yield* this.values();
  }

  _guidFor(entity) {
    return entity.clientId;
  }

  _isEqual(a, b) {
    return this._guidFor(a) === this._guidFor(b);
  }
}
