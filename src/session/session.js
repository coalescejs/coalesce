import ModelSet from '../collections/model_set';
import Graph from '../collections/graph';
import CollectionManager from './collection_manager';
import InverseManager from './inverse_manager';
import Model from '../model/model';
import Query from './query';
import Flush from './flush';
import copy from '../utils/copy';
import Error from '../error';
import array_from from '../utils/array_from';
import evented from '../utils/evented';

var uuid = 1;

var defaults = _.defaults;

export default class Session extends Graph {

  constructor({context, idManager, parent}) {
    this.context = context;
    this.idManager = idManager;
    this.parent = parent;
    this.collectionManager = new CollectionManager();
    this.inverseManager = new InverseManager(this);
    this.shadows = new ModelSet();
    this.newModels = new ModelSet();
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
    var model = type.create(hash || {});
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
    return this.add(model);
  }

  adopt(model) {
    this.reifyClientId(model);
    console.assert(model.rev, "Model must have a rev property set");
    console.assert(!model.session || model.session === this, "Models instances cannot be moved between sessions. Use `add` or `update` instead.");;

    // Only loaded models are stored on the session
    if(!model.session) {
      // Need to register with the inverse manager before being added to the
      // session. Otherwise, in a child session, the entire graph will be
      // materialized.
      this.inverseManager.register(model);
      
      if(model.isNew) {
        this.newModels.add(model);
      }
    }
    return super(model);
  }

  add(model) {
    this.reifyClientId(model);
    super(model);
  }

  /**
    Removes the model from the session.

    This does not mean that the model has been necessarily deleted,
    just that the session should no longer keep track of it.

    @method remove
    @param {Coalesce.Model} model The model to remove from the session
  */
  remove(model) {
    this.reifyClientId(model);
    this.shadows.remove(model);
    this.newModels.remove(model);
    return super(model);
  }

  update(model) {
    this.reifyClientId(model);
    // TODO: this is kinda ugly
    var wasDeleted = this.fetch(model).isDeleted;
    
    var res = super(model);

    // handle deletion
    if(model.isDeleted) {
      // no-op if already deleted
      if(!wasDeleted) {
        this.deleteModel(dest);
      }
    }
    
    return dest;
  }

  deleteModel(model) {
    // if the model is new, deleting should essentially just
    // remove the object from the session
    if(model.isNew) {
      var newModels = this.newModels;
      newModels.remove(model);
    } else {
      this.modelWillBecomeDirty(model);
    }
    model.isDeleted = true;
    this.collectionManager.modelWasDeleted(model);
    this.inverseManager.unregister(model);
  }

  fetch(model) {
    this.reifyClientId(model);
    super(model);
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
      this.adopt(model);
    }

    return model;
  }
  
  /**
    Loads the model corresponding to the given typeKey and id.

    @returns {Promise}
  */
  load(type, id, opts) {
    var model = this.fetchById(type, id);
    return this.loadModel(model, opts);
  }

  /**
    Ensures data is loaded for a model.

    @returns {Promise}
  */
  loadModel(model, opts) {
    var promise;
    if(this.parent) {
      promise = this.parent.load(model, opts);
    } else {
      console.assert(model.id, "Cannot load a model without an id");
      // TODO: this should be done on a per-attribute bases
      var cache = this._modelCacheFor(model),
          adapter = this._adapterFor(model);
        
      if(!opts || opts.skipCache !== false) {  
        promise = cache.getPromise(model)
      }

      if(promise) {
        // the cache's promise is not guaranteed to return anything
        promise = promise.then(function() {
          return model;
        });
      } else {
        promise = adapter.load(model, opts, this);
        cache.add(model, promise);
      }
    }
    
    promise = promise.then((serverModel) => {
      this.merge(serverModel);
    }, (error) => {
      // TODO: think through 404 errors, delete the model?
      this.revert(model);
    });

    return promise;
  }
  
  /**
    Similar to `loadModel`, but guarntees a trip to the server and skips the
    session level model cache.
    
    @params {Model} model the model to refresh
    @return {Promise}
  */
  refresh(model, opts) {
    defaults(opts, {skipCache: true});
    return this.load(model, opts);
  }

  /**
    @deprecated
    
    Delegates to either `query` or `load` based on the parameter types
    
    @returns {Promise}
  */
  find(type, query, opts) {
    if (typeof query === 'object') {
      return this.query(type, query, opts);
    }
    return this.load(type, query, opts);
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
    var queryCache = this._queryCacheFor(type),
        query = queryCache.getQuery(type, params);
    
    if(!query) {
      query = this.buildQuery(type, params);
      queryCache.add(query);
    }
    
    return query;
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
        query = this.fetchQuery(type, params),
        queryCache = this._queryCacheFor(type),
        promise = queryCache.getPromise(query);
        
    if(!promise) {
      promise = this.refreshQuery(query, opts);
    }
    
    return promise;
  }
  
  /**
    Queries the server and bypasses the cache.
    
    @param {Type} type Type to query against
    @param {object} params Query parameters
    @param {object} opts Additional options
    @return {Promise}
  */
  refreshQuery(query, opts) {
    var adapter = this._adapterFor(query.type),
      promise = adapter.query(query, opts, this).then(function(models) {
      query.meta = models.meta;
      query.replace(0, query.length, models);
      return query;
    });
    var queryCache = this._queryCacheFor(query.type);
    queryCache.add(query, promise);
    
    return promise;
  }

  get(model) {
    var res = super(model);
    if(!res && this.parent) {
      res = this.parent.get(model);
      if(res) {
        res = this.fetch(res);
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
        res = this.fetch(res);
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

  modelWillBecomeDirty(model) {
    if(this._dirtyCheckingSuspended) {
      return;
    }
    // Embedded models dirty their parents as well
    if(model._embeddedParent) {
      this.modelWillBecomeDirty(model._embeddedParent);
    }
    this.touch(model);
  }

  get dirtyModels() {
    var models = new ModelSet(array_from(this.shadows).map(function(model) {
      return this.models.get(model);
    }, this));

    this.newModels.forEach(function(model) {
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
    var child = this.constructor.create({
      parent: this,
      context: this.context,
      idManager: this.idManager
    });
    return child;
  }

  getShadow(model) {
    var shadows = this.shadows;
    var models = this.models;
    // shadows are only created when the model is dirtied,
    // if no model exists in the `shadows` property then
    // it is safe to assume the model has not been modified
    return shadows.get(model) || models.get(model);
  }

  /**
    @private

    Updates the promise cache
  */
  updateCache(model) {
    var cache = this._modelCacheFor(model);
    cache.add(model);
  }

  /**
    Invalidate the cache for a particular model. This has the
    effect of making the next `load` call hit the server.

    @method invalidate
    @param {Model} model
  */
  invalidate(model) {
    var cache = this._modelCacheFor(model);
    cache.remove(model);
  }
  
  /**
    Invalidate the cache for a particular query.

    @method invalidateQuery
    @param {Query} query
  */
  invalidateQuery(query) {
    var queryCache = this._queryCacheFor(query.type);
    queryCache.remove(query);
  }
  
  /**
    Invalidate the cache for all queries corresponding to a particular Type.

    @method invalidateQueries
    @param {Type} type Type to invalidate
  */
  invalidateQueries(type) {
    var type = this._typeFor(type),
        queryCache = this._queryCacheFor(type);
    queryCache.removeAll(type);
  }

  /**
    Mark a model as clean. This will prevent future
    `flush` calls from persisting this model's state to
    the server until the model is marked dirty again.

    @method markClean
    @param {Coalesce.Model} model
  */
  markClean(model) {
    // as an optimization, model's without shadows
    // are assumed to be clean
    this.shadows.remove(model);
  }

  /**
    Mark a model as dirty. This will cause this model
    to be sent to the adapter during a flush.

    @method touch
    @param {Coalesce.Model} model
  */
  touch(model) {
    if(!model.isNew) {
      var shadow = this.shadows.get(model);
      if(!shadow) {
        this.shadows.addObject(model.copy())
      }
    }
    model.bump();
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
    this.newModels.remove(model);
    
    if(!flush) {
      flush = new Flush(this);
      flush.performLater();
    }
        
    return flush.add(model, opts).then(function(serverModel) {
      this.merge(serverModel);
    }, function(error) {
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
    this.emit('willFlush', dirtyModels);
    
    var flush = new Flush(this);
    flush.performLater();
    
    models.forEach(function(model) {
      this.persist(model, null, flush);
    }, this);

    return flush;
  }
  
  /**
    Merges new data for a model into this session.

    If the corresponding model inside the session is "dirty"
    and has not been successfully flushed, the local changes
    will be merged against these changes.

    By default, if no server versioning information is specified,
    this data is assumed to be more current than what is in
    the session. If no client versioning information is specified,
    this data is assumed to have not seen the latest client changes.

    @method merge
    @param {Model} model The model to merge
  */
  merge(serverModel) {
    if(this.parent) {
      serverModel = this.parent.merge(serverModel, visited);
    }
    this.reifyClientId(serverModel);
    
    var model = this.get(serverModel),
        shadow = this.shadows.get(serverModel);
        
    // Some backends will not return versioning information. In this
    // case we just fabricate our own server versioning, assuming that
    // all new models are a newer version.
    // NOTE: rev is also used to break merge recursion
    if(!serverModel.rev) {
      if(model) {
        serverModel.rev = model.rev++;
      } else {
        serverModel.rev = 0;
      }
    }
    
    // Optimistically assume has seen client's version if no clientRev set
    if(!serverModel.clientRev) {
      if(shadow || model) {
        serverModel.clientRev = (shadow || model).clientRev;
      } else {
        serverModel.clientRev = 0;
      }
    }
    
    // Have we already seen this version?
    if(model && model.rev >= serverModel.rev) {
      return model;
    }
    
    // If a model comes in with a clientRev that is lower than the
    // shadow it is to be merged against, then the common ancestor is
    // no longer tracked. In this scenario we currently just toss out.
    if(shadow && shadow.clientRev > serverModel.clientRev) {
      console.warn(`Not merging stale model ${serverModel}`)
      return model;
    }
    
    // If there is no shadow, then no merging is necessary and we just
    // update the session with the new data
    if(!shadow) {
      model = this.update(serverModel);
      
      // TODO: move this check to update?
      if(!model.isNew) {
        newModels.remove(model);
      }
    } else {
      model = this._merge(serverModel);
      
      if(model.isDeleted) {
        this.remove(merged);
      } else {
        // After a successful merge we update the shadow to the
        // last known value from the server. As an optimization,
        // we only create shadows if the model has been dirtied.
        // TODO: diff the model with the serverModel and see if
        // we can remove the shadow entirely
        shadows.update(model);
      }
    }
    
    this.updateCache(model);

    return model;
  }
  
  /**
    @private
    
    Do the actual merging.
  */
  _merge(dest, ancestor, model) {
    console.assert(model.id || !dest.id, `Expected ${model} to have an id set`);
    // set id for new records
    dest.id = model.id;
    dest.clientId = model.clientId;
    // copy the server revision
    dest.rev = model.rev;
    
    // TODO: move merging isDeleted into merge strategy
    // dest.isDeleted = model.isDeleted;
    
    // Reify child client ids before merging. This isn't semantically
    // required, but many data structures that might be used in the merging
    // process use client ids.
    model.eachChild(function(child) {
      this.reifyClientId(child);
    }, this);

    var strategy = this._mergeStrategyFor(model.typeKey);
    strategy.merge(dest, ancestor, model, session);

    return dest;
  }
  
  /**
    Invoked when a server operation fails and the shadow needs to be
    reverted back to an earlier version.
    
    TODO: check to see if we still need a shadow after reverting
    
    @method revert
    @param {Model} original The original version of the model
  */
  revert(original) {
    if(this.parent) {
      original = this.parent.revert(serverModel);
    }
    
    this.reifyClientId(original);
    
    var model = this.get(original);
    console.assert(!!model, "Cannot revert non-existant model");
        
    if(!model.isNew) {
      var shadow = this.shadows.get(original);
      if(!original.rev || shadow.rev <= original) {
        // "rollback" shadow to the original
        this.shadows.update(original);
      }
    } else if(model.isNew) {
      // re-track the model as a new model
      this.newModels.add(model);
    }
    
    return this.shadows.get(original);
  }

  
  /**
    @private
    
    When merging a new version of a model, it may contains relationship data for
    a relationship that it does not own. It is possible that this data could be
    stale and we need to unload to pervent clobbering a client's changed to the
    relationship.
  */
  _removeStaleRelationships(model, ancestor) {
    if(!ancestor) {
      return;
    }
    var adapter = this.context.configFor(model).get('adapter');
    model.eachLoadedRelationship(function(name, relationship) {
      if(ancestor.isFieldLoaded(name) && !adapter.isRelationshipOwner(relationship)) {
        delete model._relationships[name];
      }
    });
  }
  
  _typeFor(key) {
    return this.context.typeFor(key);
  }
  
  _adapterFor(key) {
    return this.context.configFor(key).get('adapter');
  }
  
  _modelCacheFor(key) {
    return this.context.configFor(key).get('modelCache');
  }
  
  _queryCacheFor(key) {
    return this.context.configFor(key).get('queryCache');
  }
  
  _mergeStrategyFor(key) {
    return this.context.configFor(key).get('mergeStrategy');
  }

  toString() {
    var res = this.name;
    if(this.parent) {
      res += "(child of " + this.parent.toString() + ")";
    }
    return res;
  }
  
}

// Legacy aliases
Session.prototype.getModel = Session.prototype.get;
Session.prototype.getForId = Session.prototype.getById;
Session.prototype.getForClientId = Session.prototype.getByClientId;

evented(Session.prototype);
