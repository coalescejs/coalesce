import Base from './base';
import ModelSet from '../collections/model_set';
import isEqual from '../utils/is_equal';
import copy from '../utils/copy';

/**
  Merge strategy that merges on a per-field basis.

  Fields which have been editted by both will
  default to "ours".

  Fields which do not have an ancestor will default to
  "theirs".

  @namespace merge
  @class ModelMerge
*/
export default class ModelMerge extends Base {

  merge(ours, ancestor, theirs, session, opts) {
    this.mergeAttributes(ours, ancestor, theirs);
    this.mergeRelationships(ours, ancestor, theirs);
    return ours;
  }

  mergeAttributes(ours, ancestor, theirs, session) {
    ours.eachAttribute(function(name, attribute) {
      this.mergeField(ours, ancestor, theirs, session, attribute);
    }, this);
  }

  mergeRelationships(ours, ancestor, theirs, session) {
    var session = this.session;
    ours.eachRelationship(function(name, relationship) {
      this.mergeField(ours, ancestor, theirs, session, relationship);
    }, this);
  }

  mergeField(ours, ancestor, theirs, session, field) {
    var name = field.name,
        oursValue = ours[name],
        ancestorValue = ancestor[name],
        theirsValue = theirs[name];

    if(!ours.isFieldLoaded(name)) {
      if(theirs.isFieldLoaded(name)) {
        ours[name] = copy(theirsValue);
      }
      return;
    }
    
    if(!theirs.isFieldLoaded(name) || isEqual(oursValue, theirsValue)) {
      return;
    }
    
    console.assert(ancestor.isFieldLoaded(name), `${name} not present on common ancestor`);
    
    var mergeStrategy = this.mergeStrategyFor(field.name);
    if(mergeStrategy) {
      ours[name] = mergeStrategy.merge(oursValue, ancestorValue, theirsValue, session, field);
    } else {
      // default field merge logic
      if(isEqual(oursValue, ancestorValue)) {
        // if unchanged, always use theirs
        ours[name] = copy(theirsValue);
      } else {
        // ours was modified, use it instead of theirs
        // NO-OP
      }
    }
  }

}
