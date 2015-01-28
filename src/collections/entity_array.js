import ObservableArray from './observable_array';
import EntitySet from './entity_set';
import isEqual from '../utils/is_equal';
import Coalesce from '../namespace';
import fork from '../utils/fork';

export default class EntityArray extends ObservableArray {
  
  replace(idx, amt, objects) {
    if(this.session) {
      objects = objects.map(function(model) {
        return this.session.adopt(model);
      }, this);
    }
    super(idx, amt, objects);
  }
  
  arrayContentWillChange(index, removed, added) {
    for (var i=index; i<index+removed; i++) {
      var model = this.objectAt(i);
      var session = this.session;

      if(session) {
        session.collectionManager.unregister(this, model);
      }
    }

    super(index, removed, added);
  }

  arrayContentDidChange(index, removed, added) {
    super(index, removed, added);

    for (var i=index; i<index+added; i++) {
      var model = this.objectAt(i);
      var session = this.session;

      if(session) {
        session.collectionManager.register(this, model);
      }
    }
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
    return super(true);
  }

}
