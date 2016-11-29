import {defaults} from 'lodash';

/**
 * Extracts metadata from the payload and sets on the context.
 */
export default class MetaMiddleware {

  async call(ctx, next) {
    let hash = await next();

    if(hash.meta) {
      ctx.meta = hash.meta;
      delete hash.meta;
    }

    return hash;
  }

}
