import Serializer from './base';

import BelongsTo from '../entities/belongs_to';

/**
  @namespace serializers
  @class BelongsToSerializer
*/
export default class BelongsToSerializer extends Serializer {

  deserialize(serialized, opts) {
    var entity = this.createEntity(opts);
    
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
      return serializer.serialize(value);
    }
    
    var idSerializer = this.serializerFor('id');
    return idSerializer.serialize(value.id);
  }
  
  createEntity(opts) {
    /*
      We avoid the constructor. The constructor is applied inside Model.setRelationship
    */
    return new BelongsTo();
  }

}
