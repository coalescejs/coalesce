/**
 * Used by the container to resolve factories.
 */
export default class Resolver {

  constructor() {
    this._typeRegistry = {};
    this._providerRegistry = {};
  }

  resolveType(type) {
    return this._normalizeType(type);
  }

  resolveProvider(type, name) {
    type = this.resolveType(type);
    let cached = this._getCachedProvider(type, name);
    if(cached) {
      return cached;
    }

    let provider;
    // 1. Check type for decorator/static property
    if(type[name]) {
      provider = type[name];
    }

    if(provider) {
      this._setCachedProvider(type, name, provider);
      return provider;
    } else {
      throw `Nothing resolved for provider '${name}' for type '${type}'`;
    }
  }

  registerType(type) {
    this._typeRegistry[type.typeKey] = type;
  }

  registerProvider(type, name, provider) {
    type = this.resolveType(type);
    this._setCachedProvider(type, name, provider);
  }

  /**
   * @private
   *
   * Ensure we are always dealing with an actual type or string in the case
   * of a primitive.
   */
  _normalizeType(type) {
    if(typeof type === 'string') {
      let cached = this._typeRegistry[type];
      // TODO implement loading mechanism
      if(!cached) {
        // TODO think through primitive types
        return {typeKey: type};
      } else {
        return cached;
      }
    }

    // OPTIMIZATION: if we see an implemented type, lets cache so that we can
    // later access via typeKey
    if(!this._typeRegistry[type.typeKey]) {
      this._typeRegistry[type.typeKey] = type;
    }

    return type;
  }


  /**
   * @private
   */
  _getCachedProvider(type, name) {
    let registry = this._providerRegistry[type.typeKey];
    return registry && registry[name];
  }


  /**
   * @provider
   */
  _setCachedProvider(type, name, provider) {
    let registry = this._providerRegistry[type.typeKey];
    if(!registry) {
      registry = this._providerRegistry[type.typeKey] = {};
    }
    registry[name] = provider;
  }

}
