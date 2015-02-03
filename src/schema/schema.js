import Field from './field';
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
  
  constructor(context, typeKey) {
    this.context = context;
    this.typeKey = typeKey;
  }
  
  configure(obj) {
    if(typeof obj.typeKey !== 'undefined') {
      this.typeKey = obj.typeKey;
    }
    var attributes = obj.attributes || {};
    for(var name in attributes) {
      if(!attributes.hasOwnProperty(name)) continue;
      var field = new Attribute(this, name, attributes[name]);
      this[name] = field;
    }
    var relationships = obj.relationships || {};
    for(var name in relationships) {
      if(!relationships.hasOwnProperty(name)) continue;
      var field = new Relationship(this, name, relationships[name]);
      this[name] = field;
    }
  }
  
  apply(prototype) {
    for(var field of this.ownFields()) {
      field.defineProperty(prototype);
    }
  }
  
  *fields() {
    for(var name in this) {
      var field = this[name];
      if(field instanceof Field) {
        yield field;
      }
    }
  }
  
  *ownFields() {
    for(var field of this.fields()) {
      if(this.hasOwnProperty(field.name)) {
        yield field;
      }
    }
  }
  
  *relationships() {
    for(var field of this.fields()) {
      if(field instanceof Relationship) {
        yield field;
      }
    }
  }
  
  *attributes() {
    for(var field of this.fields()) {
      if(field instanceof Attribute) {
        yield field;
      }
    }
  }
}

Schema.prototype[Symbol.iterator] = Schema.prototype.fields;
Schema.prototype.typeKey = null;
