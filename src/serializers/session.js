import Serializer from './base';
import ModelSetSerializer from './model_set';

/**
  @namespace serializers
  @class SessionSerializer
*/
export default class SessionSerializer extends Serializer {
  
  // TODO return an entire session instance
  deserialize(serialized) {
    var modelSetSerializer = this.serializerFor('model-set');
    
    var deserialized = {
      models: null,
      newModels: null,
      shadows: null
    };
    
    if (!serialized){ return deserialized; }
      
    deserialized.models = modelSetSerializer.deserialize(serialized.models);
    deserialized.newModels = modelSetSerializer.deserialize(serialized.newModels);
    deserialized.shadows = modelSetSerializer.deserialize(serialized.shadows);
    
    return deserialized;
  }
    
  serialize(session) {
    var modelSetSerializer = this.serializerFor('model-set');
    
    var serialized = {
      models: {},
      newModels: {},
      shadows: {}
    };
    
    serialized.models = modelSetSerializer.serialize(session.models);
    serialized.newModels = modelSetSerializer.serialize(session.newModels);
    serialized.shadows = modelSetSerializer.serialize(session.shadows);
    
    return serialized;
  }
}
