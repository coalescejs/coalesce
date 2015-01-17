import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  @namespace serializers
  @class HasManySerializer
*/
export default class HasManySerializer extends Serializer {

  deserialize(serialized, opts) {
    if(!serialized) return [];
    if(!opts.field.embedded) {
      var idSerializer = this.serializerFor('id');
      serialized = serialized.map(function(id) {
        return {
          id: id
        };
      }, this);
    }
    return this.deserializeModels(serialized, opts);
  }

  deserializeModels(serialized, opts) {
    var serializer = this.serializerFor(opts.field.typeKey);
    return serialized.map(function(hash) {
      return serializer.deserialize(hash, opts);
    });
  }

  serialize(models, opts) {
    if(opts.field.embedded) {
      return this.serializeModels(models, opts);
    }
    return undefined;
  }

  serializeModels(models, opts) {
    var serializer = this.serializerFor(opts.field.typeKey);
    return models.map(function(model) {
      return serializer.serialize(model);
    });
  }
  
}
