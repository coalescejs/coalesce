import isEqual from '../utils/is-equal';
import ArrayDiff from '../utils/array-diff';

/**
 * Merge strategy for queries. Currently the logic is to just apply
 * all the new changes on top of any local changes.
 *
 * TODO: handle conflicts, currently theirs will always win
 */
export default class CollectionMerge {
  static singleton = true;

  merge(ours, ancestor, theirs) {
    var oursDiff = Array.from(eachUncommon(new ArrayDiff(Array.from(ours), Array.from(ancestor), isEqual))),
      theirsDiff = Array.from(eachUncommon(new ArrayDiff(Array.from(theirs), Array.from(ancestor), isEqual))),
      indexTransform = 0,
      oursDiffIndex = 0,
      theirsDiffIndex = 0,
      oursIndex = 0,
      theirsIndex = 0;

    // TODO might need to sort by `newIndex`
    while (true) {
      var oursChange = oursDiffIndex < oursDiff.length ? oursDiff[oursDiffIndex] : undefined,
        theirsChange = theirsDiffIndex < theirsDiff.length ? theirsDiff[theirsDiffIndex] : undefined;

      if (!oursChange && !theirsChange) {break;}

      if (oursChange && oursChange.added) {
        oursIndex = oursChange.newIndex;
      }

      if (theirsChange && theirsChange.added) {
        theirsIndex = theirsChange.newIndex;
      }

      if (oursChange && oursIndex >= theirsIndex) {
        // As we walk these changes we are mutating `ours` directly.
        // Here we keep track of how much to transform their operations.
        if (oursChange.added) {
          indexTransform++;
        } else {
          indexTransform--;
        }
        oursDiffIndex++;
      } else {
        if (theirsChange.added) {
          ours.splice(theirsIndex, 0, theirsChange.item);
        } else {
          ours.splice(theirsIndex, 1);
        }
        theirsDiffIndex++;
      }
    }

    return ours;
  }
}

function* eachUncommon(diff) {
  for (var eleDiff of diff.diff) {
    if (!eleDiff.common) {
      yield eleDiff;
    }
  }
}
