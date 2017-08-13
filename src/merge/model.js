import isEqual from '../utils/is-equal';

/**
 * Merge a model on a per-field basis.
 *
 * TODO: OPTIMIZE: take advantage of immutable attributes
 */
export default class ModelMerge {
  static singleton = true;

  merge(ours, ancestor, theirs) {
    for (var field of ours.schema.fields()) {
      if (field.kind === 'attribute' || (field.kind === 'belongsTo' && field.owner)) {
        this.mergeField(ours, ancestor, theirs, field);
      }
    }
    return ours;
  }

  mergeField(ours, ancestor, theirs, field) {
    var name = field.name,
      oursValue = ours[name],
      ancestorValue = ancestor[name],
      theirsValue = theirs[name];

    // ours is unloaded, use theirs
    if (oursValue === undefined) {
      if (theirsValue !== undefined) {
        ours[name] = theirsValue;
      }
      return;
    }

    // theirs is unloaded, keep ours
    if (theirsValue === undefined || isEqual(oursValue, theirsValue)) {
      return;
    }

    if (ancestorValue === undefined || isEqual(oursValue, ancestorValue)) {
      // ours is unchanged, use theirs
      ours[name] = theirsValue;
    } else {
      // ours was modified, use it instead of theirs
      // NO-OP
    }
  }
}
