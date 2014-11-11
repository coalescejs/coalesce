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
    // for now this will be slow, need to make deserialization more intelligent
    // and aware of the model graph
    models.forEach(function(model) {
      if(model.isNew){
        session.add(model);
      }else{
        session.merge(model);  
      }
    });

    session.newModels = modelSetSerializer.deserialize(serializedSessionData.newModels);
    session.shadows = modelSetSerializer.deserialize(serializedSessionData.shadows);
    session.queryCache = this.deserializeQueryCache(session, serializedSessionData.queryCache);
    // We also need to track where to start assigning clientIds since the models
    // we deserialize will already have clientIds assigned.
    session.idManager.uuid = serializedSessionData.uuidStart;
    return session;
  }
  
  deserializeQueryCache(session, serialized) {

    var queries = {};
    for(var key in serialized) {
      if(!serialized.hasOwnProperty(key)) continue;

      var arrayOfModels = serialized[key].map(function(clientId) {
        return session.models.getForClientId(clientId);
      });

      var typeKey = key.split('$')[0];
      var stringedParams = key.split('$')[1];
      var params = JSON.parse(stringedParams);

      var newQuery = new Query(session, typeKey, params);

      newQuery.setObjects(arrayOfModels);

      queries[key] = newQuery;
    }
    return new QueryCache(queries);
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
    serialized.queryCache = this.serializeQueryCache(session.queryCache);
    serialized.uuidStart = session.idManager.uuid;
    
    return serialized;
  }
  
  /**
    Creates a hash of arrays. Each key is the typeKey$params of the query in the array. 
    with the values of the array the clientId of each model in cache
    e.g. {post$undefined: ['post1','post5']}
  */
  serializeQueryCache(cache) {
    var res = {},
        queries = cache._queries;
    
    for(var key in queries) {
      if(!queries.hasOwnProperty(key)) continue;
      
      res[key] = queries[key].map(function(m) { return m.clientId; });
    }
    return res;
  }
}
