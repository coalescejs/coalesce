import Field from './field';
import isEqual from '../utils/is_equal';

import BelongsTo from '../relationships/belongs_to';
import HasMany from '../relationships/has_many';

export default class Relationship extends Field {
  
  constructor(name, options) {
    // make sure typeKey is set
    console.assert(options.kind, "Relationships must have a 'kind' property specified");
    console.assert(options.type || options.typeKey, "Must specify a `type` or `typeKey` option");
    if(typeof options.type === "string") {
      var typeKey = options.type;
      delete options.type;
      options.typeKey = typeKey;
    } else if(!options.typeKey) {
      options.typeKey = options.type.typeKey;
    }
    
    if(options.class) {
      this.class = options.class;
    } else if(options.kind == 'belongsTo') {
      this.class = BelongsTo;
    } else if(options.kind == 'hasMany') {
      this.class = HasMany;
    }
    
    super(name, options);
  }
  
  defineProperty(prototype) {
    var field = this;
        name = field.name;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        var graph = this.graph;
        if(!graph) {
          return this._relationships[name];
        }
        
        var clientId = BelongsTo.clientId(this, field),
            entity = graph.getByClientId(clientId);
        
        if(!entity) {
          entity = new field.class(this, field);
          graph.adopt(entity);
        }
        
        return entity.get();
      },
      set: function(value) {
        var graph = this.graph;
        if(!graph) {
          return this._relationships[name] = value;
        }
        
        entity = this[name];
        return entity.set(value);
      }
    });
  }
  
}
