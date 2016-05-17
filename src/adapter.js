import 'whatwg-fetch';

import {defaults} from 'lodash';

import {camelize, pluralize} from 'inflection';

/**
 * The Adapter is the main object responsible for interfacing with a remote server.
 */
export default class Adapter {

  constructor() {
    this.middleware = [
      ::this._build,
      ::this._serialize,
      ::this._json,
      ::this._fetch
    ];
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
    defaults(opts, {
      method: 'GET'
    });
    return this._invoke({context: entity, session, ...opts});
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
    throw new Error(`${this} does not support persist()`);
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
    throw new Error(`${this} does not support remoteCall()`);
  }



  /**
   * Determine the url for the given request context
   *
   * @param  {object} options
   * @return {String}         the url
   */
  resolveUrl({context, action}) {
    let typeKey,
        id;
        url = [];
    if(typeof context === 'string') {
      typeKey = context;
    } else if(context.isQuery) {
      typeKey = context.typeKey;
    } else {
      typeKey = context.typeKey;
      id = context.id;
    }
    var url = this._buildUrl(typeKey, id);
    if(action) {
      url = `${url}/${action}`;
    }
    return url;
  }

  /**
   * @private
   */
  _buildUrl(typeKey, id) {
    var url = [],
        host = this.host,
        prefix = this._urlPrefix();

    if (typeKey) { url.push(this._pathForType(typeKey)); }
    if (id) { url.push(encodeURIComponent(id)); }

    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url) { url = '/' + url; }

    return url;
  }

  /**
   * @private
   */
  _pathForType(type) {
    var camelized = camelize(type, true);
    return pluralize(camelized);
  }

  /**
    @private
  */
  _urlPrefix(path, parentURL) {
    var host = this.host,
        namespace = this.namespace,
        url = [];

    if (path) {
      // Absolute path
      if (path.charAt(0) === '/') {
        if (host) {
          path = path.slice(1);
          url.push(host);
        }
      // Relative path
      } else if (!/^http(s)?:\/\//.test(path)) {
        url.push(parentURL);
      }
    } else {
      if (host) { url.push(host); }
      if (namespace) { url.push(namespace); }
    }

    if (path) {
      url.push(path);
    }

    return url.join('/');
  }

  /**
   * @private
   *
   * Invokes the middleware chain.
   */
  _invoke(ctx) {
    let middleware = this.middleware,
        middlewareIndex = 0,
        next;

    next = function() {
      console.assert(middlewareIndex < middleware.length, "End of middleware chain reached");
      let nextMiddleware = middleware[middlewareIndex++];
      return nextMiddleware.call(nextMiddleware, ctx, next);
    }

    return next();
  }

  /**
   * @private
   *
   * Middleware to build the request.
   */
  async _build(ctx, next) {
    defaults(ctx, {
      url: this.resolveUrl(ctx)
    });
    return next();
  }

  /**
   * @private
   *
   * Middleware to serialize/deserialize using the serialization layer.
   */
  async _serialize(ctx, next) {
    // TODO
    return next();
  }

  /**
   * @private
   *
   * Middleware for JSON translation.
   */
  async _json(ctx, next) {
    let headers = ctx.headers = ctx.headers || {};
    defaults(headers, {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    let response = await next();

    return response.json();
  }


  /**
   * @private
   *
   * Middleware to perform the request
   */
  async _fetch({url, method, body, headers}, next) {
    return fetch(url, {method, body, headers});
  }

}
