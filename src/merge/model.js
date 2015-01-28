import Base from './base';
import EntitySet from '../collections/entity_set';
import isEqual from '../utils/is_equal';
import fork from '../utils/fork';
import {dasherize} from '../utils/inflector';

/**
  Merge strategy that merges on a per-attribute basis.

  Attributes which have been editted by both will
  default to "ours".

  Attributes which do not have an ancestor will default to
  "theirs".

  @namespace merge
  @class ModelMerge
*/
export default class ModelMerge extends Base {

  merge(ours, ancestor, theirs, session, opts) {
    ours.eachAttribute(function(name, attribute) {
      this.mergeAttribute(ours, ancestor, theirs, session, attribute);
    }, this);
    return ours;
  }

  mergeAttribute(ours, ancestor, theirs, session, field) {
    var name = field.name,
        oursValue = ours[name],
        ancestorValue = ancestor[name],
        theirsValue = theirs[name];

    if(!ours.isFieldLoaded(name)) {
      if(theirs.isFieldLoaded(name)) {
        ours[name] = fork(theirsValue, session);
      }
      return;
    }
    
    if(!theirs.isFieldLoaded(name) || isEqual(oursValue, theirsValue)) {
      return;
    }
        
    if(!ancestor.isFieldLoaded(name) || isEqual(oursValue, ancestorValue)) {
      // if unchanged, always use theirs
      ours[name] = fork(theirsValue);
    } else {
      // ours was modified, use it instead of theirs
      // NO-OP
    }
  }

}
