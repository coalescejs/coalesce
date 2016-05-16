import DefaultResolver from './default-resolver';

/**
 * Lighweight injection context and singleton registry.
 */
export default class Container {

  _instances = new Map();

  constructor(resolver=new DefaultResolver()) {
    this.resolver = resolver;
  }

  /**
   * Return the type corresponding to a typeKey
   *
   * @param  {*}     type
   * @return {class}
   */
  typeFor(type) {
    return this.resolver.resolveType(type);
  }

  /**
   * Returns the singleton instance of the named provider.
   *
   * @param  {string|class} type
   * @param  {type} name    name of provider
   * @return {*}            instance of provider
   */
  providerFor(type, name) {
    let factory = this.resolver.resolveProvider(type, name);
    return this._getInstance(factory);
  }

  /**
   * Return the adapter for a type.
   *
   * @param  {*}     type
   * @return {Merge}     adapter
   */
  adapterFor(type) {
    return this.providerFor(type, 'adapter');
  }

  /**
   * Return the cache for a type.
   *
   * @param  {*}     type
   * @return {Cache}     cache
   */
  cacheFor(type) {
    return this.providerFor(type, 'cache');
  }

  /**
   * Return the merge strategy for a type.
   *
   * @param  {*}     type
   * @return {Merge}     merge strategy
   */
  mergeFor(type) {
    return this.providerFor(type, 'merge');
  }

  /**
   * @private
   *
   * Lookup a singleton instance within this container for the given type.
   */
  _getInstance(type) {
    let instance = this._instances.get(type);
    if(!instance) {
      // TODO dependency injection?
      instance = new type();
      this._instances.set(type, instance);
    }
    return instance;
  }

}
