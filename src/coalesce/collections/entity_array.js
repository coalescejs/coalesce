import ObservableArray from './observable_array';
import EntitySet from './entity_set';
import isEqual from '../utils/is_equal';
import Coalesce from '../namespace';
import fork from '../utils/fork';

export default class EntityArray extends ObservableArray {

  replace(idx, amt, objects) {
    if(this.graph) {
      objects = objects.map(function(model) {
        return this.graph.adopt(model);
      }, this);
    }
    super.replace(idx, amt, objects);
  }

  removeObject(obj) {
    var loc = this.length || 0;
    while(--loc >= 0) {
      var curObject = this.objectAt(loc) ;
      if (isEqual(curObject, obj)) this.removeAt(loc) ;
    }
    return this ;
  }

  contains(obj){
    for(var i = 0; i < this.length ; i++) {
      var m = this.objectAt(i);
      if(isEqual(obj, m)) return true;
    }
    return false;
  }

  copy() {
    return super.copy(true);
  }

}
