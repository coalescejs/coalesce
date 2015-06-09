import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  @namespace serializers
  @class StorageBelongsToSerializer
*/
export default class StorageBelongsToSerializer extends Serializer {

    deserialize(serialized, opts) {
        if (!serialized) {
            return null;
        }

        return this.deserializeModel(serialized, opts);
    }

    deserializeModel(serialized, opts) {
        var serializer = this.serializerFor('storage-relation');
        return serializer.deserialize(serialized, opts);
    }

    serialize(model, opts) {
        if (!model) {
            return null;
        }
        return this.serializeModel(model, opts);
    }

    serializeModel(model, opts) {
        var serializer = this.serializerFor('storage-relation');
        return serializer.serialize(model);
    }

}
