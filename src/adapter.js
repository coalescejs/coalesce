import Container from './container';

import diff from './utils/diff';

import {defaults} from 'lodash';

import QueryParamsMiddleware from './middleware/query-params';
import UrlMiddleware from './middleware/url';
import SerializeMiddleware from './middleware/serialize';
import JsonMiddleware from './middleware/json';
import FetchMiddleware from './middleware/fetch';
import SessionCacheMiddleware from './middleware/session-cache';
import PromiseCacheMiddleware from './middleware/promise-cache';
import EmbeddedMiddleware from './middleware/embedded';
import ErrorTranslationMiddleware from './middleware/error-translation';

import MiddlewareChain from './middleware-chain';

import {findEmbeddedRoot, eachEmbeddedChild} from './utils/embedded';

/**
 * The Adapter is the main object responsible for interfacing with a remote server.
 */
export default class Adapter {

  static singleton = true;
  static dependencies = [Container];

  static middleware = new MiddlewareChain([
    EmbeddedMiddleware,
    PromiseCacheMiddleware,
    SessionCacheMiddleware,
    QueryParamsMiddleware,
    UrlMiddleware,
    SerializeMiddleware,
    JsonMiddleware,
    ErrorTranslationMiddleware,
    FetchMiddleware
  ]);

  /**
   * Convenient macro to configure UrlMiddlware to use a baseUrl
   *
   * @param  {type}            url the base url for all requests
   * @return {MiddlewareChain}
   */
  static set baseUrl(url) {
    this.middleware = this.middleware.use(UrlMiddleware, url);
  }

  constructor(container) {
    this.container = container;
    this.middleware = this.constructor.middleware.instantiate(container);
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
    let root = findEmbeddedRoot(plan.session, entity);

    if(root && root !== entity) {
      plan.addDependency(entity, root);

      let parent = plan.session.get({clientId: entity._parent});
      // need to make sure te embedded parent has an associated operation
      plan.add(parent);
    }

    for(let child of eachEmbeddedChild(plan.session, entity)) {
      plan.add(child);
    }

    if(entity.isCollection) {
      return;
    }

    for(let d of diff(entity, shadow)) {
      // for a belongsTo, we depend on the relationship being persisted
      // before we can save this entity
      if(d.field.kind === 'belongsTo' && d.lhs && d.lhs.isNew) {
        plan.addDependency(root, d.lhs);
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
   * @param  {Entity}  entity  the entity to perform the action on
   * @param  {string}  action  the name of the action
   * @param  {object}  body    the body/params of the request
   * @param  {object}  opts    options
   * @param  {Session} session the session
   * @return {Promise}
   */
  remoteCall(entity, action, body, opts, session) {
    if(opts && opts.type) {
      console.warn(`'type:' has been deprecated, please use 'method:' instead`);
      opts.method = opts.type;
    }

    let ctx = {
      entity,
      action,
      body,
      method: 'POST',
      ...opts,
      session,
      action
    };
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
