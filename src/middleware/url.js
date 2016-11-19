import {isEmpty} from 'lodash';
import {camelize, pluralize} from 'inflection';
import qs from 'qs';

/**
 * Builds the url for the request.
 */
export default class UrlMiddleware {

  static singleton = true;

  constructor(baseUrl='/') {
    this.baseUrl = baseUrl;
  }

  async call(ctx, next) {
    if(!ctx.url) {
      ctx.url = this.resolveUrl(ctx);
    }
    return next();
  }

  /**
   * Determine the url for the given request entity
   *
   * @param  {object} options
   * @return {String}         the url
   */
  resolveUrl({entity, query, action}) {
    console.assert(entity.isEntity, "Entity is required");
    let typeKey,
        id;
        url = [];

    if(entity.isCollection) {
      typeKey = entity.type.typeKey;
    } else {
      typeKey = entity.typeKey;
      id = entity.id;
    }
    var url = this._buildUrl(typeKey, id);
    if(action) {
      url = `${url}/${action}`;
    }

    if(query && !isEmpty(query)) {
      url = `${url}?${this._buildQuery(query)}`;
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
        prefix = this.baseUrl;

    if (typeKey) { url.push(this._pathForType(typeKey)); }
    if (id) { url.push(encodeURIComponent(id)); }

    if (prefix && prefix !== '/') { url.unshift(prefix); }

    url = url.join('/');

    if(prefix === '/') {
      url = prefix + url;
    }

    return url;
  }

  /**
   * @private
   */
  _pathForType(type) {
    var camelized = camelize(type, true);
    return pluralize(camelized);
  }

}
