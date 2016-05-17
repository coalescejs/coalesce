import Resolver from './resolver';

/**
 * Lighweight injection context and singleton registry.
 */
export default class Container {

  _instances = new Map();
  _types = {};
  _providers = new Registry();

  constructor(resolver=new Resolver()) {
    this.resolver = resolver;
  }

  /**
   * Return the type corresponding to a typeKey
   *
   * @param  {*}     type
   * @return {class}
   */
  typeFor(type) {
    if(typeof type === 'string') {
      let cached = this._types[type];
      if(!cached) {
        cached = this._types[type] = this.resolver.resolveType(type);
      }
      return cached;
    }

    // OPTIMIZATION: if we see an implemented type, lets cache so that we can
    // later access via typeKey
    if(!this._types[type.typeKey]) {
      this._types[type.typeKey] = type;
    }
    return type;
  }

  /**
   * Returns the singleton instance of the named provider.
   *
   * @param  {string|class} type
   * @param  {type} name    name of provider
   * @return {*}            instance of provider
   */
  providerFor(type, name) {
    type = this.typeFor(type);
    let provider = this._providers.get(type, name);
    if(!provider) {
      provider = this.resolver.resolveProvider(type, name);
    }
    return this._getInstance(provider);
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
   * @return {Cache}      cache
   */
  cacheFor(type) {
    return this.providerFor(type, 'cache');
  }

  /**
   * Return the merge strategy for a type.
   *
   * @param  {*}     type
   * @return {Merge}      merge strategy
   */
  mergeFor(type) {
    return this.providerFor(type, 'merge');
  }

  /**
   * Return the serializer for a type.
   *
   * @param  {*}          type
   * @return {Serializer}      serializer
   */
  serializerFor(type) {
    return this.providerFor(type, 'serializer');
  }


  /**
   * Explicitly register a type.
   *
   * @param  {type} type description
   */
  registerType(type) {
    if(typeof type === 'string') {
      type = {typeKey: type, primitive: true};
    }
    this._types[type.typeKey] = type;
  }


  /**
   * Explicitly register a provider.
   *
   * @param  {*} type
   * @param  {string} name
   * @param  {*} provider
   */
  registerProvider(type, name, provider) {
    type = this.typeFor(type);
    this._providers.set(type, name, provider);
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


class Registry {

  _types = {};

  get(type, name) {
    let registry = this._types[type.typeKey];
    return registry && registry[name];
  }

  set(type, name, provider) {
    let registry = this._types[type.typeKey];
    if(!registry) {
      registry = this._types[type.typeKey] = {};
    }
    registry[name] = provider;
  }

}
