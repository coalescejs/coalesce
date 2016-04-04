import Relationship from './relationship';

export default class HasMany extends Relationship {

  defineProperty(prototype) {
    var field = this,
        name = field.name,
        foreignKey = field.foreignKey;

    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        if(this.session) {
          // TODO: think through the case of a new model, in which case we
          // need to fetch a query based on clientId instead of id
          return this.session.fetchQuery(this.typeKey, {[foreignKey]: this.id});
        } else {
          return this._rels[name];
        }
      },
      set: function(value) {
        if(this.session) {
          // TODO
        } else {
          this._rels[name] = value;
        }
        return value;
      }
    });
  }

  get attributeName() {
    return `${this.name}Id`;
  }

  get foreignKey() {
    return `${this.typeKey}_id`;
  }

}
