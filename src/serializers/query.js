import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  @class QuerySerializer
*/
export default class QuerySerializer extends Serializer {

  deserialize(serialized, opts) {
    var serializer = this.serializerFor(opts.type);
        
    var models = serialized.forEach(function(hash) {
      // support just an id as well
      if(typeof hash !== 'object') {
        hash = {id: hash}; 
      }
      return serializer.deserialize(hash, opts);
    }, this);
    
    var query = this.createEntity();
    query.replace(0, 0, models);
    return query;
  }
  
  serialize(models, opts) {
    if(opts.embedded) {
      var serializer = this.serializerFor(opts.type);
      return this.map(function(model) {
        serializer.serialize(model);
      });
    } else {
      var idSerializer = this.serializerFor('id');
      return this.map(function(model) {
        return idSerializer.serialize(model.id);
      });
    }
  }
  
  createEntity() {
    return new this.typeFor(this.typeKey);
  }
  
}
