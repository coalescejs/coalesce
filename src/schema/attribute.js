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
        var value = this._data.get(name);
        return value;
      },
      set: function(value) {
        this.withChangeTracking(() => {
          this._data = this._data.set(name, value);
        });
        return value;
      }
    });
  }

  get owner() {
    return true;
  }

}
