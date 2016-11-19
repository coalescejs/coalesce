import {defaults} from 'lodash';

/**
 * JSON translation middleware.
 */
export default class JsonMiddleware {

  static singleton = true;

  async call(ctx, next) {
    let headers = ctx.headers = ctx.headers || {};
    defaults(headers, {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
    if(ctx.body) {
      ctx.body = JSON.stringify(ctx.body);
    }

    let response = await next();

    return response.json();
  }

}
