/**
 * Middleware to immediately resolve load operations corresponding to entities
 * which are already loaded in the session.
 *
 * TODO: caching needs to be smart on the attribute-level
 */
export default class SessionCacheMiddleware {

  static singleton = true;

  async call({method, entity, session, refresh}, next) {
    if( method === 'GET' &&
        session &&
        !refresh &&
        this.shouldCache(entity)) {

      return session.get(entity);
    }
    return next();
  }

  // for now we only add the entity if some attributes are loaded,
  // eventually this will be on a per-attribute basis
  shouldCache(entity) {
    return entity.isLoaded;
  }

}
