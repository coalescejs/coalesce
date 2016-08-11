import Container from './container';
import Graph from './graph';

import diff from './utils/diff';

import {defaults} from 'lodash';

import QueryParamsMiddleware from './middleware/query-params';
import UrlMiddleware from './middleware/url';
import SerializeMiddleware from './middleware/serialize';
import JsonMiddleware from './middleware/json';
import FetchMiddleware from './middleware/fetch';
import SessionCacheMiddleware from './middleware/session-cache';
import PromiseCacheMiddleware from './middleware/promise-cache';

/**
 * The Adapter is the main object responsible for interfacing with a remote server.
 */
export default class Adapter {

  static singleton = true;
  static dependencies = [Container];

  static middleware = [
    PromiseCacheMiddleware,
    SessionCacheMiddleware,
    QueryParamsMiddleware,
    UrlMiddleware,
    SerializeMiddleware,
    JsonMiddleware,
    FetchMiddleware
  ];

  constructor(container) {
    this.container = container;
    this.middleware = this.constructor.middleware.map((klass) => {
      return this.container.get(klass);
    });
  }

  /**
   * Load data for an entity from a remote server.
   *
   * @param  {Entity}  entity  the entity to load
   * @param  {object}  opts    options
   * @param  {Session} session the session
   * @return {Promise}
   */
  load(entity, opts={}, session) {
    console.assert(!entity.isModel || entity.id, "Cannot load a model without an id");
    return this._invoke({
      entity,
      session,
      method: 'GET',
      serialize: false,
      refresh: false,
      ...opts
    });
  }

  /**
   * Provides a hook for the adapter to register dependencies required by the
   * persistence of the passed in entity.
   *
   * @param  {Entity} entity the entity to plan against
   * @param  {Entity} shadow the shadow
   */
  plan(entity, shadow, plan) {
    for(let d of diff(entity, shadow)) {
      // for a belongsTo, we depend on the relationship being persisted
      // before we can save this entity
      if(d.field.kind === 'belongsTo' && d.lhs && d.lhs.isNew) {
        plan.addDependency(entity, d.lhs);
      }
    }
  }

  /**
   * Persist data to a remote server.
   *
   * @param  {Entity}  entity  the entity to persist
   * @param  {Entity}  shadow  the last known remote version of the entity
   * @param  {object}  opts    options
   * @param  {Session} session the session
   * @return {Promise}
   */
  persist(entity, shadow, opts, session) {
    console.assert(!entity.isNew || !entity.isDeleted, "Cannot persist a new and deleted entity.");
    if(entity.isNew) {
      return this.create(entity, opts, session);
    } else if(entity.isDeleted) {
      return this.delete(entity, shadow, opts, session);
    } else {
      return this.update(entity, shadow, opts, session);
    }
  }

  /**
   * @private
   *
   * Update an entity.
   */
  update(entity, shadow, opts, session) {
    return this._invoke({
      entity,
      shadow,
      method: 'PUT',
      ...opts,
      session
    });
  }

  /**
   * @private
   *
   * Create an entity.
   */
  async create(entity, opts, session) {
    let created = await this._invoke({
      entity,
      method: 'POST',
      ...opts,
      session
    });
    created.isNew = false;
    return created;
  }


  /**
   * @private
   *
   * Delete an entity.
   */
  async delete(entity, shadow, opts, session) {
    let deleted = await this._invoke({
      entity,
      shadow,
      method: 'DELETE',
      ...opts,
      session
    });
    deleted.isDeleted = true;
    // make sure to bump the rev if we need to
    if(deleted.rev === entity.rev) {
      deleted.rev = entity.rev + 1;
    }
    return deleted;
  }

  /**
   * Invoke an arbitrary action on a remote server.
   *
   * @param  {Entity}  entity  the entity to persist
   * @param  {Entity}  shadow  the last known remote version of the entity
   * @param  {object}  opts    options
   * @param  {Session} session the session
   * @return {Promise}
   */
  remoteCall(context, action, params, opts, session) {
    let ctx = {
      entity,
      shadow,
      ...opts,
      session,
      action
    }
    return this._invoke(ctx);
  }

  /**
   * @private
   *
   * Invokes the middleware chain.
   */
  _invoke(ctx) {
    console.assert(ctx.entity.isEntity, "Entity is required");
    let middleware = this.middleware,
        middlewareIndex = 0,
        next;

    next = function() {
      console.assert(middlewareIndex < middleware.length, "End of middleware chain reached");
      let nextMiddleware = middleware[middlewareIndex++];
      return nextMiddleware.call(ctx, next);
    }

    return next();
  }

}
