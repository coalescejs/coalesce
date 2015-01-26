import Field from './field';
import isEqual from '../utils/is_equal';

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
        var value = this._attributes[name];
        // TODO: explore prototypical inheritance here
        if(!this.isNew && value === undefined && this.__parent) {
          value = this._attributes[name] = this.__parent._attributes[name];
        }
        return value;
      },
      set: function(value) {
        var oldValue = this[name];
        if(isEqual(oldValue, value)) return;
        this.attributeWillChange(name);
        this._attributes[name] = value;
        this.attributeDidChange(name);
        return value;
      }
    });
  }
  
}
