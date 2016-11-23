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
        return this._data[name];
      },
      set: function(value) {
        this._loaded = true;
        this.withChangeTracking(() => {
          this._data[name] = value;
        });
        return value;
      }
    });
  }

  get owner() {
    return true;
  }

}
