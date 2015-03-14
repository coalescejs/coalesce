import EntitySet from '../collections/entity_set';
import Graph from '../collections/graph';
import CollectionManager from './collection_manager';
import Model from '../entities/model';
import Query from '../entities/query';
import Flush from './flush';
import copy from '../utils/copy';
import Error from '../error';
import array_from from '../utils/array_from';
import evented from '../utils/evented';

var uuid = 1;

var defaults = _.defaults;

// TODO: use WeakMap and WeakSet
export default class Session extends Graph {

  constructor({context, idManager, parent}) {
    super();
    this.context = context;
    this.idManager = idManager;
    this.parent = parent;
    this.collectionManager = new CollectionManager();
    this.shadows = new Graph();
    this.newEntities = new EntitySet();
    this._dirtyCheckingSuspended = false;
    this.name = "session" + uuid++;
  }

  /**
    Instantiates a model but does *not* add it to the session. This is equivalent
    to calling `create` on the model's class itself.
    
    @method create
    @param {String} type the typeKey of the model
    @param {Object} hash the initial attributes of the model
    @return {Model} the instantiated model
  */
  build(type, hash) {
    type = this._typeFor(type);
    var model = new type(hash || {});
    return model;
  }

  /**
    Creates a model within the session.
    
    @method create
    @param {String} type the typeKey of the model
    @param {Object} hash the initial attributes of the model
    @return {Model} the created model
  */
  create(type, hash) {
    var model = this.build(type, hash);
    return this.adopt(model);
  }
  
  adopt(entity) {
    this.reifyClientId(entity);
    return super(entity);
  }

  add(entity) {
    console.assert(!entity.session, "Entity is already associated with a session");
    this.reifyClientId(entity);
    super(entity);
    if(entity.isNew) {
      this.newEntities.add(entity);
    }
    return entity;
  }

  /**
    Removes the model from the session.

    This does not mean that the model has been necessarily deleted,
    just that the session should no longer keep track of it.

    @method remove
    @param {Coalesce.Model} model The model to remove from the session
  */
  remove(entity) {
    this.reifyClientId(entity);
    this.shadows.remove(entity);
    this.newEntities.remove(entity);
    return super(entity);
  }

  update(entity) {
    this.reifyClientId(entity);
    // TODO: this is kinda ugly
    var wasDeleted = this.fetch(entity).isDeleted;
    
    var res = super(entity);

    // handle deletion
    if(entity.isDeleted) {
      // no-op if already deleted
      if(!wasDeleted) {
        this.deleteModel(entity);
      }
    }
    
    return res;
  }

  deleteModel(model) {
    // if the model is new, deleting should essentially just
    // remove the object from the session
    if(model.isNew) {
      var newEntities = this.newEntities;
      newEntities.remove(model);
    } else {
      this.touch(model);
    }
    model.isDeleted = true;
    this.collectionManager.modelWasDeleted(model);
  }

  fetch(entity) {
    this.reifyClientId(entity);
    return super(entity);
  }

  /**
    Returns the model corresponding to the given typeKey and id
    or instantiates a new model if one does not exist.

    @returns {Model}
  */
  fetchById(type, id) {
    type = this._typeFor(type);
    var typeKey = type.typeKey;
    // Always coerce to string
    id = id+'';

    var model = this.getById(typeKey, id);
    if(!model) {
      model = this.build(typeKey, {id: id});
      this.add(model);
    }

    return model;
  }
  

  /**
    Loads data for an entity.

    @returns {Promise}
  */
  load(entity, opts={}) {
    // BACK-COMPAT: load used to be the same as find
    if(!entity.isEntity) {
      return this.find.apply(this, arguments);
    }
    
    // For a load operation, by default we don't serialize params
    defaults(opts, {serialize: false});
    
    var promise;
    if(this.parent) {
      promise = this.parent.load(entity, opts);
    } else {
      console.assert(!entity.isModel || entity.id, "Cannot load a model without an id");
      // TODO: this should be done on a per-attribute bases
      var cache = this._cacheFor(entity),
          adapter = this._adapterFor(entity);
      
      if(!opts.skipCache) {  
        promise = cache.getPromise(entity)
      }

      if(promise) {
        // the cache's promise is not guaranteed to return anything
        promise = promise.then(function() {
          return entity;
        });
      } else {
        promise = adapter.load(entity, opts, this);
        cache.add(entity, promise);
      }
    }
    
    promise = promise.then((serverEntity) => {
      return this.merge(serverEntity);
    }, (error) => {
      // TODO: think through 404 errors, delete the entity?
      return this.revert(entity);
    });

    return promise;
  }
  
  /**
    Convenience wrapper around load which ensures that the adapter
    will be hit.
    
    @params {Entity} entity the entity to refresh
    @return {Promise}
  */
  refresh(entity, opts={}) {
    defaults(opts, {skipCache: true});
    return this.load(entity, opts);
  }

  /**
    @deprecated
    
    Delegates to either `query` or `load` based on the parameter types
    
    @returns {Promise}
  */
  find(type, paramsOrId, opts) {
    if (typeof paramsOrId === 'object') {
      return this.query(type, paramsOrId, opts);
    }
    var model = this.fetchById(type, paramsOrId);
    return this.load(model, opts);
  }
  
  /**
    @private
    
    Build a query instance
  */
  buildQuery(type, params) {
    type = this._typeFor(type);
    return new Query(this, type, params);
  }
  
  /**
    Similar to `fetch`, this method returns a cached local result of the query
    without a trip to the server.
    
    @param {Type} type the type to query against
    @param {object} params the query parameters
    @return {Query}
  */
  fetchQuery(type, params) {
    type = this._typeFor(type);
    var clientId = Query.clientId(type, params),
        entity = this.getByClientId(clientId);
    if(!entity) {
      entity = new Query(type, params);
      entity = this.adopt(entity);
    }
    return entity;
  }

  /**
    Queries the server.

    @param {Type} type Type to query against
    @param {object} params Query parameters
    @param {object} opts Additional options
    @return {Promise}
  */
  query(type, params, opts) {
    var type = this._typeFor(type),
        query = this.fetchQuery(type, params);
        
    return this.load(query, opts);
  }

  get(entity) {
    var res = super(entity);
    if(!res && this.parent) {
      res = this.parent.get(entity);
      if(res) {
        return res.lazyCopy(this);
      }
    }
    return res;
  }

  getById(typeKey, id) {
    var clientId = this.idManager.getClientId(typeKey, id);
    return this.getForClientId(clientId);
  }

  getByClientId(clientId) {
    var res = super(clientId);
    if(!res && this.parent) {
      res = this.parent.getByClientId(clientId);
      if(res) {
        return res.lazyCopy(this);
      }
    }
    return res;
  }

  reifyClientId(model) {
    this.idManager.reifyClientId(model);
  }

  remoteCall(context, name, params, opts) {
    var session = this,
        adapter = this._adapterFor(context)

    if(opts && opts.deserializationContext && typeof opts.deserializationContext !== 'string') {
      opts.deserializationContext = opts.deserializationContext.typeKey;
    }
    
    var shadow;
    if(context && context.isModel) {
      shadow = this.shadows.get(context);
    }

    return adapter.remoteCall(context, name, params, shadow, opts, this);
  }

  get dirtyModels() {
    var models = new EntitySet(array_from(this.shadows).map(function(model) {
      return this.get(model);
    }, this));

    this.newEntities.forEach(function(model) {
      models.add(model);
    });

    return models;
  }

  suspendDirtyChecking(callback, binding) {
    // could be nested
    if(this._dirtyCheckingSuspended) {
      return callback.call(binding || this);
    }

    try {
      this._dirtyCheckingSuspended = true;
      return callback.call(binding || this);
    } finally {
      this._dirtyCheckingSuspended = false;
    }
  }

  newSession() {
    var child = new this.constructor({
      parent: this,
      context: this.context,
      idManager: this.idManager
    });
    return child;
  }

  /**
    Invalidate the cache for a particular entity. This has the
    effect of making the next `load` call hit the server.

    @method invalidate
    @param {Model} model
  */
  invalidate(entity) {
    var cache = this._cacheFor(entity);
    return cache.remove(entity);
  }
  
  /**
    Invalidate the cache for all queries corresponding to a particular Type.

    @method invalidateQueries
    @param {Type} type Type to invalidate
  */
  invalidateQueries(type) {
    var type = this._typeFor(type),
        queryCache = this._queryCacheFor(type);
    queryCache.clear();
  }

  /**
    Mark an entity as clean. This will prevent future
    `flush` calls from persisting this entity's state to
    the server until the entity is marked dirty again.

    @method markClean
    @param {Entity} entity
  */
  markClean(entity) {
    // as an optimization, model's without shadows
    // are assumed to be clean
    this.shadows.remove(entity);
  }

  /**
    Mark an entity as dirty. 

    @method touch
    @param {Entity} entity
  */
  touch(entity) {
    if(this._dirtyCheckingSuspended) {
      return;
    }
    // Embedded models dirty their parents as well
    if(entity._embeddedParent) {
      this.touch(entity._embeddedParent);
    }
    console.assert(this.has(entity), `${entity} is not part of a session`);
    if(!entity.isNew) {
      var shadow = this.shadows.get(entity);
      if(!shadow) {
        this.shadows.update(entity);
      }
    }
    entity.clientRev++;
  }


  /**
    Whether or not the session is dirty.

    @property isDirty
  */
  get isDirty() {
    return this.dirtyModels.size > 0;
  }

  /**
    Merge in raw serialized data into this session
    for the corresponding type.

    @method mergeData
    @param {Object} data the raw unserialized data
    @param String [typeKey] the name of the type that the data corresponds to
    @returns {any} the deserialized models that were merged in
  */
  mergeData(data, typeKey) {
    return this._adapterFor(typeKey).mergeData(data, typeKey, this);
  }

  /**
    Update the parent session with all changes local
    to this child session.

    @method updateParent
  */
  updateParent() {
    if(!this.parent) {
      throw new Error("Session does not have a parent");
    }
    // flush all local updates to the parent session
    var dirty = this.dirtyModels,
        parent = this.parent;
    
    dirty.forEach(function(model) {
      // XXX: we want to do this, but we need to think about
      // revision numbers. The parent's clientRev needs to tbe
      // the childs normal rev.

      // "rebase" against parent version
      // var parentModel = parent.get(model);
      // if(parentModel) {
      //   this.merge(parentModel);
      // }
      
      // update the values of a corresponding model in the parent session
      // if a corresponding model doesn't exist, its added to the parent session
      parent.update(model); 
    }, this);
  }

  /**
    Similar to `flush()` with the additional effect that the models will
    be immediately updated in the parent session. This is useful when
    you want to optimistically assume success.

    @method flushIntoParent
  */
  flushIntoParent() {
    if(!this.parent) {
      throw new Error("Session does not have a parent");
    }
    this.updateParent();
    return this.flush();
  }
  
  /**
    Persist a single model down to the server
  */
  persist(model, opts, flush=null) {    
    // optimistically assume updates succeed, revert() call below
    // will revert this on failure
    this.markClean(model);
    this.newEntities.remove(model);
    
    if(!flush) {
      flush = new Flush(this);
      flush.performLater();
    }
        
    return flush.add(model, opts).then((serverEntity) => {
      this.merge(serverEntity);
    }, (error) => {
      // TODO: handle new data
      this.revert(shadow);
    });
  }
  
  /**
    Sends all local changes down to the server
    
    @return {Promise}
  */
  flush(models=this.dirtyModels) {
    // XXX: move this
    this.emit('willFlush', models);
    
    var flush = new Flush(this);
    flush.performLater();
    
    models.forEach(function(model) {
      this.persist(model, null, flush);
    }, this);

    return flush;
  }
  
  /**
    Merges new data for an entity into this session.

    If the corresponding entity inside the session is "dirty"
    and has not been successfully flushed, the local changes
    will be merged against these changes.

    By default, if no server versioning information is specified,
    this data is assumed to be more current than what is in
    the session. If no client versioning information is specified,
    this data is assumed to have not seen the latest client changes.

    @method merge
    @param {Entity} entity The entity to merge
  */
  merge(serverEntity) {
    if(this.parent) {
      serverEntity = this.parent.merge(serverEntity);
    }
    // TODO clean this up
    // We need to recurse to reify clientIds since we hit issues
    // when updating the shadow
    if(!serverEntity.clientId || serverEntity.isRelationship) {
      this.reifyClientId(serverEntity);
      for(var childEntity of serverEntity.entities()) {
        this.reifyClientId(childEntity);
      }
    }
    
    var entity = this.fetch(serverEntity),
        shadow = this.shadows.get(serverEntity);
        
    // Some backends will not return versioning information. In this
    // case we just fabricate our own server versioning, assuming that
    // all new entities are a newer version.
    // NOTE: rev is also used to break merge recursion
    if(!serverEntity.rev) {
      serverEntity.rev = (entity.rev === null || entity.rev === undefined) ? 1 : entity.rev + 1;
    }
    
    // Optimistically assume has seen client's version if no clientRev set
    if(!serverEntity.clientRev) {
      serverEntity.clientRev = (shadow || entity).clientRev;
    }
    
    // Have we already seen this version?
    if(entity.rev >= serverEntity.rev) {
      return entity;
    }
    
    // If a entity comes in with a clientRev that is lower than the
    // shadow it is to be merged against, then the common ancestor is
    // no longer tracked. In this scenario we currently just toss out.
    if(shadow && shadow.clientRev > serverEntity.clientRev) {
      console.warn(`Not merging stale entity ${serverEntity}`)
      return entity;
    }
    
    var childrenToRecurse = [];
    for(var childEntity of serverEntity.entities()) {
      // recurse on detached/embedded children entities
      // TODO needs to be embedded only in this relationship
      if(childEntity.isLoaded && (childEntity.isEmbedded || childEntity.isDetached)) {
        childrenToRecurse.push(childEntity);
      }
    }
    
    // If there is no shadow, then no merging is necessary and we just
    // update the session with the new data
    if(!shadow) {
      this.suspendDirtyChecking(function() {
        entity = this.update(serverEntity);
      });
      
      // TODO: move this check to update?
      if(!entity.isNew) {
        this.newEntities.remove(entity);
      }
    } else {
      this.suspendDirtyChecking(function() {
        entity = this._merge(entity, shadow, serverEntity);
      }, this);
      
      if(entity.isDeleted) {
        this.remove(merged);
      } else {
        // After a successful merge we update the shadow to the
        // last known value from the server. As an optimization,
        // we only create shadows if the entity has been dirtied.
        // TODO: diff the entity with the serverEntity and see if
        // we can remove the shadow entirely
        console.assert(this.has(entity));
        this.shadows.update(serverEntity);
      }
    }
    
    this._cacheFor(serverEntity).add(serverEntity);
    
    // recurse on detached and embedded children
    childrenToRecurse.forEach(function(child) {
      this.merge(child);
    }, this);

    return entity;
  }
  
  /**
    @private
    
    Do the actual merging.
  */
  _merge(entity, shadow, serverEntity) {
    console.assert(serverEntity.id || !shadow.id, `Expected ${entity} to have an id set`);
    // set id for new records
    entity.id = serverEntity.id;
    if(!entity.clientId) {
      entity.clientId = serverEntity.clientId;
    } else {
      console.assert(entity.clientId === serverEntity.clientId, "Client ids do not match");
    }
    // copy the server revision
    entity.rev = serverEntity.rev;
    
    // TODO: move merging isDeleted into merge strategy
    // entity.isDeleted = serverEntity.isDeleted;

    var strategy = this._mergeFor(serverEntity);
    strategy.merge(entity, shadow, serverEntity, this);

    return entity;
  }
  
  /**
    Invoked when a server operation fails and the shadow needs to be
    reverted back to an earlier version.
    
    TODO: check to see if we still need a shadow after reverting
    
    @method revert
    @param {entity} original The original version of the entity
  */
  revert(original) {
    if(this.parent) {
      original = this.parent.revert(original);
    }
    
    this.reifyClientId(original);
    
    var entity = this.get(original);
    console.assert(!!entity, "Cannot revert non-existant entity");
        
    if(!entity.isNew) {
      var shadow = this.shadows.get(original);
      if(!original.rev || shadow && shadow.rev <= original) {
        // "rollback" shadow to the original
        console.assert(this.has(original));
        this.shadows.update(original);
      }
      return this.shadows.get(original);
    } else {
      // re-track the entity as a new entity
      this.newEntities.add(entity);
      return this.newEntities.get(original);
    }
  }
  
  _typeFor(key) {
    return this.context.typeFor(key);
  }
  
  _cacheFor(key) {
    if(key.isEntity && !key.isModel) {
      return this._queryCacheFor(key.type);
    } else {
      return this._modelCacheFor(key);
    }
  }
  
  _queryCacheFor(key) {
    return this.context.configFor(key).get('queryCache');
  }
  
  _modelCacheFor(key) {
    return this.context.configFor(key).get('modelCache');
  }
  
  _adapterFor(key) {
    if(key.isEntity && !key.isModel) {
      key = key.type;
    }
    return this.context.configFor(key).get('adapter');
  }

  _mergeFor(key) {
    if(key.isRelationship) {
      if(key.field.kind === 'hasMany') {
        key = 'has-many';
      } else {
        key = 'belongs-to';
      }
    }
    return this.context.configFor(key).get('merge');
  }

  toString() {
    var res = this.name;
    if(this.parent) {
      res += "(child of " + this.parent.toString() + ")";
    }
    return res;
  }
  
}

Session.prototype.isSession = true;

// Legacy aliases
Session.prototype.getModel = Session.prototype.get;
Session.prototype.getForId = Session.prototype.getById;
Session.prototype.getForClientId = Session.prototype.getByClientId;

// XXX: Hack to get around Ember container
Session.extend = undefined;

evented(Session.prototype);
