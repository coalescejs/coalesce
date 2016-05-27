/**
 * Used by the container to resolve factories.
 */
export default class Resolver {

  resolveType(typeKey) {
    // TODO: integrate with loader
    throw `No type resolved for ${typeKey}`
  }

  resolveProvider(type, name) {
    // 1. Check type for decorator/static property
    if(type[name]) {
      return type[name];
    }

    // 2. TODO integrate with loader

    throw `Nothing resolved for provider '${name}' for type '${type}'`;
  }

}
