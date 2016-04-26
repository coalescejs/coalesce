import IdManager from './session/id-manager';
import EntitySet from './utils/entity-set';
import Container from './container';

/**
 * The main interface to Coalesce. Contains the client-side model-cache and
 * bridges the top-level interfaces with the lower-level adapters.
 */
export default class Session {


  /**
   * Create a session.
   *
   * @params {object} options
   */
  constructor({container=new Container()}={}) {
    this.container = container;
    this.entities = new EntitySet();
    this.shadows = new EntitySet();
    this.newEntities = new EntitySet();
    this.idManager = new IdManager();
  }


  /**
   * Build an instance of the type. Unlike `create`, this will not mark the
   * entity for creation.
   *
   * @param  {*}      type type identifier
   * @param  {object} hash initial attributes
   * @return {Model}       instantiated model
   */
  build(type, hash) {
    type = this.container.typeFor(type);
    let entity = new type(hash || {});
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
  create(type, hash) {
    var entity = this.build(type, hash);
    return this._adopt(entity);
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

  // TODO
  getQuery(type, params) {

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
      res = this.build(entity.constructor, {id, clientId});
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

  fetchQuery(type, params) {
    // TODO
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
    Perform the query immediately
  */
  query(type, params) {

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
    Mark an entity as dirty. This will cause the model to be diffed against
    its shadow during the next flush.
  */
  touch(entity) {

  }

  /**
    Delete the entity.
  */
  delete(entity) {

  }


  /**
   * Merge an entity into the session.
   *
   * @param  {Entity} serverEntity the entity to merge
   * @return {Entity}              the merged entity within the session
   */
  merge(serverEntity) {
    
  }

  /**
    Revert the local changes in the session based on the passed in "original".
  */
  revert(originalEntity) {

  }

  /**
    Flush local changes back down to the remote server.
  */
  flush(entities) {

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

    // if(model.isNew) {
    //   this.newModels.add(model);
    // }
    // Only loaded models are stored on the session
    if(!entity.session) {
      this.entities.add(entity);
      entity.session = this;
    }
    return entity;
  }

  /**
    @private

    Ensure the passed in entity has a clientId
  */
  _reifyClientId(entity) {
    this.idManager.reifyClientId(entity);
  }


}
