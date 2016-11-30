import Relationship from './relationship';

export default class BelongsTo extends Relationship {

  defineProperty(prototype) {
    var field = this,
        name = field.name,
        typeKey = field.typeKey,
        attributeName = field.attributeName;

    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        let clientId = this._data[attributeName];
        if(clientId) {
          let res = this.graph.fetchBy(typeKey, {clientId});
          console.assert(res, "Entity does not exist");
          if(this.embedded) {
            res._parent = this.clientId;
          }
          return res;
        } else {
          return clientId;
        }
      },
      set: function(value) {
        const clientId = value && value.clientId;
        console.assert(!value || value.clientId, "Value must have a client id");
        if(value) {
          value = this.graph.fetchBy(typeKey, {clientId});
          if(this.embedded) {
            value._parent = this.clientId;
          }
        }
        if(field.owner) {
          this._loaded = true;
        }
        this.withChangeTracking(() => {
          this._data[attributeName] = clientId;
        });
        return value;
      }
    });
  }

  get attributeName() {
    return `$${this.name}`;
  }

}
