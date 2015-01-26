import Base from './base';
import isEqual from '../utils/is_equal';

/**
  Merge strategy that merges on a per-field basis.

  Fields which have been editted by both will
  default to "ours".

  Fields which do not have an ancestor will default to
  "theirs".

  @namespace merge
  @class HasManyMerge
*/
export default class HasManyMerge extends Base {

  merge(ours, ancestor, theirs, session, relationship) {
    if(isEqual(ours, ancestor)) {
      // TODO: think about merging the actual object, not
      // returning the entire value
      return theirs.map(function(model) {
        return session.fetch(model);
      });
    }
    
    return ours;
  }

}
