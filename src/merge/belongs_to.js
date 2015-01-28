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

  merge(ours, ancestor, theirs, session) {
    var oursValue = ours.get(),
        ancestorValue = ancestor.get(),
        theirsValue = theirs.get();
    
    if(isEqual(oursValue, ancestorValue)) {
      ours.set(session.merge(theirsValue));
    }
    return ours;
  }

}
