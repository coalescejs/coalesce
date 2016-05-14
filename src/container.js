
/**
 * Lighweight injection context and singleton registry.
 */
export default class Container {

  _instances = new Map();

  /**
   * Return the type corresponding to a typeKey
   *
   * @param  {*} key
   * @return {class}
   */
  typeFor(key) {
    if(typeof key === 'string') {
      throw "Strings not supported";
    }
    return key;
  }

  /**
   * Return the merge strategy for a type.
   *
   * @param  {*}     key
   * @return {Merge}     merge strategy
   */
  mergeFor(key) {
    if(typeof key === 'string') {
      throw "Strings not supported";
    }
    let factory = key.merge;
    return this._resolveInstance(factory);
  }

  /**
   * @private
   *
   * Lookup a singleton instance within this container for the given type.
   */
  _resolveInstance(type) {
    let instance = this._instances.get(type);
    if(!instance) {
      // TODO dependency injection?
      instance = new type();
      this._instances.set(type, instance);
    }
    return instance;
  }

}
