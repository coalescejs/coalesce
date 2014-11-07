import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  The serialization of session models for storage needs has_many reguardless of 
  a model's relationship imbedded flag.

  @namespace serializers
  @class StorageHasManySerializer
*/
export default class StorageHasManySerializer extends Serializer {

  /**
    Turn an array of objects into an array of unloaded models

    @param {Array} serialized - A array of objects, 
      ex: [{id: 1, type_key: "post"}, {id: 2, type_key: "post"} ]

    @return Array array of unloaded models
 */
  deserialize (serialized, opts = {}) {
    if (!serialized) return [];

    opts.reifyClientId = false;

    var serializer = this.serializerFor('storage-model');

    return serialized.map(function(hash) {
      return serializer.deserialize(hash, opts);
    });
  }

  /**
    Turn an array of models into an array of objects

    @param {Array} models - An array of models

    @return Array  A array of objects, 
      ex: [{id: 1, type_key: "post"}, {id: 2, type_key: "post"} ]
 */
  serialize (models, opts = {}) {
    return models.map(function(model) {
      return {
        id: model.id,
        type_key: model.typeKey
      };
    });
  }
}
