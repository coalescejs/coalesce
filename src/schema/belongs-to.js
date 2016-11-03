import Relationship from './relationship';

export default class BelongsTo extends Relationship {

  defineProperty(prototype) {
    var field = this,
        name = field.name,
        type = field.type,
        attributeName = field.attributeName;

    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        let clientId = this._data.get(attributeName);
        if(clientId) {
          let res = this.graph.get({clientId});
          if(res && this.embedded) {
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
          value = this.graph.get({clientId});
          if(this.embedded) {
            value._parent = this.clientId;
          }
        }
        this.withChangeTracking(() => {
          this._data = this._data.set(attributeName, clientId);
        });
        return value;
      }
    });
  }

  get attributeName() {
    return `$${this.name}`;
  }

}
