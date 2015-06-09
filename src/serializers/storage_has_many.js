import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  @namespace serializers
  @class StorageHasManySerializer
*/
export default class StorageHasManySerializer extends Serializer {

  deserialize(serialized, opts) {
    if(!serialized) return [];

    return this.deserializeModels(serialized, opts);
  }

  deserializeModels(serialized, opts) {
    var serializer = this.serializerFor('storage-relation');
    return serialized.map(function(hash) {
      return serializer.deserialize(hash, opts);
    });
  }

  serialize(models, opts) {
    return this.serializeModels(models, opts);
  }

  serializeModels(models, opts) {
    var serializer = this.serializerFor('storage-relation');
    return models.map(function(model) {
      return serializer.serialize(model);
    });
  }
  
}
