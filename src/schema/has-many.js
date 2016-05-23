import Relationship from './relationship';
import HasManyCollection from '../has-many';

import Immutable from 'immutable';

export default class HasMany extends Relationship {

  defineProperty(prototype) {
    var field = this,
        name = field.name,
        type = field.type,
        attributeName = field.attributeName;

    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        let clientId = HasManyCollection.clientId(this, name),
            res = this.graph.get({clientId});
        if(!res) {
          res = this.graph.create(HasManyCollection, this, name);
        }
        return res;
      },
      set: function(value) {
        let entity = this[name];
        console.assert(value, "Value must be an iterable");
        // There is no re-assignment of a hasMany. Instead, "setting" a hasMany
        // is equivalent to mutating the associated entity.
        entity.withChangeTracking(() => {
          entity._data = Immutable.List(Array.from(value).map((e) => e.clientId));
        });
        return entity;
      }
    });
  }

  get attributeName() {
    return `$${this.name}`;
  }

}
