import 'isomorphic-fetch';

/**
 * Middleware to perform the request
 */
export default class FetchMiddleware {

  async call({url, method, body, headers, credentials}, next) {
    return fetch(url, {method, body, headers, credentials});
  }

}
