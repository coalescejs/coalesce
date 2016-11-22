import Attribute from './attribute';

export default class Meta extends Attribute {

  get kind() {
    return 'meta';
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
        this._data = this._data.set(name, value);
        return value;
      }
    });
  }

  get owner() {
    return true;
  }

}
