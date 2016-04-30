import BaseClass from '../utils/base_class';

/**
  Abstract base class for a three-way `Model` merge implementation.

  @namespace merge
  @class Base
*/
export default class Base extends BaseClass {

  merge(ours, ancestor, theirs) {
    // Not Implemented
  }

  mergeFor(typeKey) {
    return this.context.configFor(typeKey).get('mergeStrategy');
  }

}
