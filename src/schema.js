import Field from './schema/field';
import Attribute from './schema/attribute';
import Relationship from './schema/relationship';
import HasMany from './schema/has-many';
import BelongsTo from './schema/belongs-to';
import Meta from './schema/meta';

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

  constructor(config) {
    this.configureDefaults();
    if(config) {
      this.configure(config);
    }
  }

  configureDefaults() {
    // default meta fields
    this.id = new Meta(this, 'id', {
      writable: true,
      type: 'id'
    });
    this.clientId = new Meta(this, 'clientId', {
      writable: true,
      type: 'string'
    });
    this.rev = new Meta(this, 'rev', {
      writable: true,
      type: 'revision'
    });
    this.clientRev = new Meta(this, 'clientRev', {
      writable: true,
      type: 'revision'
    });
    this.isDeleted = new Meta(this, 'isDeleted', {
      writable: false
    });
    this.isNew = new Meta(this, 'isNew', {
      writable: false
    });
    this.errors = new Meta(this, 'errors', {
      writable: false
    });
  }

  configure(config) {
    if(typeof config.typeKey !== 'undefined') {
      this.typeKey = config.typeKey;
    }
    var attributes = config.attributes || {};
    for(var name in attributes) {
      if(!attributes.hasOwnProperty(name)) continue;
      var field = new Attribute(this, name, attributes[name]);
      this[name] = field;
    }
    var relationships = config.relationships || {};
    for(var name in relationships) {
      if(!relationships.hasOwnProperty(name)) continue;
      let rel = relationships[name],
          klass;
      if(rel.kind === 'hasMany') {
        klass = HasMany;
      } else if(rel.kind === 'belongsTo') {
        klass = BelongsTo;
      } else {
        throw `Unknown relationship kind ${rel.kind}`;
      }
      var field = new klass(this, name, rel);
      this[name] = field;
    }
  }

  apply(prototype) {
    for(var field of this.ownFields()) {
      field.defineProperty(prototype);
    }
  }

  *[Symbol.iterator]() {
    yield* this.fields();
  }

  *fields() {
    for(var name in this) {
      var field = this[name];
      if(field instanceof Field) {
        yield field;
      }
    }
  }


  /**
   * Fields which are part of the model's data.
   *
   * @return {iterator}
   */
  *dataFields() {
    for(var field of this.fields()) {
      if(field.owner) {
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

  *attributes() {
    for(var field of this.fields()) {
      if(field instanceof Attribute) {
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

}
