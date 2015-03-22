import EntityArray from '../collections/entity_array';  
import Entity from './entity';
import CollectionDiff from '../diff/collection';
import mixin from '../utils/mixin';

export default class Collection extends mixin(EntityArray, Entity) {
  
  *entities() {
    for(var i = 0; i < this.length; i++) {
      yield this.objectAt(i);
    }
  }
  
  fork(graph) {
    var dest = graph.fetch(this);
    if(this.isLoaded) {
      var models = this.map(function(model) {
        return graph.adopt(model);
      });
      dest.replace(0, dest.length, models);
    }
    return dest;
  }
  
  diff(b) {
    return new CollectionDiff(this, b);
  }
  
}

// collections must be explicitly marked as loaded
Collection.prototype.isLoaded = false;
