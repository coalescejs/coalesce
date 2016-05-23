import Entity from './entity';

import Immutable from 'immutable';

export default class Collection extends Entity {

  isCollection = true;
  _data = null;

  constructor(graph, iterable) {
    super(graph);
    function* clientIds(iterable) {
      if(iterable) {
        for(var entity of iterable) {
          yield entity.clientId;
        }
      }
    }
    this._data = Immutable.List(clientIds(iterable));
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
