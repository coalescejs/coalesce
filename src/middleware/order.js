import IdManager from '../id-manager';

/**
 * Middleware to maintain strict ordering around requests to resources.
 */
export default class OrderMiddleware {
  promises = {};

  async call({ method, entity }, next) {
    let { promises } = this;
    let promise = promises[entity.clientId];

    if (promise) {
      // It is possible that we are making another request for a model before
      // the initial "create" request has finished. In this case, we still need
      // to get the id for the entity.
      if (method !== 'POST' && !entity.id) {
        promise = promise.then(res => {
          entity.id = res.id;
          return next();
        });
      } else {
        promise = promise.then(next);
      }
    } else {
      promise = next();
    }

    let clear = () => {
      if (promises[entity.clientId] === promise) {
        delete promises[entity.clientId];
      }
    };

    promise.then(clear, clear);

    return (promises[entity.clientId] = promise);
  }
}
