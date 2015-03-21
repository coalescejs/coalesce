import Base from './base';
import isEqual from '../utils/is_equal';
import CollectionDiff from '../diff/collection';

var find = _.find;

/**
  Merge strategy for queries. Currently the logic is to just apply
  all the new changes on top of any local changes.
  
  TODO: handle conflicts, currently theirs will always win
  
  @namespace merge
  @class QueryMerge
*/
export default class QueryMerge extends Base {

  merge(ours, ancestor, theirs, session) {

    var oursDiff = new CollectionDiff(ours, ancestor),
        theirsDiff = new CollectionDiff(theirs, ancestor),
        indexTransform = 0,
        oursDiffIndex = 0,
        theirsDiffIndex = 0,
        oursIndex = 0,
        theirsIndex = 0;
    
    // TODO might need to sort by `newIndex`
    while(true) {
      
      var oursChange = oursDiffIndex < oursDiff.length ? oursDiff[oursDiffIndex] : undefined,
          theirsChange = theirsDiffIndex < theirsDiff.length ? theirsDiff[theirsDiffIndex] : undefined;
      
      if(!oursChange && !theirsChange) break;
      
      if(oursChange && oursChange.added) {
        oursIndex = oursChange.newIndex;
      }
      
      if(theirsChange && theirsChange.added) {
        theirsIndex = theirsChange.newIndex;
      }
    
      if(oursChange && oursIndex >= theirsIndex) {
        // As we walk these changes we are mutating `ours` directly.
        // Here we keep track of how much to transform their operations.
        if(oursChange.added) {
          indexTransform++;
        } else {
          indexTransform--;
        }
        oursDiffIndex++;
      } else {
        if(theirsChange.added) {
          ours.replace(theirsIndex, 0, [session.merge(theirsChange.item)]);
        } else {
          ours.replace(theirsIndex, 1, []);
        }
        theirsDiffIndex++;
      }
      
    }
    
    return ours;
  }

}
