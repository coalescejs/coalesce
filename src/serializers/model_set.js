import Serializer from './base';
import ModelSet from '../collections/model_set';

/**
  @namespace serializers
  @class ModelSetSerializer
*/
export default class ModelSetSerializer extends Serializer {

  /**
    Turns a hash of arrays. e.g. {post: [...], comment: [...]}
    into a modelSet
  */
  deserialize(serialized, opts) {
    var modelSet = new ModelSet();
    var serializerFactory = this.serializerFactory;
    
    if (!serialized) return modelSet;
    
    for (var typeKey in serialized) {
      // seralizer for this array of models
      var serializer = serializerFactory.serializerFor(typeKey);
      
      var modelArray = serialized[typeKey];
      
      modelArray.forEach(function(model){
        modelSet.add(serializer.deserialize(model));
      });
    }
    
    return modelSet;
  }
  
  /**
    Creates a hash of arrays. Each key is the typeKey of the models in the array.
    e.g. {post: [...], comment: [...]}
  */
  serialize(modelSet) {
    var serialized = {};
    var serializerFactory = this.serializerFactory;
    
    modelSet.forEach(function(model) {
      var typeKey = model.typeKey;
      var serializer = serializerFactory.serializerFor(typeKey);
      
      // initialized the key to empty array value
      if (!(typeKey in serialized)) {
        serialized[typeKey] = [];
      }
      
      serialized[typeKey].push(serializer.serialize(model));
      
    });
    
    return serialized;
  }
}
