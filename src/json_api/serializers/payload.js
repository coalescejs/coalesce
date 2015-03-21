import Serializer from '../../serializers/base';
import Payload from '../payload';

export default class PayloadSerializer extends Serializer {
  
  serialize(model) {
    var typeKey = model.typeKey,
        res = {},
        serializer = this.serializerFor(typeKey);
    res.data = serializer.serialize(model);
    return res;
  }

  deserialize(hash, opts) {
    opts = opts || {};
    var payload = new Payload();
    
    if(hash.data) {
      payload.data = this._deserializeData(hash.data);
    }
    
    if(hash.meta) {
      payload.meta = this._deserializeMeta(hash.meta);
    }
    
    if(hash.errors) {
      payload.errors = this._deserializeErrors(hash.errors);
    }
    
    if(hash.included) {
      payload.included = this._deserializeIncluded(hash.included);
    }
    
    return payload;    
  }
  
  _deserializeData(data, opts) {
    var context = opts.context,
        dataSerializer = this.serializerFor(context);
        
    return dataSerializer.deserialize(data);
  }
  
  _deserializeIncluded(included) {
    return included.map(function(hash) {
      var typeKey = hash.type,
          serializer = this.serializerFor(typeKey);
          
      return serializer.deserialize(hash);
    });
  }
  
  _deserializeMeta(meta) {
    return meta;
  }
  
  _deserializeErrors(errors) {
    var serializer = this.serializerFor('errors'),
    
    return serializer.deserialize(errors, opts);
  }

}
