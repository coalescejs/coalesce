
/**
 * Lighweight injection context and singleton registry.
 */
export default class Container {

  /**
   * typeFor - Return the type corresponding to a typeKey
   *
   * @param  {type} key
   * @return {type}
   */
  typeFor(key) {
    if(typeof key === 'string') {
      throw "Strings not supported";
    }
    return key;
  }

}
