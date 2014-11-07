import ModelSerializer from './model';

/**
  @namespace serializers
  @class StorageModelSerializer
*/
export default class StorageModelSerializer extends ModelSerializer {

    addMeta(serialized, model) {
        super(serialized,model);
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

    // overwrite the has many with one for storage
    extractProperty(model, hash, name, type, opts) {

        if (type === 'has-many') {
            type = 'storage-has-many';
        }

        return super(model, hash, name, type, opts);
    }

    // overwrite the has many with one for storage
    addProperty(serialized, model, name, type, opts) {
      if (type === 'has-many') {
        type = 'storage-has-many';
      }

      return super(serialized, model, name, type, opts);
    }
}
