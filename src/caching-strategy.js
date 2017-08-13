/**
 * Determines the behavior of `Session.load` with regards to returning
 * cached data.
 */
export default class CachingStrategy {
  static singleton = true;

  constructor(session) {
    this.session = session;
    console.assert(!session.parent, 'Child sessions not supported');
  }

  useCache(entity, opts = {}) {
    return entity.isLoaded;
  }
}
