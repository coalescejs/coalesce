import Field from './field';
import isEqual from '../utils/is_equal';
import {dasherize} from '../utils/inflector';

import BelongsTo from '../entities/belongs_to';
import HasMany from '../entities/has_many';

export default class Relationship extends Field {
  
  constructor(schema, name, options) {
    // make sure typeKey is set
    console.assert(options.kind, "Relationships must have a 'kind' property specified");
    console.assert(options.type || options.typeKey, "Must specify a `type` or `typeKey` option");
    if(options.type) {
      var typeKey;
      if(typeof options.type === "string") {
        typeKey = options.type;
      } else {
        typeKey = options.type.typeKey;
      }
      
      console.assert(!options.typeKey || options.typeKey == typeKey, "type and typekey must match");
      
      options.typeKey = typeKey;
      delete options.type;
    }
    
    if(options.inverse) {
      options.inverseName = inverse;
      delete options.inverse;
    }
    
    super(schema, name, options);
    
    // TODO lookup from context
    if(options.class) {
      this.class = options.class;
    } else if(options.kind === 'belongsTo') {
      this.class = BelongsTo;
    } else if(options.kind === 'hasMany') {
      this.class = HasMany;
    }
  }
  
  defineProperty(prototype) {
    var field = this,
        name = field.name;
        
    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        var entity = this.getRelationship(name);
        
        return entity.get();
      },
      set: function(value) {
        var entity = this.getRelationship(name);
        
        return entity.set(value);
      }
    });
  }
  
  get type() {
    return this.context.typeFor(this.typeKey);
  }
  
  get serializerKey() {
    return this._serializerKey || (this._serializerKey = dasherize(this.kind));
  }
  
  get owner() {
    if(this._owner) {
      return this._owner;
    }
    
    // by default, belongsTo own the relationship
    return this._owner = this.embedded || this.kind === 'belongsTo';
  }
  
  set owner(value) {
    return this._owner = value;
  }
  
  get ownerType() {
    return this.context.typeFor(this.schema.typeKey);
  }
  
  get inverse() {
    var inverseType = this.type;
    // cached result
    if(this._inverse) { return this._inverse; }

    if (this.inverseName !== undefined) {
      if(!this.inverseName) {
        return null;
      }
      var result = inverseType.schema[this.inverseName];
      console.assert(result, `Inverse ${this.inverseName} is not defined`);
      return this._inverse = inverseType.schema.get(this._inverse);
    }
    
    for(var relationship of inverseType.schema.relationships()) {
      if(relationship.type === this.ownerType) {
        return this._inverse = relationship;
      }
    }
  }
  
}

Relationship.prototype.isRelationship = true;
