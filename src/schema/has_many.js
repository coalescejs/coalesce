import Coalesce from '../namespace';
import Relationship from './relationship';
import HasManyArray from '../collections/has_many_array';
import isEqual from '../utils/is_equal';
import copy from '../utils/copy';

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
        
        var graph = this.graph;
        if(!graph) {
          return this._relationships[name];
        }
        
        // TODO: explore prototypical inheritance here
        if(!this.isNew && value === undefined && this.__parent) {
          var parentValue = this.__parent._relationships[name].fork(graph);
          if(parentValue) {
            value = this._relationships[name] = parentValue.fork(graph);
          }
        }
        
        return value;
      },
      set: function(value) {
        var oldValue = this[name];
        if(oldValue === value) return;
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
