import Field from './field';
import copy from '../utils/copy';
import isEqual from '../utils/is_equal';

export default class Attribute extends Field {
  
  get kind() {
    return 'attribute';
  }
  
  defineProperty(prototype) {
    var name = this.name;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      get: function() {
        var value = this._attributes[name],
            parentSession;
        // materialize from parent session
        if(value === undefined && !this.isNew && this.session && (parentSession = this.session.parent)) {
          var parentModel = parentSession.getModel(this),
              parentValue = parentModel[name];
          // TODO: what if model
          value = this_attributes[name] = copy(value);
        }
        return value;
      },
      set: function(value) {
        var oldValue = this._attributes[name];
        if(isEqual(oldValue, value)) return;
        this.attributeWillChange(name);
        this._attributes[name] = value;
        this.attributeDidChange(name);
        return value;
      }
    });
  }
  
}
