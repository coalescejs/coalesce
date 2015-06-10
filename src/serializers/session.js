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
    
    if (!serializedSessionData){ return session; }
      
    var models = modelSetSerializer.deserialize(serializedSessionData.models);

    models.forEach(function(model) {
      if(model.isNew){
        session.add(model);
      }else{
        session.merge(model);  
      }
    });

    session.shadows = modelSetSerializer.deserialize(serializedSessionData.shadows);

    // for merging existing models after a loadFromStorage we need originals or 
    // will always take the server version
    session.shadows.forEach(function(m){
    	session.originals.addData(m);
    });
    
    // We also need to track where to start assigning clientIds since the models
    // we deserialize will already have clientIds assigned.
    session.idManager.uuid = serializedSessionData.uuidStart;
    return session;
  }
  
  serialize(session) {
    var modelSetSerializer 	= this.serializerFor('model-set'),
    	serialized 			= { models: [], shadows: [], uuidStart: 0},
    	dirtyModels 		= session.dirtyModels,
    	dirtyShadowModels 	= _.compact(dirtyModels.toArray().map(function(dirt){
    		var shadow = session.shadows.getForClientId(dirt.clientId);

    		return shadow;
    	}));

    // Only need to seralize dirty models.  
    // WE WILL RELY ON SERVER RESPONSE CACHING TO HANDLE NON-DIRTY MODELS
    serialized.models = modelSetSerializer.serialize(dirtyModels);
    serialized.shadows = modelSetSerializer.serialize(dirtyShadowModels);
    serialized.uuidStart = session.idManager.uuid;
    
    return serialized;
  }
}
