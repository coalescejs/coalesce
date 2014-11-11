import Serializer from './base';
import ModelSet from '../collections/model_set';

/**
  @namespace serializers
  @class ModelSetSerializer
*/
export default class ModelSetSerializer extends Serializer {

  constructor() {
    super();
    this.storageModelSerializer = this.serializerFactory.serializerFor("storage-model");
  }

  /**
    Turns an array of models
    into a modelSet
  */
  deserialize(serialized) {
    var self = this,
        modelSet = new ModelSet();
    
    if (!serialized) return modelSet;
   
    serialized.forEach(function(serializedModel){
      var model = self.storageModelSerializer.deserialize(serializedModel);

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
      return self.storageModelSerializer.serialize(model);
      
    });
  }
}
