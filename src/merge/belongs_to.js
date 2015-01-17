import Base from './base';
import isEqual from '../utils/is_equal';

/**
  Merge strategy that merges on a per-field basis.

  Fields which have been editted by both will
  default to "ours".

  Fields which do not have an ancestor will default to
  "theirs".

  @namespace merge
  @class BelongsToMerge
*/
export default class BelongsToMerge extends Base {

  merge(ours, ancestor, theirs, session, relationship) {
    if(isEqual(ours, ancestor)) {
      // recurse on embedded and detached relationships
      if(theirs.isEmbedded || theirs.isDetached) {
        return session.merge(theirs);
      } else {
        return session.fetchModel(theirs);
      }
    }
    return ours;
  }

}
