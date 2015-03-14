import Field from './field';
import isEqual from '../utils/is_equal';

export default class Meta extends Field {
  
  get kind() {
    return 'meta';
  }
  
  defineProperty(prototype) {
    var name = this.name;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        var value = this._meta[name];
        return value;
      },
      set: function(value) {
        var oldValue = this[name];
        if(isEqual(oldValue, value)) return;
        this.metaWillChange(name);
        this._meta[name] = value;
        this.metaDidChange(name);
        return value;
      }
    });
  }
  
}
