import Relationship from './relationship';
import Query from '../query';

import Immutable from 'immutable';

export default class HasMany extends Relationship {

  defineProperty(prototype) {
    var field = this,
        name = field.name,
        typeKey = field.typeKey,
        type = field.type;

    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        if(!this.id) {
          return null;
        }
        if(!type) {
          type = this.graph.container.typeFor(typeKey);
        }
        return this.graph.fetchBy(Query, type, field.getQueryParams(this));
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

  getQueryParams(owner) {
    return {
      [`${this.schema.typeKey}_id`]: owner.id
    };
  }

}
