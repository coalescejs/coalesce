import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  The serialization of session models for storage needs has_many regardless of 
  a model's relationship imbedded flag.

  @namespace serializers
  @class StorageHasManySerializer
*/
export default class StorageHasManySerializer extends Serializer {

  /**
    Turn an array of seralized objects into an array of unloaded models

    @param {Array} serialized - A array of objects, 
      ex: [{client_id: 1, type_key: "post"}, {client_id: 2, type_key: "post"} ]

    @return Array array of unloaded models
 */
  deserialize (serialized, opts = {}) {
    if (!serialized) return [];

    opts.reifyClientId = false;

    var serializer = this.serializerFor('storage-model');

    return serialized.map(function(hash) {
      var model = serializer.deserialize(hash, opts);

      return model;
    });
  }

  /**
    Turn an array of models into an array of objects

    @param {Array} models - An array of models

    @return Array  A array of seralized objects, 
      ex: [{client_id: post1, type_key: "post"}, {client_id: post2, type_key: "post"} ]
 */
  serialize (models, opts = {}) {
    return models.map(function(model) {
      return {
        id: model.id,
        client_id: model.clientId,
        type_key: model.typeKey
      };
    });
  }
}
