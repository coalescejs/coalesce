import Serializer from './base';
import ModelSetSerializer from './model_set';
import QueryCache from '../session/query_cache';
import Query from '../session/query';


/**
  @namespace serializers
  @class SessionSerializer
*/
export default class SessionSerializer extends Serializer {
  
  /**
  @return {Session}
  */
  deserialize(session, serializedSessionData) {
    var modelSetSerializer = this.serializerFor('model-set');
    // var self = this;
    
    if (!serializedSessionData){ return session; }
      
    var models = modelSetSerializer.deserialize(serializedSessionData.models);
    // for now this will be slow, need to make deserialization more intelligent
    // and aware of the model graph
    models.forEach(function(model) {
      if(model.isNew){
        session.add(model);
      }else{
        session.merge(model);  
      }
    });

    // session.models.mergeFromStorageToSession(session).then(function(){
    //   console.log("deserializingQueryCache");
     
    // });

    session.newModels = modelSetSerializer.deserialize(serializedSessionData.newModels);
    session.shadows = modelSetSerializer.deserialize(serializedSessionData.shadows);
    
    // We also need to track where to start assigning clientIds since the models
    // we deserialize will already have clientIds assigned.
    session.idManager.uuid = serializedSessionData.uuidStart;
    return session;
  }
  
  
  serialize(session) {
    var modelSetSerializer = this.serializerFor('model-set');
    
    var serialized = {
      models: {},
      newModels: {},
      shadows: {}
    };
    
    // Only need to seralize dirty models.  
    // WE WILL RELY ON SERVER RESPONSE CACHING TO HANDLE NON-DIRTY MODELS
    serialized.models = modelSetSerializer.serialize(session.dirtyModels);
    serialized.newModels = modelSetSerializer.serialize(session.newModels);
    serialized.shadows = modelSetSerializer.serialize(session.shadows);
    serialized.uuidStart = session.idManager.uuid;
    
    return serialized;
  }
}
