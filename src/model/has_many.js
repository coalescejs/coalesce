import HasManyArray  from '../collections/has_many_array';
import Coalesce  from '../namespace';
import copy  from '../utils/copy';
import isEqual  from '../utils/is_equal';
import Relationship  from './relationship';

var defaults = _.defaults;

export default class HasMany extends Relationship {
  
  constructor(name, options) {
    defaults(options, {collectionType: HasManyArray});
    super(name, options);
  }
  
  defineProperty(prototype) {
    var name = this.name,
        CollectionType = this.collectionType,
        embedded = this.embedded;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        var value = this._relationships[name];
        if(this.isNew && !value) {
          var content = value;
          value = this._relationships[name] = new CollectionType();
          value.owner = this;
          value.name = name;
          value.embedded = embedded;
          if(content) {
            value.addObjects(content);
          }
        }
        if(value && value._stale && value.reify && this.session) {
          value.reify();
          value._stale = false;
        }
        return value;
      },
      set: function(value) {
        var oldValue = this._relationships[name];
        if(oldValue === value) return;
        if(value && value instanceof CollectionType) {
          // XXX: this logic might not be necessary without Ember
          // need to copy since this content is being listened to
          value = copy(value);
        }
        if(oldValue && oldValue instanceof CollectionType) {
          oldValue.clear();
          if(value) {
            oldValue.addObjects(value);
          }
        } else {
          this.hasManyWillChange(name);
          
          var content = value;
          value = this._relationships[name] = new CollectionType();
          value.owner = this;
          value.name = name;
          value.embedded = embedded;
          if(content) {
            value.addObjects(content);
          }
          this.hasManyDidChange(name);
        }
        return value;
      }
    });
  }
  
}
