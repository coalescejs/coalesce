import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  The serialization of session models for storage needs a modified belongs_to,
  because of new models and relationships which contain new models
  which need serialization for storage.

  @namespace serializers
  @class StorageBelongsToSerializer
*/
export default class StorageBelongsToSerializer extends Serializer {

  /**
    Turns a seralized, representation of a belongs_to, object into an unloaded model

    @param {Object} serialized - An object, 
      ex: {id: 1, client_id: post1, type_key: "post"}

    @return Model an unloaded model
 */
  deserialize (serialized, opts = {}) {

    opts.reifyClientId = false;

    var serializer = this.serializerFor('storage-model');

    return serializer.deserialize(serialized, opts);
  }

  /**
    Turn a model into a seralized object

    @param {Model} model - A model

    @return Object  A seralized object, 
      ex: {id: 1, client_id: post1, type_key: "post"}
 */
  serialize (model, opts = {}) {
    if(model == null) return {};
      
    return {
      id: model.id,
      client_id: model.clientId,
      type_key: model.typeKey
    };
  }
}
