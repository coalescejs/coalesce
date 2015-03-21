import isEmpty from '../utils/is_empty';
import Serializer from './base';

import Collection from '../entities/collection';

/**
  @class CollectionSerializer
*/
export default class CollectionSerializer extends Serializer {

  deserialize(serialized, opts) {
    var serializer = this.serializerFor(opts.type),
        collection = this.createEntity(opts);
    
    if(!serialized) {
      console.warn("null value encountered for hasMany relationship, return an empty array instead")
      collection.isLoaded = false;
      return collection;
    }
    
    for(var i = 0; i < serialized.length; i++) {
      var hash = serialized[i];
      if(typeof hash !== 'object') {
        hash = {id: hash}; 
      }
      collection.push(serializer.deserialize(hash, opts));
    }
    
    collection.isLoaded = true;
    return collection;
  }
  
  serialize(models, opts) {
    if(opts.embedded) {
      var serializer = this.serializerFor(opts.type);
      return models.map(function(model) {
        serializer.serialize(model);
      });
    } else {
      var idSerializer = this.serializerFor('id');
      return models.map(function(model) {
        return idSerializer.serialize(model.id);
      });
    }
  }
  
}
