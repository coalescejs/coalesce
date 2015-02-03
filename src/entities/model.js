import Entity from './entity';
import copy from '../utils/copy';
import fork from '../utils/fork';
import isEqual from '../utils/is_equal';
import Error from '../error';
import ModelDiff from '../diff/model';
import Schema from '../schema/schema';
import {mixinObject} from '../utils/mixin';

export default class Model extends Entity {

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
  
  constructor(fields) {
    this._meta = {
      id: null,
      clientId: null,
      rev: null,
      clientRev: null,
      isDeleted: false,
      errors: null
    }
    this._attributes = {};
    this._detachedRelationships = {};

    for(var name in fields) {
      if(!fields.hasOwnProperty(name)) continue;
      this[name] = fields[name];
    }
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

  get isNew() {
    return !this.id;
  }
  
  get isEmbedded() {
    return !!this._embeddedParent;
  }
  
  get _embeddedParent() {
    return this.__embeddedParent && this.graph.fetchByClientId(this.__embeddedParent);
  }
  
  set _embeddedParent(value) {
    this.__embeddedParent = value ? value.clientId : undefined;
  }
  
  /**
    @private
    
    The equivalent model in a parent session
  */
  get __parent() {
    var session = this.session,
        parentSession = session && session.parent,
        parent = parentSession && parentSession.get(this);
    
    if(parent) {
      return parent;
    }
  }

  isFieldLoaded(key) {
    if(this.isNew) {
      return true;
    }
    var value = this[key];
    if(value === undefined) {
      return false;
    }
    if(value && value.isRelationship) {
      return value.isLoaded;
    }
    return true;
  }
  
  /**
    A model is considered *loaded* if any field is loaded.
  */
  get isLoaded() {
    for(var field of this.schema) {
      if(this.isFieldLoaded(field.name)) {
        return true;
      }
    }
    return false;
  }
  
  /**
    @private
    
    Return the raw relationship object.
  */
  getRelationship(name) {
    var field = this.schema[name],
        graph = this.graph,
        entity;
        
    if(!graph) {
      entity = this._detachedRelationships[name];
      if(!entity) {
        entity = this._detachedRelationships[name] = new field.class(this, field);
      }
    } else {
      var clientId = field.class.clientId(this.clientId, field);
      entity = graph.getByClientId(clientId);
      if(!entity) {
        entity = new field.class(this, field);
        entity = graph.adopt(entity);
      }
    }
    
    return entity;
  }
  
  *relationships() {
    for(var relationship of this.schema.relationships()) {
      var instance = this.getRelationship(relationship.name);
      if(instance) {
        yield instance;
      }
    }
  }
  
  *entities() {
    yield* this.relationships();
  }
  
  metaWillChange(name) {
    
  }
  
  metaDidChange(name) {
    
  }

  attributeWillChange(name) {
    var session = this.session;
    if(session) {
      session.touch(this);
    }
  }

  attributeDidChange(name) {

  }
  
  relationshipWillChange(name) {
    
  }
  
  relationshipDidChange(name) {
    
  }
  
  static get parentType() {
    return Object.getPrototypeOf(this);
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
    Returns a copy with all properties unloaded except identifiers.

    @method unloadedCopy
    @returns {Model}
  */
  unloadedCopy() {
    return new this.constructor({
      id: this.id,
      clientId: this.clientId
    });
  }

  fork(graph) {
    var dest = graph.fetch(this);
    dest.__embeddedParent = this.__embeddedParent;
    dest._meta = fork(this._meta, graph);
    dest._attributes = fork(this._attributes, graph);
    // recurse on new relationships
    // TODO only do this for owned relationships?
    if(this.isNew) {
      for(var relationship of this.relationships()) {
        graph.adopt(relationship);
      }
    }
    return dest;
  }
  
  get schema() {
    return this.constructor.schema;
  }
  
  static defineSchema(obj) {
    console.assert(!this._isReified, "Cannot modify schema after context has been configured")
    if(!this.hasOwnProperty('__schemaConfigs__')) {
      this.__schemaConfigs__ = [];
    }
    this.__schemaConfigs__.push(obj);
  }
  
  diff(b) {
    return new ModelDiff(this, b);
  }
}

Model.prototype.isModel = true;

/**
  The embedded parent of this model.
  @private
*/
Model.prototype._embeddedParent = null;

function sessionAlias(name) {
  return function () {
    var session = this.session;
    console.assert(session, "Cannot call " + name + " on a detached model");
    var args = [].splice.call(arguments,0);
    args.unshift(this);
    return session[name].apply(session, args);
  };
}

mixinObject(Model.prototype, {
  load: sessionAlias('loadModel'),
  refresh: sessionAlias('refresh'),
  deleteModel: sessionAlias('deleteModel'),
  remoteCall: sessionAlias('remoteCall'),
  markClean: sessionAlias('markClean'),
  invalidate: sessionAlias('invalidate'),
  touch: sessionAlias('touch')
});

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

/**
  @private
  
  "reification" happens when the type is looked up on the context. This is
  where the schema is applied to the model class (defining properties etc.)
*/
Model._isReified = false;
// TODO: should pass in schema here
Model.reify = function(context, typeKey) {
  if(this._isReified) return;
  this.typeKey = typeKey;
  
  // eagerly set to break loops
  this._isReified = true;
  
  var schema;
  if(this.parentType && this.parentType !== Model && typeof this.parentType.reify === 'function') {
    var parentSchema = this.parentType.reify(context);
    schema = Object.create(parentSchema);
    schema.typeKey = typeKey;
  } else {
    schema = new Schema(context, typeKey);
  }
  this.schema = schema;
  
  var configs = this.__schemaConfigs__;
  // todo allow config to be specified on context
  if(configs) {
    for(var config of configs) {
      schema.configure(config);
    }
  }
  schema.apply(this.prototype);
  
  return schema;
}
