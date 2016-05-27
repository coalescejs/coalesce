import IdManager from './id-manager';
import EntitySet from './utils/entity-set';
import Graph from './graph';
import DefaultContainer from './default-container';
import Query from './query';
import Plan from './session/plan';

/**
 * The main interface to Coalesce. Contains the client-side model-cache and
 * bridges the top-level interfaces with the lower-level adapters.
 *
 * A session and its contained entities are essentially a "graph" of models
 * and colections.
 */
export default class Session {

  /**
   * Create a session.
   *
   * @params {object} options
   */
  constructor({container=new DefaultContainer()}={}) {
    this.container = container;
    this.idManager = container.get(IdManager);
    this.entities = container.get(Graph);
    this.shadows = container.get(Graph);
    this.newEntities = new EntitySet();
  }

  /**
   * Build an instance of the type. Unlike `create`, this will not mark the
   * entity for creation.
   *
   * @param  {*}      type type identifier
   * @param  {object} hash initial attributes
   * @return {Model}       instantiated model
   */
  build(type, ...args) {
    type = this.container.typeFor(type);
    let entity = new type(this.entities, ...args);
    this._reifyClientId(entity);
    return entity;
  }

  /**
   * Create an instance of the type. This instance will be marked for creation
   * and will be persisted on the next call to `.flush()`.
   *
   * @param  {*}      type type identifier
   * @param  {object} hash initial attributes
   * @return {type}        created model
   */
  create(type, ...args) {
    return this.push(type, {...args, isNew: true});
  }

  /**
   * Push data directly into the session, bypassing merging. This is useful for
   * testing, but should be used caringly.
   *
   * @param  {*}      type type identifier
   * @param  {object} hash initial attributes
   * @return {type}        entity inside session
   */
  push(type, ...args) {
    var entity = this.build(type, ...args);
    this._adopt(entity);
    return entity;
  }

  /**
   * Get the corresponding instance of the entity within session. If the entity
   * is already part of this session it will return the same entity.
   *
   * @param  {Entity} entity entity
   * @return {Entity}        the entity within this session
   */
  get(entity) {
    return this.entities.get(entity);
  }


  /**
   * Test if the given entity exists in the session.
   *
   * @param  {Entity}  entity entity to check for
   * @return {boolean}        does the entity exist in the session
   */
  has(entity) {
    return !!this.get(entity);
  }


  /**
   * Get the corresponding instance of the entity for this session based on its
   * id or clientId.
   *
   * @param  {*}      type   type identifier
   * @param  {object} params hash containing `id` or `clientId`
   * @return {Entity}        the entity within this session
   */
  getBy(type, {id, clientId}) {
    type = this.container.typeFor(type);
    if(id) {
      id = id+'';
      clientId = this.idManager.getClientId(type.typeKey, id);
    }
    return this.entities.get({clientId});
  }


  /**
   * Get the corresponding query based on the type and params.
   *
   * @param  {*} type      the type
   * @param  {type} params the params for the query
   * @return {type}        the query in this session
   */
  getQuery(type, params) {
    let clientId = Query.clientId(type, params);
    return this.entities.get({clientId});
  }

  /**
   * Get the corresponding instance of the entity for this session or
   * initializes one if one does not exist. Unlike `.get`, this method will
   * always return an entity, regardless of whether it is already in the
   * session.
   *
   * @param  {Entity} entity
   * @return {Entity} entity within the session
   */
  fetch(entity) {
    let res = this.get(entity);
    if(!res) {
      let {id, clientId} = entity;
      res = this._adopt(this.build(entity.constructor, {id, clientId}));
    }
    return res;
  }

  /**
   * Similar to `.fetch()`, but allows lookup via `id`.
   *
   * @param  {*}      type identifier
   * @param  {object} object containing an `id` property
   * @return {Entity} entity within the session
   */
  fetchBy(type, {id}) {
    type = this.container.typeFor(type);
    id = id+'';
    let entity = this.getBy(type, {id});
    if(!entity) {
      entity = this.build(type, {id: id});
      this._adopt(entity);
    }
    return entity;
  }

  /**
   * Fetch the corresponding query based on the type and params. If a query
   * for this type/params combination does not already exist, it will be
   * built.
   *
   * @param  {*} type      the type
   * @param  {type} params the params for the query
   * @return {type}        the query in this session
   */
  fetchQuery(type, params) {
    let res = this.getQuery(type, params);
    if(!res) {
      res = this._adopt(this.build(Query, type, params));
    }
    return res;
  }

  /**
    Loads data for an entity.

    @returns {Promise}
  */
  async load(entity, opts={}) {
    // For a load operation, by default we don't serialize params
    opts = {
      serialize: false,
      ...opts
    };

    console.assert(!entity.isModel || entity.id, "Cannot load a model without an id");
    // TODO: this should be done on a per-attribute bases
    let cache = this.container.cacheFor(entity.constructor),
        adapter = this.container.adapterFor(entity.constructor),
        promise;

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

    promise = promise.then((serverEntity) => {
      return this.merge(serverEntity);
    }, (error) => {
      // TODO: think through 404 errors, delete the entity?
      return this.revert(entity);
    });

    return promise;
  }

  /**
    Perform the query immediately
  */
  query(type, params) {
    let query = this.fetchQuery(type, params);
    return this.load(query);
  }

  /**
    Invalidate this entity. This removes the entity from the session cache
    and will load additional data next time a `.load()` is called.
  */
  invalidate(entity) {

  }

  /**
    Invalidate all queries related to this type.
  */
  invalidateQueries(type) {

  }


  /**
   * Mark an entity as dirty. This will cause the model to be diffed against
   * its shadow during the next flush.
   *
   * @param  {type} entity the entity to mark dirty
   */
  touch(entity) {
    if(this._dirtyCheckingSuspended) {
      return;
    }
    // TODO Embedded models dirty their parents as well
    // if(entity._embeddedParent) {
    //   this.touch(entity._embeddedParent);
    // }
    console.assert(this.has(entity), `${entity} is not part of a session`);
    if(!entity.isNew) {
      var shadow = this.shadows.get(entity);
      if(!shadow) {
        this.shadows.update(entity);
      }
    }
    entity.clientRev++;
  }

  get dirtyEntities() {
    var entities = new EntitySet();
    for(var entity of this.shadows) {
      entities.add(this.entities.get(entity));
    }
    for(var entity of this.newEntities) {
      entities.add(entity);
    }
    return entities;
  }

  isEntityDirty(entity) {
    return this.dirtyEntities.has(entity);
  }

  /**
   * Delete an entity.
   *
   * @param  {type} entity the entity to delete
   */
  delete(entity) {
    if(entity.isNew) {
      this.newEntities.remove(entity);
    }
    entity.isDeleted = true;
    return entity;
  }


  /**
   * Update the corresponding entity in the session with the data contained
   * in the passed in entity.
   *
   * @param  {Entity} entity the source entity
   * @return {Entity}        the updated entity
   */
  update(entity) {
    let target = this.fetch(entity);
    return target.assign(entity);
  }

  /**
   * Merge an entity into the session.
   *
   * @param  {Entity} serverEntity the entity to merge
   * @return {Entity}              the merged entity within the session
   */
  merge(serverEntity) {
    if(this.parent) {
      if(serverEntity.session !== this.parent) {
        serverEntity = this.parent.merge(serverEntity);
      }
      // TODO use clientRev as rev
    }

    var entity = this.fetch(serverEntity),
        shadow = this.shadows.get(serverEntity);

    // Unloaded entities do not have any data to merge, nor should they
    // have versioning information
    if(!serverEntity.isLoaded) {
      return entity;
    }

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
    if(entity.rev && entity.rev >= serverEntity.rev) {
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
    for(var childEntity of serverEntity.relatedEntities()) {
      // recurse on detached/embedded children entities
      // TODO needs to be embedded only in "this" relationship
      if(childEntity.isLoaded && (childEntity.isEmbedded || childEntity.isDetached)) {
        childrenToRecurse.push(childEntity);
      }
    }

    // If there is no shadow, then no merging is necessary and we just
    // update the session with the new data
    if(!shadow) {
      this._withDirtyCheckingSuspended(function() {
        entity = this.update(serverEntity);
      });

      // TODO: move this check to update?
      if(!entity.isNew) {
        this.newEntities.delete(entity);
      }
    } else {
      this._withDirtyCheckingSuspended(function() {
        entity = this._merge(entity, shadow, serverEntity);
      }, this);

      if(entity.isDeleted) {
        this.delete(merged);
      } else {
        // After a successful merge we update the shadow to the
        // last known value from the server. As an optimization,
        // we only create shadows if the entity has been dirtied.
        console.assert(this.has(entity));
        // TODO: diff the entity with the serverEntity and see if
        // we can remove the shadow entirely
        shadow.assign(entity);
      }
    }

    // TODO
    // this._cacheFor(serverEntity).add(serverEntity);

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
      console.assert(entity.clientId === serverEntity.clientId, 'Client ids do not match');
    }
    // copy the server revision
    entity.rev = serverEntity.rev;

    // TODO: think through merging deleted models
    // entity.isDeleted = serverEntity.isDeleted;

    var strategy = this.container.mergeFor(serverEntity.constructor);
    strategy.merge(entity, shadow, serverEntity);

    return entity;
  }


  /**
   * Invoked when a server operation fails and the shadow needs to be reverted
   * back to an earlier version.
   *
   * @param  {type} original the value to revert to
   * @return {type}          the reverted entity
   */
  revert(original) {
    if(this.parent) {
      original = this.parent.revert(original);
    }

    this._reifyClientId(original);

    // TODO: traverse embedded relationships a la merge

    var entity = this.entities.get(original);
    console.assert(!!entity, "Cannot revert non-existant entity");

    if(!entity.isNew) {
      var shadow = this.shadows.get(original);
      if(!original.rev || shadow && shadow.rev <= original.rev) {
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

  /**
   * Return a plan consisting of what operations would take place if the passed
   * in collection of entities is persisted.
   *
   * @param  [iterable] entities the entities to persist, defaults to all dirty entities
   * @return {Plan}              the plan
   */
  plan(entities=this.dirtyEntities) {
    return container.create(Plan, this, entities);
  }

  /**
   * Persist all of the passed in entities.
   *
   * @param  [iterable] entities the entities to persist, defaults to all dirty entities
   * @return {Promise}           a promise that resolves to all entities persisted
   */
  flush(entities=this.dirtyEntities) {
    let plan = this.plan(entities);
    // TODO optimistically update shadows etc. set isNew = false
    return plan.execute();
  }

  /**
   * @private
   * Adds the entity to the session.
   *
   * @param  {Entity} entity
   * @return {Entity}
   */
  _adopt(entity) {
    this._reifyClientId(entity);
    console.assert(!entity.session || entity.session === this, "Entities cannot be moved between sessions. Use `get` or `merge` instead.");
    console.assert(!this.get(entity) || this.entities.get(entity) === entity, "An equivalent model already exists in the session!");
    this.entities.add(entity);
    entity.session = this;
    return entity;
  }

  /**
    @private

    Ensure the passed in entity has a clientId
  */
  _reifyClientId(entity) {
    this.idManager.reifyClientId(entity);
  }


  /**
   * @private
   */
  _withDirtyCheckingSuspended(callback, binding) {
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


}
