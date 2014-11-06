import Serializer from './base';
import ModelSet from '../collections/model_set';

/**
  @namespace serializers
  @class ModelSetSerializer
*/
export default class ModelSetSerializer extends Serializer {

  /**
    Turns an array of models
    into a modelSet
  */
  deserialize(serialized) {
    var self = this,
        modelSet = new ModelSet();
    
    if (!serialized) return modelSet;
  
    // seralizer for this array of models
    var serializer = self.storageModelSerializer();
    
    serialized.forEach(function(serializedModel){
      var model = serializer.deserialize(serializedModel);
      modelSet.add(model);
    });
    
    return modelSet;
  }
  
  /**
    Creates an array of serialized models
  */
  serialize(modelSet) {
    var self = this;
    
    return modelSet.toArray().map(function(model) {
      var serializer = self.storageModelSerializer();
      
      return serializer.serialize(model);
      
    });
  }

  storageModelSerializer() {
    // Not using the application provided seralizer 
    // and using the custom storage model seralization
    var storageModelTypeKey = "storage-model";
    return this.serializerFactory.serializerFor(storageModelTypeKey);
  }
}
