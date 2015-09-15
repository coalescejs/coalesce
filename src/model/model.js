import ModelSet  from '../collections/model_set';
import Error  from '../error';
import Coalesce  from '../namespace';
import BaseClass  from '../utils/base_class';
import copy  from '../utils/copy';
import { camelize, pluralize, underscore, classify } from '../utils/inflector';
import isEqual  from '../utils/is_equal';
import lazyCopy  from '../utils/lazy_copy';
import Attribute  from './attribute';
import BelongsTo  from './belongs_to';
import Field  from './field';
import HasMany  from './has_many';

export default class Model {

  get id() {
    return getMeta.call(this, 'id');
  }
  set id(value) {
    return setMeta.call(this, 'id', value);
  }

  get clientId() {
    return getMeta.call(this, 'clientId');
  }
  set clientId(value) {
    return setMeta.call(this, 'clientId', value);
  }

  get rev() {
    return getMeta.call(this, 'rev');
  }
  set rev(value) {
    return setMeta.call(this, 'rev', value);
  }

  get clientRev() {
    return getMeta.call(this, 'clientRev');
  }
  set clientRev(value) {
    return setMeta.call(this, 'clientRev', value);
  }

  get isDeleted() {
    return getMeta.call(this, 'isDeleted');
  }
  set isDeleted(value) {
    return setMeta.call(this, 'isDeleted', value);
  }

  get errors() {
    return getMeta.call(this, 'errors');
  }
  set errors(value) {
    return setMeta.call(this, 'errors', value);
  }

  get isModel() {
    return true;
  }
  
  get session() {
    return this._session;
  }
  
  set session(value) {
    console.assert(!this._session || this._session === value, "Cannot re-assign a model's session");
    this._session = value;
  }
  
  constructor(fields) {
    this._meta = {
      id: null,
      clientId: null,
      rev: null,
      clientRev: 0,
      isDeleted: false,
      errors: null
    }
    this._attributes = {};
    this._relationships = {};
    this._suspendedRelationships = false;
    this._session = null;

    for(var name in fields) {
      if(!fields.hasOwnProperty(name)) continue;
      this[name] = fields[name];
    }
  }
  
  /**
    Increase the client rev number
  */
  bump() {
    return ++this.clientRev;
  }
  
  /**
    Two models are "equal" when they correspond to the same
    key. This does not mean they necessarily have the same data.
  */
  isEqual(model) {
    if(!model) return false;
    var clientId = this.clientId;
    var otherClientId = model.clientId;
    if(clientId && otherClientId) {
      return clientId === otherClientId;
    }
    // in most cases clientIds will always be set, however
    // during serialization this might not be the case
    var id = this.id;
    var otherId = model.id;
    return this instanceof model.constructor && id === otherId
  }
  
  get typeKey() {
    return this.constructor.typeKey;
  }

  toString() {
    var sessionString = this.session ? this.session.toString() : "(detached)";
    return this.constructor.toString() + "<" + (this.id || '(no id)') + ", " + this.clientId + ", " + sessionString + ">";
  }
  
  static toString() {
    if(this.__toString = this.__toString || this.name || (this.typeKey && classify(this.typeKey))) {
      return this.__toString;
    }
    return "[No Type Key]";
  }

  toJSON() {
    var res = {};
    _.merge(res, this._meta);
    _.merge(res, this._attributes);
    return res;
  }

  get hasErrors() {
    return !!this.errors;
  }

  get isDetached() {
    return !this.session;
  }

  get isManaged() {
    return !!this.session;
  }

  get isNew() {
    return !this.id;
  }
  
  get isEmbedded() {
    return !!this._parent;
  }

  get isDirty() {
    if(this.session) {
      return this.session.dirtyModels.contains(this);
    } else {
      return false;
    }
  }

  /**
    Returns a copy with all properties unloaded except identifiers.

    @method lazyCopy
    @returns {Model}
  */
  lazyCopy() {
    var copy = new this.constructor({
      id: this.id,
      clientId: this.clientId
    });
    return copy;
  }

  // creates a shallow copy with lazy children
  // TODO: we should not lazily copy detached children
  copy() {
    var dest = new this.constructor();
    this.copyTo(dest);
    return dest;
  }

  copyTo(dest) {
    this.copyMeta(dest);
    this.copyAttributes(dest);
    this.copyRelationships(dest);
  }
  
  copyMeta(dest) {
    // TODO _parent should just use clientId
    dest._parent = this._parent;
    dest._meta = copy(this._meta);
  }
  
  copyAttributes(dest) {
    this.loadedAttributes.forEach(function(options, name) {
      dest._attributes[name] = copy(this._attributes[name], true);
    }, this);
  }
  
  copyRelationships(dest) {
    this.eachLoadedRelationship(function(name, relationship) {
      dest[name] = this[name];
    }, this);
  }
  
  /**
    Copy the model to the target session.
  */
  fork(session) {
    var dest = new this.constructor();
    this.copyTo(dest);
    session.adopt(dest);
    // XXX: this is a hack to lazily add the children when the array is accessed
    dest.eachLoadedRelationship(function(name, relationship) {
      if(relationship.kind == 'hasMany') {
        dest[name]._stale = true;
      }
    });
    return dest;
  }

  shouldTriggerLoad(key) {
    return this.isField(key) && !this.isFieldLoaded(key);
  }

  isField(key) {
    return !!this.fields.get(key)
  }

  isFieldLoaded(key) {
    return this.isNew || typeof this[key] !== 'undefined'
  }

  /**
    Returns true if *any* fields are loaded on the model
  */
  get isPartiallyLoaded() {
    var res = false;
    this.fields.forEach(function(options, name) {
      res = res || this.isFieldLoaded(name);
    }, this);
    return res;
  }
  
  /**
    Returns true if *all* fields (including relationships) are loaded on the model.
  */
  get isLoaded() {
    var res = true;
    this.fields.forEach(function(options, name) {
      res = res && this.isFieldLoaded(name);
    }, this);
    return res;
  }

  /**
    Defines the attributes and relationships on the model.
    
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
  static defineSchema(schema) {
    if(typeof schema.typeKey !== 'undefined') {
      this.typeKey = schema.typeKey;
    }
    var attributes = schema.attributes || {};
    for(var name in attributes) {
      if(!attributes.hasOwnProperty(name)) continue;
      var field = new Attribute(name, attributes[name]);
      this.defineField(field);
    }
    var relationships = schema.relationships || {};
    for(var name in relationships) {
      if(!relationships.hasOwnProperty(name)) continue;
      var options = relationships[name];
      console.assert(options.kind, "Relationships must have a 'kind' property specified");
      var field;
      if(options.kind === 'belongsTo') {
        field = new BelongsTo(name, options);
      } else if(options.kind === 'hasMany') {
        field = new HasMany(name, options);
      } else {
        console.assert(false, "Unkown relationship kind '" + options.kind + "'. Supported kinds are 'belongsTo' and 'hasMany'");
      }
      this.defineField(field);
    }
  }
  
  static defineField(field) {
    field.defineProperty(this.prototype);
    field.parentType = this;
    this.ownFields.set(field.name, field);
    return field;
  }
  
  static get ownFields() {
    if(!this.hasOwnProperty('_ownFields')) {
      this._ownFields = new Map();
    }
    return this._ownFields;
  }
  
  static get fields() {
    if(this.hasOwnProperty('_fields')) {
      return this._fields;
    }
    var res = new Map(),
        parentClass = this.parentType;
    
    var maps = [this.ownFields];
    
    if(parentClass.prototype instanceof Model) {
      var parentFields = parentClass.fields;
      if(parentFields) {
        maps.push(parentClass.fields);
      }
    }
    
    for(var i = 0; i < maps.length; i++) {
      maps[i].forEach(function(field, name) {
        res.set(name, field);
      });
    }
    
    return this._fields = res;
  }

  static get attributes() {
    if(this.hasOwnProperty('_attributes')) {
      return this._attributes;
    }
    var res = new Map();
    this.fields.forEach(function(options, name) {
      if(options.kind === 'attribute') {
        res.set(name, options);
      }
    });
    return this._attributes = res;
  }

  static get relationships() {
    if(this.hasOwnProperty('_relationships')) {
      return this._relationships;
    }
    var res = new Map();
    this.fields.forEach(function(options, name) {
      if(options.kind === 'belongsTo' || options.kind === 'hasMany') {
        res.set(name, options);
      }
    });
    return this._relationships = res;
  }

  get attributes() {
    return this.constructor.attributes;
  }
  
  get fields() {
    return this.constructor.fields;
  }

  get loadedAttributes() {
    var res = new Map();
    this.attributes.forEach(function(options, name) {
      if(this.isFieldLoaded(name)) {
        res.set(name, options);
      }
    }, this);
    return res;
  }

  get relationships() {
    return this.constructor.relationships;
  }

  get loadedRelationships() {
    var res = new Map();
    this.relationships.forEach(function(options, name) {
      if(this.isFieldLoaded(name)) {
        res.set(name, options);
      }
    }, this);
    return res;
  }
  
  metaWillChange(name) {
    
  }
  
  metaDidChange(name) {
    
  }

  attributeWillChange(name) {
    var session = this.session;
    if(session) {
      session.modelWillBecomeDirty(this);
    }
  }

  attributeDidChange(name) {

  }

  belongsToWillChange(name) {
    if(this._suspendedRelationships) {
      return;
    }
    var inverseModel = this[name],
        session = this.session;
    if(session && inverseModel) {
      session.inverseManager.unregisterRelationship(this, name, inverseModel);
    }
  }

  belongsToDidChange(name) {
    if(this._suspendedRelationships) {
      return;
    }
    var inverseModel = this[name],
        session = this.session;
    if(session && inverseModel) {
      session.inverseManager.registerRelationship(this, name, inverseModel);
    }
  }

  hasManyWillChange(name) {
    // XXX: unregister all?
  }

  hasManyDidChange(name) {
    // XXX: reregister
  }
  
  //
  // DEPRECATED back-compat methods below, instead should use es6 iterators
  //
  eachAttribute(callback, binding) {
    this.attributes.forEach(function(options, name) {
      callback.call(binding, name, options);
    });
  }

  eachLoadedAttribute(callback, binding) {
    this.loadedAttributes.forEach(function(options, name) {
      callback.call(binding, name, options);
    });
  }
  
  eachRelationship(callback, binding) {
    this.relationships.forEach(function(options, name) {
      callback.call(binding, name, options);
    });
  }
  
  static eachRelationship(callback, binding) {
    this.relationships.forEach(function(options, name) {
      callback.call(binding, name, options);
    });
  }
  
  static get parentType() {
    return Object.getPrototypeOf(this);
  }

  eachLoadedRelationship(callback, binding) {
    this.loadedRelationships.forEach(function(options, name) {
      callback.call(binding, name, options);
    });
  }
  
  /**
    Traverses the object graph rooted at this model, invoking the callback.
  */
  eachRelatedModel(callback, binding, cache) {
    if(!cache) cache = new Set();
    if(cache.has(this)) return;
    cache.add(this);
    callback.call(binding || this, this);

    this.eachLoadedRelationship(function(name, relationship) {
      if(relationship.kind === 'belongsTo') {
        var child = this[name];
        if(!child) return;
        this.eachRelatedModel.call(child, callback, binding, cache);
      } else if(relationship.kind === 'hasMany') {
        var children = this[name];
        children.forEach(function(child) {
          this.eachRelatedModel.call(child, callback, binding, cache);
        }, this);
      }
    }, this);
  }
  
  /**
    Given a callback, iterates over each child (1-level deep relation).

    @param {Function} callback the callback to invoke
    @param {any} binding the value to which the callback's `this` should be bound
  */
  eachChild(callback, binding) {
    this.eachLoadedRelationship(function(name, relationship) {
      if(relationship.kind === 'belongsTo') {
        var child = this[name];
        if(child) {
          callback.call(binding, child);
        }
      } else if(relationship.kind === 'hasMany') {
        var children = this[name];
        children.forEach(function(child) {
          callback.call(binding, child);
        }, this);
      }
    }, this);
  }
  
  /**
    @private

    The goal of this method is to temporarily disable specific observers
    that take action in response to application changes.

    This allows the system to make changes (such as materialization and
    rollback) that should not trigger secondary behavior (such as setting an
    inverse relationship or marking records as dirty).

    The specific implementation will likely change as Ember proper provides
    better infrastructure for suspending groups of observers, and if Array
    observation becomes more unified with regular observers.
  */
  suspendRelationshipObservers(callback, binding) {
    // could be nested
    if(this._suspendedRelationships) {
      return callback.call(binding || this);
    }

    try {
      this._suspendedRelationships = true;
      callback.call(binding || this);
    } finally {
      this._suspendedRelationships = false;
    }
  }
  
  static inverseFor(name) {
    var relationship = this.relationships.get(name);
    if (!relationship) { return null; }
    
    var inverseType = relationship.type;

    if (typeof relationship.inverse !== 'undefined') {
      var inverseName = relationship.inverse;
      return inverseName && inverseType.relationships.get(inverseName);
    }
    
    var possibleRelationships = findPossibleInverses(this, inverseType);

    if (possibleRelationships.length === 0) { return null; }

    console.assert(possibleRelationships.length === 1, "You defined the '" + name + "' relationship on " + this + " but multiple possible inverse relationships of type " + this + " were found on " + inverseType + ".");

    function findPossibleInverses(type, inverseType, possibleRelationships) {
      possibleRelationships = possibleRelationships || [];
      
      var relationships = inverseType.relationships;
      
      var typeKey = type.typeKey;
      // Match inverse based on typeKey
      var propertyName = camelize(typeKey);
      var inverse = relationships.get(propertyName) || relationships.get(pluralize(propertyName));
      if(inverse) {
        possibleRelationships.push(inverse);
      }
      
      var parentType = type.parentType;
      if (parentType && parentType.typeKey) {
        // XXX: container extends models and this logic creates duplicates
        // XXX: add test for subclassing and extending the schema
        // findPossibleInverses(parentType, inverseType, possibleRelationships);
      }
      return possibleRelationships;
    }

    return possibleRelationships[0];
  }
  
  static reopen(props) {
    for(var key in props) { 
      if(!props.hasOwnProperty(key)) return;
      this.prototype[key] = props[key];
    }
    return this;
  }
}

/**
  The embedded parent of this model.
  @private
*/
Model.prototype._parent = null;

function sessionAlias(name) {
  return function () {
    var session = this.session;
    console.assert(session, "Cannot call " + name + " on a detached model");
    var args = [].splice.call(arguments,0);
    args.unshift(this);
    return session[name].apply(session, args);
  };
}

function getMeta(name) {
  return this._meta[name];
}

function setMeta(name, value) {
  var oldValue = this._meta[name];
  if(oldValue === value) return oldValue;
  this.metaWillChange(name);
  this._meta[name] = value;
  this.metaDidChange(name);
  return value;
}


Model.reopen({
  load: sessionAlias('loadModel'),
  refresh: sessionAlias('refresh'),
  deleteModel: sessionAlias('deleteModel'),
  remoteCall: sessionAlias('remoteCall'),
  markClean: sessionAlias('markClean'),
  invalidate: sessionAlias('invalidate'),
  touch: sessionAlias('touch')
});

/**
  @private
  
  "reification" happens when the type is looked up on the context. This process
  translates the String typeKeys into their corresponding classes.
*/
Model._isReified = false;
Model.reify = function(context) {
  if(this._isReified) return;
  
  // no need to reify the root class
  if(this === Model) {
    return;
  }
  
  console.assert(this.typeKey, "Model must have static 'typeKey' property set.");
  
  if(this.parentType && typeof this.parentType.reify === 'function') {
    this.parentType.reify(context);
  }
  
  // eagerly set to break loops
  this._isReified = true;
  
  this.relationships.forEach(function(relationship) {
    if(!relationship.type) {
      relationship.type = context.typeFor(relationship.typeKey);
    }
    if(!relationship.type) {
      throw new Error("Could not find a type for '" + relationship.name + "' with typeKey '" + relationship.typeKey + "'");
    }
    if(!relationship.type.typeKey) {
      throw new Error("Relationship '" + relationship.name + "' has no typeKey");
    }
    if(!relationship.typeKey) {
      relationship.typeKey = relationship.type.typeKey;
    }
  });
}
