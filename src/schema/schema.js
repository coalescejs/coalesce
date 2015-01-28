import Attribute from './attribute';
import Relationship from './relationship';

/**
  Describes the attributes and relationships on a model.
  
  For example:
  
  ```
  class Post extends Model {}
  Post.defineSchema({
    typeKey: 'post',
    attributes: {
      title: {
        type: 'string'
      },
      body: {
        type: 'string'
      }
    },
    relationships: {
      user: {
        type: 'user',
        kind: 'belongsTo'
      },
      comments: {
        type: 'comment',
        kind: 'hasMany'
      }
    }
  });
  ```
  
  @method defineSchema
  @param {Object} schema
*/
export default class Schema {
  
  constructor(obj=null) {
    if(obj) {
      this.configure(obj);
    }
  }
  
  configure(obj) {
    if(typeof obj.typeKey !== 'undefined') {
      this.typeKey = obj.typeKey;
    }
    var attributes = obj.attributes || {};
    for(var name in attributes) {
      if(!attributes.hasOwnProperty(name)) continue;
      var field = new Attribute(name, attributes[name]);
      this[name] = field;
    }
    var relationships = obj.relationships || {};
    for(var name in relationships) {
      if(!relationships.hasOwnProperty(name)) continue;
      var field = new Relationship(name, relationships[name]);
      this[name] = field;
    }
  }
  
  *relationships() {
    for(var field of this) {
      if(field.kind !== 'attribute') {
        yield field;
      }
    }
  }
  
  *attributes() {
    for(var field of this) {
      if(field.kind === 'attribute') {
        yield field;
      }
    }
  }
  
  apply(prototype) {
    prototype.schema = this;
    
    for(var field of this) {
      field.defineProperty(prototype);
    }
  }
}

Schema.prototype.typeKey = null;
