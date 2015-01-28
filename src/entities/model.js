import BaseClass from '../utils/base_class';
import copy from '../utils/copy';
import fork from '../utils/fork';
import isEqual from '../utils/is_equal';
import Error from '../error';
import ModelDiff from '../diff/model';

export default class Model extends BaseClass {

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
  
  get graph() {
    return this._graph;
  }
  
  set graph(value) {
    return this._graph = value;
  }
  
  get session() {
    if(this._graph && this._graph.isSession) {
      return this._graph;
    }
    return null;
  }
  
  set session(value) {
    console.assert(!this._session || this._session === value, "Cannot re-assign a model's session");
    this._session = value;
  }
  
  constructor(fields) {
    this._graph = null;
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
    this._suspendedRelationships = false;

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
    return !!this._embeddedParent;
  }
  
  get _embeddedParent() {
    return this.__embeddedParent && this.graph.fetchByClientId(this.__embeddedParent);
  }
  
  set _embeddedParent(value) {
    this.__embeddedParent = value ? value.clientId : undefined;
  }

  get isDirty() {
    if(this.session) {
      return this.session.dirtyModels.contains(this);
    } else {
      return false;
    }
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
  
  get attributes() {
    return this._attributes;
  }
  
  /**
    @private
    
    Return the raw relationship object.
  */
  getRelationshipEntity(name) {
    var field = this.schema[name],
        graph = this.graph;
    if(!graph) {
      return this._detachedRelationships[name];
    }
    
    var clientId = field.class.clientId(this, field),
        entity = graph.getByClientId(clientId);
    
    if(!entity) {
      entity = new field.class(this, field);
      graph.adopt(entity);
    }
    
    return entity;
  }
    
  
  *relationshipEntities() {
    for(var relationship in this.schema.relationships) {
      yield this.getRelationshipEntity(relationship.name);
    }
  }
  
  *relationships() {
    for(var entity in this.relationshipEntities) {
      if(entity.isLoaded) {
        yield entity;
      }
    }
  }
  
  /**
    @private
    
    All child entities
  */
  *children() {
    yield* this.relationshiprelationshipEntities;
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
    this._forkTo(dest, graph);
    return dest;
  }

  _forkTo(dest, graph) {
    this._forkMeta(dest, graph);
    this._forkAttributes(dest, graph);
    this._forkRelationships(dest, graph);
  }
  
  _forkMeta(dest, graph) {
    dest.__embeddedParent = this.__embeddedParent;
    dest._meta = fork(this._meta, graph);
  }
  
  _forkAttributes(dest, graph) {
    this.loadedAttributes.forEach(function(options, name) {
      dest._attributes[name] = fork(this._attributes[name], graph);
    }, this);
  }
  
  _forkRelationships(dest, graph) {
    this.eachLoadedRelationship(function(name, relationship) {
      if(relationship.kind === 'hasMany') {
        dest[name] = fork(this[name], graph);
      } else {
        dest[name] = this[name] && graph.adopt(this[name]);
      }
    }, this);
  }
  
  static defineSchema(obj) {
    this.schema = new Schema(obj);
  }
  
  diff(b) {
    return new ModelDiff(this, b);
  }
}

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

Model.reopen({
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
