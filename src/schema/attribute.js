import Field from './field';

export default class Attribute extends Field {

  get kind() {
    return 'attribute';
  }

  defineProperty(prototype) {
    var name = this.name;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        var value = this._attributes.get(name);
        return value;
      },
      set: function(value) {
        this.withMutations((data) => {
          data.set(name, value);
        });
        return value;
      }
    });
  }

}
