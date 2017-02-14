import isEmpty from 'lodash/isEmpty';
import inflection from 'inflection';
const {pluralize} = inflection;
import qs from 'qs';

/**
 * Builds the url for the request.
 */
export default class UrlMiddleware {

  constructor(baseUrl='/') {
    this.baseUrl = baseUrl;
  }

  async call(ctx, next) {
    if(!ctx.url) {
      ctx.url = this.resolveUrl(ctx);
    }

    if(ctx.query && !isEmpty(ctx.query)) {
      ctx.url = this.appendQuery(ctx.url, ctx.query);
    }

    return next();
  }

  /**
   * Determine the url for the given request entity
   *
   * @param  {object} options
   * @return {String}         the url
   */
  resolveUrl({entity, action}) {
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

    return url;
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
    return pluralize(type);
  }

  appendQuery(url, query) {
    let joinChar;
    if(url.indexOf('?') === -1) {
      joinChar = '?';
    } else {
      joinChar = '&';
    }
    return url + joinChar + this.stringify(query);
  }

  stringify(query) {
    return qs.stringify(query, { arrayFormat: 'brackets' });
  }

}
