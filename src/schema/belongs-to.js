import Relationship from './relationship';

export default class BelongsTo extends Relationship {

  defineProperty(prototype) {
    var field = this,
        name = field.name,
        attributeName = field.attributeName;

    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        if(this.session) {
          let id = this._data[attributeName];
          if(id) {
            return this.session.getBy({id});
          } else {
            return id;
          }
        } else {
          return this._rels[name];
        }
      },
      set: function(value) {
        if(this.session) {
          this.withMutations((data) => {
            data.set(attributeName, value && value.id);
          });
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

}
