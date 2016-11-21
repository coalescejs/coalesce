import IdManager from './id-manager';
import EntitySet from './utils/entity-set';
import Graph from './graph';
import DefaultContainer from './default-container';
import Container from './container';
import Query from './query';
import Plan from './session/plan';

import isSuperset from './utils/is-superset';

/**
 * The main interface to Coalesce. Contains the client-side model-cache and
 * bridges the top-level interfaces with the lower-level adapters.
 *
 * A session and its contained entities are essentially a "graph" of models
 * and collections.
 */
export default class Session extends Graph {

  /**
   * Create a session.
   *
   * @params {Container} the container
   */
  constructor(container=new DefaultContainer(), parent) {
    super(container);
    this.parent = parent;
    this.shadows = container.get(Graph);
    this.newEntities = new EntitySet();
  }

  get isSession() {
    return true;
  }

  /**
   * Return a new child session.
   *
   * @return {Session}  session
   */
  child() {
    return this.container.create(Session, this);
  }

  /**
   * Create an instance of the type. This instance will be marked for creation
   * and will be persisted on the next call to `.flush()`.
   *
   * @param  {*}      type type identifier
   * @param  {object} hash initial attributes
   * @return {type}        created model
   */
  create(type, attrs) {
    let entity = this.build(type, {isNew: true, ...attrs});
    this.newEntities.add(entity);
    return entity;
  }

  /**
   * @override
   *
   * Get the corresponding instance of the entity within session. If the entity
   * is already part of this session it will return the same entity.
   *
   * @param  {Entity} entity entity
   * @return {Entity}        the entity within this session or undefined if it does not exist
   */
  get(entity) {
    let res = super.get(entity);
    // if we are in a child session, we want to pull from the parent
    if(!res && this.parent) {
      res = this.parent.get(entity);
      if(res) {
        // TODO: swap revisions?
        res = res.fork(this);
        this.add(res);
      }
    }
    return res;
  }

  /**
   * @override
   *
   * Test if the given entity exists in the session.
   *
   * This *does not* take into account whether the entity exists in the parent
   * session.
   *
   * @param  {Entity}  entity entity to check for
   * @return {boolean}        does the entity exist in the session
   */
  has(entity) {
    return super.has(entity);
  }


  /**
   * Get the corresponding query based on the type and params.
   *
   * @param  {*} type      the type
   * @param  {type} params the params for the query
   * @return {type}        the query in this session
   */
  getQuery(type, params) {
    let clientId = Query.clientId(this.idManager, type, params);
    return this.get({clientId});
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
  fetchQuery(type, params={}) {
    return this.fetchBy(Query, type, params);
  }

  /**
    Loads data for an entity.

    @returns {Promise}
  */
  async load(entity, opts={}) {
    let adapter = this.container.adapterFor(entity);

    return adapter.load(entity, opts, this).then((serverEntity) => {
      return this.merge(serverEntity);
    }, (error) => {
      // TODO: think through 404 errors, delete the entity?
      throw this.rollback(entity);
    });
  }

  /**
   * Fetch and load a model immediately.
   *
   * @param  {*}       type
   * @param  {Id}      id
   * @return {Promise}
   */
  find(type, id, ...opts) {
    let model = this.fetchBy(type, {id});
    return this.load(model, ...opts);
  }

  /**
   * Fetch and perform a query immediately.
   *
   * @param  {*}       type   the type
   * @param  {type}    params the params for the query
   * @return {Promise}
   */
  query(type, params) {
    let query = this.fetchQuery(type, params);
    return this.load(query);
  }

  /**
   * Mark an entity as dirty. This will cause the model to be diffed against
   * its shadow during the next flush.
   *
   * @param  {Entity} entity the entity to mark dirty
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

  /**
   * Invoke an arbitrary remote "call" on the associated adapter for the
   * context. This is useful for executing actions that do not fit the normal
   * CRUD paradigm.
   *
   * @param {*}       context the context of this remote call
   * @param {string}  name    the name of the remote actions
   * @param {object}  params  params to be passed to the underlying action
   * @param {object}  opts    options for the underlying request
   *
   * @return {Promise}        the result of the aciton
   */
  async remoteCall(context, name, params, opts) {
    if(typeof context === 'string') {
      let type = this.container.typeFor(context);
      // If the context is a string we infer an entity. The "singular" option
      // can be passed as false to infer a collection.
      if(!opts || opts.singular !== false) {
        context = this.build(type, {});
      } else {
        context = this.fetchQuery(type);
      }
    }
    let adapter = this.container.adapterFor(context);
    return adapter.remoteCall(context, name, params, opts, this);
  }

  /**
   * @return {EntitySet} All entities which are dirty inside this session.
   */
  get dirtyEntities() {
    var entities = new EntitySet();
    for(var entity of this.shadows) {
      entities.add(this.get(entity));
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
   * Mark an entity as destroyed. This will cause the underlying adapter to
   * delete the model next time `.flush()` is called. Once that happens, the
   * entity will be removed from the session.
   *
   * This is different from `.delete()`, which removes the entity from the session
   * immediately.
   *
   * @param  {type} entity the entity to delete
   */
  destroy(entity) {
    if(entity.isNew) {
      this.newEntities.remove(entity);
    }
    entity.isDeleted = true;
    return entity;
  }

  /**
   * @override
   */
  delete(entity) {
    this.shadows.delete(entity);
    this.newEntities.delete(entity);
    super.delete(entity);
  }

  /**
   * Merge an entity into the session.
   *
   * @param  {Entity} serverEntity the entity to merge
   * @return {Entity}              the merged entity within the session
   */
  merge(serverEntity) {
    // OPTIMIZATION: in the event of a session-cache hit, the adapter might
    // return the entity that is already in this session.
    if(serverEntity.session === this) {
      return serverEntity;
    }

    if(this.parent) {
      if(serverEntity.session !== this.parent) {
        serverEntity = this.parent.merge(serverEntity);
      }
      // TODO use clientRev as rev
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
    // NOTE: we also call `isSuperset` to ensure that the entity also has all of the fields
    if(entity.rev && entity.rev >= serverEntity.rev && isSuperset(entity, serverEntity)) {
      return entity;
    }

    // If a entity comes in with a clientRev that is lower than the
    // shadow it is to be merged against, then the common ancestor is
    // no longer tracked. In this scenario we currently just toss out.
    if(shadow && shadow.clientRev > serverEntity.clientRev) {
      console.warn(`Not merging stale entity ${serverEntity}`);
      return entity;
    }

    var childrenToRecurse = [];
    for(var childEntity of serverEntity.relatedEntities()) {
      // recurse on detached/embedded children entities
      // TODO needs to be embedded only in "this" relationship
      if(childEntity.isEmbedded || !childEntity.session) {
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
        this.delete(entity);
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

    // recurse on detached and embedded children
    for(var child of childrenToRecurse) {
      this.merge(child);
    }

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
   * Invoked when a server operation fails and the shadow needs to be rolled
   * back to an earlier version.
   *
   * @param  {type} original the value to rollback to
   * @return {type}          the rolled back entity
   */
  rollback(original) {
    if(this.parent) {
      original = this.parent.rollback(original);
    }

    // TODO: traverse embedded relationships a la merge

    let entity = this.get(original);
    console.assert(!!entity, "Cannot rollback non-existant entity");

    if(!entity.isNew) {
      let shadow = this.shadows.get(original);
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
   * Mark the entity as clean, effectively making any local modifications to
   * the entity appear as persisted.
   *
   * @param  {type}   entity the entity to commit
   * @return {Entity}        the entity
   */
  commit(entity) {
    if(entity.isNew) {
      entity.isNew = false;
      this.newEntities.delete(entity);
    } else {
      this.shadows.delete(entity);
    }
    return entity;
  }

  /**
   * Return a plan consisting of what operations would take place if the passed
   * in collection of entities is persisted.
   *
   * @param  [iterable] entities the entities to persist, defaults to all dirty entities
   * @return {Plan}              the plan
   */
  plan(entities=this.dirtyEntities) {
    return this.container.create(Plan, this, entities);
  }

  /**
   * Persist all of the passed in entities.
   *
   * @param  [iterable] entities the entities to persist, defaults to all dirty entities
   * @return {Promise}           a promise that resolves to all entities persisted
   */
  flush(entities=this.dirtyEntities) {
    let plan = this.plan(entities);
    for(var entity of entities) {
      this.commit(entity);
    }
    return plan.execute();
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
