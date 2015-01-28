import Serializer from './base';

/**
  @namespace serializers
  @class BelongsToSerializer
*/
export default class BelongsToSerializer extends Serializer {

  deserialize(serialized, opts) {
    var entity = this.createEntity();
    
    if(!serialized) {
      entity.set(serialized)
    } else {
      // support id or hash
      if(typeof serialized !== 'object') {
        serialized = {
          id: serialized
        };
      }
      
      var serializer = this.serializerFor(opts.field.typeKey);
      entity.set(serializer.deserialize(serialized, opts));
    }
    
    return entity
  }

  serialize(entity, opts) {
    var value = entity.get();
    
    if(!value) {
      return null;
    }
    
    if(opts.embedded) {
      var serializer = this.serializerFor(opts.field.typeKey);
      return serializer.serialize(model);
    }
    
    var idSerializer = this.serializerFor('id');
    return idSerializer.serialize(model.id);
  }
  
  createEntity() {
    return new this.typeFor(this.typeKey);
  }

}
