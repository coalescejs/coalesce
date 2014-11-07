import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  @namespace serializers
  @class StorageHasManySerializer
*/
export default class StorageHasManySerializer extends Serializer {

  // takes array of {id: 1, type_key: "post"} 
  //  and returns an array of unloaded models
  deserialize(serialized, opts = {}) {
    if (!serialized) return [];

    opts.reifyClientId = false;

    var serializer = this.serializerFor('storage-model');

    return serialized.map(function(hash) {
      return serializer.deserialize(hash, opts);
    });
  }

  serialize(models, opts = {}) {
    return models.map(function(model) {
      return {
        id: model.id,
        type_key: model.typeKey
      };
    });
  }
}
