/**
 * Middleware to resolve two equivalent pending load operations to the
 * same promise.
 */
export default class PromiseCacheMiddleware {

  promises = {};

  async call({method, entity}, next) {
    let {promises} = this;
    if(method === 'GET') {
      let promise = promises[entity.clientId];
      if(promise) {
        return promise;
      }
      let clear = () => {
        delete promises[entity.clientId];
      }
      // clear cache after promise resolves
      promise = next();
      promise.then(clear, clear);
      return promises[entity.clientId] = promise;
    } else {
      return next();
    }
  }

}
