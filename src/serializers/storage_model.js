import ModelSerializer from './model';

/**
  @namespace serializers
  @class StorageModelSerializer
*/
export default class StorageModelSerializer extends ModelSerializer {
    serialize(model) {
        var serialized = {};

        this.addMeta(serialized, model);
        this.addAttributes(serialized, model);
        this.addRelationships(serialized, model);

        return serialized;
    }

    addMeta(serialized, model) {
        this.addProperty(serialized, model, 'id', 'id');
        this.addProperty(serialized, model, 'clientId', 'string');
        this.addProperty(serialized, model, 'rev', 'revision');
        this.addProperty(serialized, model, 'clientRev', 'revision');
        this.addProperty(serialized, model, 'isDeleted', 'boolean');
        this.addProperty(serialized, model, 'typeKey', 'string');
    }

    deserialize(hash, opts) {
        var model = this.createModel(hash.type_key);

        this.extractMeta(model, hash, opts);
        this.extractAttributes(model, hash);
        this.extractRelationships(model, hash);

        return model;
    }

    createModel(typeKey) {
        return this.typeFor(typeKey).create();
    }
}
