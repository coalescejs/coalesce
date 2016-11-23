import Relationship from './relationship';
import Query from '../query';

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
        if(!type) {
          type = this.graph.container.typeFor(typeKey);
        }
        let res = this.graph.fetchBy(Query, type, field.getQueryParams(this));
        if(res && field.embedded) {
          res._parent = this.clientId;
        }
        return res;
      },
      set: function(value) {
        let entity = this[name];
        console.assert(value, "Value must be an iterable");
        // There is no re-assignment of a hasMany. Instead, "setting" a hasMany
        // is equivalent to mutating the associated entity.
        entity.splice(0, entity.size, ...value);
        return entity;
      }
    });
  }

  get transient() {
    return !this.embedded;
  }

  get param() {
    return this.schema.typeKey;
  }

  getQueryParams(owner) {
    return {
      [this.param]: owner.clientId
    };
  }

}
