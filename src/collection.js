import Entity from './entity';

import Immutable from 'immutable';

import Cache from './cache';

export default class Collection extends Entity {

  static cache = Cache;

  static defaults = Immutable.List();

  _data = this.constructor.defaults;

  constructor(graph, iterable) {
    super(graph);
    if(iterable) {
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

  get(index) {
    let clientId = this._data.get(index);
    if(!clientId) {
      return;
    }
    return this.graph.get({clientId});
  }

  /**
   * @override
   */
  *relatedEntities() {
    yield* this;
  }

}
