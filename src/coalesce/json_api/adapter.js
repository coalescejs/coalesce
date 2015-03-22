import Coalesce from '../namespace';
import Adapter from '../adapter';
import EntitySet from '../collections/entity_set';

import {decamelize, pluralize, camelize} from '../utils/inflector';
import array_from from '../utils/array_from';

var defaults = _.defaults;

/**
  The JSON API adapter allows your store to communicate with an HTTP server by
  transmitting JSON via XHR.

  This adapter is built around the JSON API Standard: http://jsonapi.org/

  ## JSON Structure

  See: http://jsonapi.org/format/
*/
export default class JsonApiAdapter extends Adapter {
  constructor() {
    super(...arguments);
    this._pendingOps = {};
    this.middleware = [
      new BuildRequest(this),
      new ProcessPayload(this),
      new Serialize(this),
      new PerformRequest(this)
    ]
  }

  load(entity, opts, session) {
    if(entity.isModel) {
      return this._loadModel(entity, opts, session);
    } else {
      return this._loadQuery(entity, opts, session);
    }
  }

  _loadModel(entity, opts, session) {
    opts = opts || {};
    defaults(opts, {
      type: 'GET'
    });
    return this.invoke(entity, null, null, null, opts, session);
  }

  _loadQuery(query, opts, session) {
    opts = opts || {};
    defaults(opts, {
      type: 'GET',
      serialize: false,
      deserializer: 'payload',
    });
    return this.invoke(query, null, query.params, null, opts, session);
  }

  persist(entity, shadow, opts, session) {
    // TODO once we coalesce operations, handle embedded models here and
    // contextualize the parent's promise
    if(entity.isNew) {
      return  this.create(entity, opts, session);
    } else if(entity.isDeleted) {
      return this.delete(entity, shadow, opts, session);
    } else {
      return this.update(entity, shadow, opts, session);
    }
  }

  update(entity, shadow, opts, session) {
    opts = opts || {};
    defaults(opts, {
      type: 'PUT'
    });
    return this.invoke(entity, null, entity, shadow, opts, session);
  }

  create(entity, opts, session) {
    return this.invoke(entity, null, entity, null, opts, session);
  }

  delete(entity, shadow, opts, session) {
    opts = opts || {};
    defaults(opts, {
      type: 'DELETE'
    });
    return this.invoke(entity, null, null, null, opts, session);
  }

  /**
    Calls a custom endpoint on the remote server.

    The following options are available inside the options hash:

    * `type`: The request method. Defaults to `POST`.
    * `serialize`: Whether or not to serialize the passed in data
    * `serializer`: The name of the serializer to use on the passed in data
    * `deserialize`: Whether or not to deserialize the returned data
    * `deserializer`: The name of the serializer to use to deserialize returned data (defaults to `serializer`)
    * `serializerOptions`: Options to be passed to the serializer's `serialize`/`deserialize` methods
    * `params`: Additional raw parameters to be added to the final serialized hash sent to the server
    * `url`: A custom url to use

    @method remoteCall
    @param {any} context the entity or type that is used as the context of the call
    @param String name the name of the action to be called
    @param Object [opts] an options hash
    @param Session [session] the session to merge the results into
  */
  remoteCall(context, name, data, shadow, opts, session) {
    var serialize = data && !!data.isModel;
    opts = opts || {};
    defaults(opts, {
      serialize: serialize,
      deserializer: 'payload'
    });
    return this.invoke(context, name, data, shadow, opts, session)
  }

  /**
    Executes a request and invokes the middleware chain
  */
  invoke(context, name, data, shadow, opts, session) {
    var opts = this._normalizeOptions(opts),
        env = {context, name, data, shadow, opts, session},
        middleware = this.middleware,
        middlewareIndex = 0,
        next;

    next = function() {
      console.assert(middlewareIndex < middleware.length, "End of middleware chain reached");
      var nextMiddleware = middleware[middlewareIndex++];
      return nextMiddleware.call(next, env);
    }

    return next();
  }

  _normalizeOptions(opts) {
    opts = opts || {};
    // make sure that the context is a typeKey instead of a type
    if(opts.serializerOptions && typeof opts.serializerOptions.context === 'function') {
      opts.serializerOptions.context = opts.serializerOptions.context.typeKey;
    }
    return opts;
  }


  /**
    Builds a URL from a context. A context can be one of three things:

    1. An instance of a entity
    2. A string representing a type (typeKey), e.g. 'post'
    3. A hash containing both a typeKey and an id

    @method buildUrlFromContext
    @param {any} context
    @param {String} action
    @returns {String} url
  */
  buildUrlFromContext(context, action) {
    var typeKey, id;
    if(typeof context === 'string') {
      typeKey = context;
    } else if(context.isQuery) {
      typeKey = context.typeKey;
    } else {
      typeKey = context.typeKey;
      id = context.id;
    }
    var url = this.buildUrl(typeKey, id);
    if(action) {
      // TODO: hook to transform action name
      url = url + '/' + action;
    }
    return url;
  }

  /**
    Builds a URL for a given type and optional ID.

    By default, it pluralizes the type's name (for example, 'post'
    becomes 'posts' and 'person' becomes 'people'). To override the
    pluralization see [pathForType](#method_pathForType).

    If an ID is specified, it adds the ID to the path generated
    for the type, separated by a `/`.

    @method buildUrl
    @param {String} type
    @param {String} id
    @returns {String} url
  */
  buildUrl(typeKey, id) {
    var url = [],
        host = this.host,
        prefix = this.urlPrefix();

    if (typeKey) { url.push(this.pathForType(typeKey)); }
    if (id) { url.push(encodeURIComponent(id)); }

    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url) { url = '/' + url; }

    return url;
  }

  /**
    @method urlPrefix
    @private
    @param {String} path
    @param {String} parentUrl
    @return {String} urlPrefix
  */
  urlPrefix(path, parentURL) {
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
    Determines the pathname for a given type.

    By default, it pluralizes the type's name (for example,
    'post' becomes 'posts' and 'person' becomes 'people').

    ### Pathname customization

    For example if you have an object LineItem with an
    endpoint of "/line_items/".

    ```js
    Coalesce.RESTAdapter.reopen({
      pathForType(type) {
        var decamelized = decamelize(type);
        return pluralize(decamelized);
      };
    });
    ```

    @method pathForType
    @param {String} type
    @returns {String} path
  **/
  pathForType(type) {
    var camelized = camelize(type);
    return pluralize(camelized);
  }

  /**
    Takes an ajax response, and returns a relevant error.

    Returning a `Coalesce.InvalidError` from this method will cause the
    record to transition into the `invalid` state and make the
    `errors` object available on the record.

    ```javascript
    App.ApplicationAdapter = Coalesce.RESTAdapter.extend({
      ajaxError(jqXHR) {
        var error = this._super(jqXHR);

        if (jqXHR && jqXHR.status === 422) {
          var jsonErrors = jQuery.parseJSON(jqXHR.responseText)["errors"];

          return new Coalesce.InvalidError(jsonErrors);
        } else {
          return error;
        }
      }
    });
    ```

    Note: As a correctness optimization, the default implementation of
    the `ajaxError` method strips out the `then` method from jquery's
    ajax response (jqXHR). This is important because the jqXHR's
    `then` method fulfills the promise with itself resulting in a
    circular "thenable" chain which may cause problems for some
    promise libraries.

    @method ajaxError
    @param  {Object} jqXHR
    @return {Object} jqXHR
  */
  ajaxError(jqXHR) {
    if (jqXHR && typeof jqXHR === 'object') {
      jqXHR.then = null;
    }

    return jqXHR;
  }

  /**
    Takes a URL, an HTTP method and a hash of data, and makes an
    HTTP request.

    When the server responds with a payload, Coalesce Data will call into `extractSingle`
    or `extractArray` (depending on whether the original query was for one record or
    many records).

    By default, `ajax` method has the following behavior:

    * It sets the response `dataType` to `"json"`
    * If the HTTP method is not `"GET"`, it sets the `Content-Type` to be
      `application/json; charset=utf-8`
    * If the HTTP method is not `"GET"`, it stringifies the data passed in. The
      data is the serialized record in the case of a save.
    * Registers success and failure handlers.

    @method ajax
    @private
    @param {String} url
    @param {String} type The request type GET, POST, PUT, DELETE etc.
    @param {Object} hash
    @return {Promise} promise
  */
  ajax(url, type, hash) {
    var adapter = this;

    return new Coalesce.Promise(function(resolve, reject) {
      hash = adapter.ajaxOptions(url, type, hash);

      hash.success = function(json) {
        Coalesce.backburner.run(null, resolve, json);
      };

      hash.error = function(jqXHR, textStatus, errorThrown) {
        Coalesce.backburner.run(null, reject, adapter.ajaxError(jqXHR));
      };

      Coalesce.ajax(hash);
    }, "Coalesce: JsonApiAdapter#ajax " + type + " to " + url);
  }

  /**
    @method ajaxOptions
    @private
    @param {String} url
    @param {String} type The request type GET, POST, PUT, DELETE etc.
    @param {Object} hash
    @return {Object} hash
  */
  ajaxOptions(url, type, hash) {
    hash = hash || {};
    hash.url = url;
    hash.type = type;
    hash.dataType = 'json';
    hash.context = this;

    if (hash.data && type !== 'GET') {
      hash.contentType = 'application/json; charset=utf-8';
      hash.data = JSON.stringify(hash.data);
    }

    var headers = this.headers;
    if (headers !== undefined) {
      hash.beforeSend = function (xhr) {
        for(var key in headers) {
          if(!headers.hasOwnProperty(key)) continue;
          xhr.setRequestHeader(key, headers[key]);
        }
      };
    }

    return hash;
  }

  serializerFor(key) {
    return this.context.configFor(key).get('serializer');
  }

  serializerForContext(context) {
    return 'payload';
  }

}

class Middleware {

  constructor(adapter) {
    this.adapter = adapter;
  }

  //entity, shadow, session, opts
  call(next, env) {
    return next();
  }

}

/**
  @private

  Serialize/deserialize the payload from a POJO
*/
class Serialize extends Middleware {
  call(next, env) {
    this.serialize(env);

    return this.deserializePromise(next, env);
  }

  deserializePromise(next, {opts, context}) {
    var adapter = this.adapter,
        serializer = opts.deserializer || opts.serializer,
        serializerOptions = opts.serializerOptions || {};

    if(!serializer && context) {
      serializer = adapter.serializerForContext(context);
    }

    if(serializer) {
      serializer = adapter.serializerFor(serializer);
      defaults(serializerOptions, {context: context});
    }

    return next().then(function(data){
      // allow an empty response
      // TODO could clean this up
      if(!data || _.isEmpty(data)) {
        return null;
      }

      if(opts.deserialize !== false) {
        return serializer.deserialize(data, serializerOptions);
      }

      return data;
    }, function(xhr) {
      if(opts.deserialize !== false) {
        var data;
        if(xhr.responseText) {
          data = JSON.parse(xhr.responseText);
        } else {
          data = {};
        }

        serializerOptions = defaults(serializerOptions, {context: context, xhr: xhr});

        // TODO: handle other errors codes such as 409
        // determine serializer behavior off of xhr response code
        if(xhr.status === 422) {
          // in the event of a 422 response, handle a full payload, possibly with
          // models that have `error` properties, therefore we just use the same
          // serializer that we use in the success case
          throw serializer.deserialize(data, serializerOptions);
        } else {
          // treat other errors generically
          serializer = adapter.serializerFor(opts.errorSerializer || 'errors');
          var errors = serializer.deserialize(data, serializerOptions);
          if(context.isModel) {
            // if the context is a entity we want to return a entity with errors
            // so that it can be merged by the session
            var entity = context.unloadedCopy();
            entity.errors = errors;
            throw entity;
          }
          throw errors;
        }
      }
      throw xhr;
    });
  }

  serialize(env) {
    var adapter = this.adapter,
        opts = env.opts,
        data = env.data;

    if(opts.serialize !== false) {
      var serializer = opts.serializer,
          serializerOptions = opts.serializerOptions || {};

      if(!serializer && context) {
        serializer = this.adapter.serializerForContext(context);
      }

      if(serializer && data) {
        serializer = this.adapter.serializerFor(serializer);
        serializerOptions = defaults(serializerOptions, {context: context});
        env.data = serializer.serialize(data, serializerOptions);
      }
    }
  }
}

/**
  @private

  Handles the payload. "Sideloads" the models in the payloads `included` member.
*/
class ProcessPayload extends Middleware {
  call(next, {opts, session}) {
    if(opts && opts.deserialize === false) {
      return next();
    }

    function mergePayload(deserialized) {
      if(deserialized.isPayload) {
        for(var includedEntity of deserialized.included()) {
          session.merge(includedEntity);
        }
        return deserialized.context;
      }
      return deserialized;
    }

    return next().then(function(deserialized) {
      return mergePayload(deserialized);
    }, function(deserialized) {
      throw mergePayload(deserialized);
    });
  }
}

class BuildRequest extends Middleware {

  call(next, env) {
    var opts = env.opts,
        context = env.context,
        name = env.name;

    if(opts.url) {
      env.url = opts.url;
    } else {
      env.url = this.adapter.buildUrlFromContext(context, name);
    }

    if(opts.params) {
      env.data = env.data || {};
      env.data = defaults(env.data, opts.params);
    }

    env.method = opts.type || "POST";
    return next();
  }

}

class PerformRequest extends Middleware {
  call(next, env) {
    return this.adapter.ajax(env.url, env.method, {data: env.data});
  }
}
