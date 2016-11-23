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
        return this._data[name];
      },
      set: function(value) {
        return this._data[name] = value;
      }
    });
  }

  get owner() {
    return true;
  }

}
