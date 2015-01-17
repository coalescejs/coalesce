import Serializer from './base';

/**
  @namespace serializers
  @class BelongsToSerializer
*/
export default class BelongsToSerializer extends Serializer {

  deserialize(serialized, opts) {
    if(!serialized) {
      return null;
    }
    if(!opts.field.embedded) {
      var idSerializer = this.serializerFor('id');
      serialized = {
        id: idSerializer.deserialize(serialized)
      };
    }
    return this.deserializeModel(serialized, opts);
  }

  deserializeModel(serialized, opts) {
    var serializer = this.serializerFor(opts.field.typeKey);
    return serializer.deserialize(serialized, opts);
  }

  serialize(model, opts) {
    if(!model) {
      return null;
    }
    if(opts.field.embedded) {
      return this.serializeModel(model, opts);
    }
    var idSerializer = this.serializerFor('id');
    return idSerializer.serialize(model.id);
  }

  serializeModel(model, opts) {
    var serializer = this.serializerFor(opts.field.typeKey);
    return serializer.serialize(model);
  }

}
