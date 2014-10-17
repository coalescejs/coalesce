import Serializer from './base';
import ModelSetSerializer from './model_set';

/**
  @namespace serializers
  @class SessionSerializer
*/
export default class SessionSerializer extends Serializer {
    constructor(...args) {
        super(args);
    }

    deserialize(serialized, opts) {
        var modelSetSerializer = this.serializerFor('model-set');

        var deserialized = {
            models: [],
            newModels: [],
            shadows: []
        };

        if (!serialized) return deserialized;

        if (serialized.models)
            deserialized.models = modelSetSerializer.deserialize(serialized.models);

        if (serialized.newModels)
            deserialized.newModels = modelSetSerializer.deserialize(serialized.newModels);

        if (serialized.shadows)
            deserialized.shadows = modelSetSerializer.deserialize(serialized.shadows);


        return deserialized;
    }

    serialize(session) {
        var modelSetSerializer = this.serializerFor('model-set');

        var serialized = {
            models: [],
            newModels: [],
            shadows: []
        };

        if (session.models)
            serialized.models = modelSetSerializer.serialize(session.models);

        if (session.newModels)
            serialized.newModels = modelSetSerializer.serialize(session.newModels);

        if (session.shadows)
            serialized.shadows = modelSetSerializer.serialize(session.shadows);


        return serialized;
    }
}
