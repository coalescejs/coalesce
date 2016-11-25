import {
  EntityNotFound,
  EntityConflict,
  EntityInvalid,
  ServerError,
  NetworkError
} from '../errors';

/**
 * Middleware responsible for raises the correct CoalesceException for
 * certain response codes.
 */
export default class ErrorTranslationMiddleware {

  async call({entity}, next) {
    let response;
    try {
      response = await next();
    } catch(err) {
      throw new NetworkError(err);
    }

    if(response.status >= 200 && response.status < 300) {
      return response;
    } else if(response.status === 404) {
      throw new EntityNotFound(entity, response);
    } else if(response.status === 409) {
      throw new EntityConflict(entity, response);
    } else if(response.status === 422) {
      throw new EntityInvalid(entity, response);
    } else {
      throw new ServerError(response);
    }
  }

}
