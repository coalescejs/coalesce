import {defaults, isEmpty} from 'lodash';
import {camelize, pluralize} from 'inflection';
import qs from 'qs';

/**
 * Builds the url for the request.
 */
export default class UrlMiddleware {

  static singleton = true;

  async call(ctx, next) {
    defaults(ctx, {
      url: this.resolveUrl(ctx)
    });
    return next();
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
    } else if(context.isCollection) {
      typeKey = context.type.typeKey;
    } else {
      typeKey = context.typeKey;
      id = context.id;
    }
    var url = this._buildUrl(typeKey, id);
    if(action) {
      url = `${url}/${action}`;
    }

    let queryParams = context.isCollection && context.params;
    if(queryParams && !isEmpty(queryParams)) {
      url = `${url}?${this._buildQuery(queryParams)}`;
    }

    return url;
  }

  /**
   * @private
   */
  _buildQuery(params) {
    return qs.stringify(params);
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

}
