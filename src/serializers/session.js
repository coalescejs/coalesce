import Serializer from './base';
import ModelSetSerializer from './model_set';
import QueryCache from '../session/query_cache';

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
      shadows: null,
      queryCache: null
    };
    
    if (!serialized){ return deserialized; }
      
    deserialized.models = modelSetSerializer.deserialize(serialized.models);
    deserialized.newModels = modelSetSerializer.deserialize(serialized.newModels);
    deserialized.shadows = modelSetSerializer.deserialize(serialized.shadows);
    deserialized.queryCache = this.deserializeQueryCache(serialized.queryCache, deserialized.models);
    // We also need to track where to start assigning clientIds since the models
    // we deserialize will already have clientIds assigned.
    deserialized.uuidStart = serialized.uuidStart;
    
    return deserialized;
  }
  
  // TODO: could be a separate serializer, but need ref to models
  deserializeQueryCache(serialized, models) {
    var queries = {};
    for(var key in serialized) {
      if(!serialized.hasOwnProperty(key)) continue;
      queries[key] = serialized[key].map(function(clientId) {
        return models.getForClientId(clientId);
      });
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
