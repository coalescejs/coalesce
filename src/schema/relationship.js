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
        var entity = this.getRelationshipEntity(name);
        
        return entity.get();
      },
      set: function(value) {
        var entity = this.getRelationshipEntity(name);
        
        return entity.set(value);
      }
    });
  }
  
}
