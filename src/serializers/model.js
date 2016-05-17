import { singularize, camelize, underscore, dasherize } from 'inflection';


/**
 * Serializes models.
 */
export default class ModelSerializer {

  constructor(container) {
    this._container = container;
    this._keyCache = {};
  }

  keyFor(field) {
    if(this._keyCache[field.name]) {
      return this._keyCache[field.name];
    }

    const key = this._keyFor(field);
    this._keyCache[field.name] = key;
    return key;
  }

  /**
   * @protected
   */
  _keyFor(field) {
    return field.key || underscore(field.name);
  }

  serialize(model) {
    var serialized = {};

    let schema = model.schema;

    for(var field of schema.fields()) {
      this.addField(serialized, model, field);
    }

    return serialized;
  }

  addField(serialized, model, field) {
    if(field.transient) {
      return;
    }

    var key = this.keyFor(field),
        value = model[field.name],
        serializer;

    if(field.type) {
      serializer = this.serializerFor(field.type);
    }
    if(serializer) {
      value = serializer.serialize(value);
    }
    if(value !== undefined) {
      serialized[key] = value;
    }
  }

  deserialize(hash) {
    var model = this.createModel(hash.type);

    for(var field of model.schema.fields()) {
      this.extractField(hash, model, field);
    }

    return model;
  }

  extractField(hash, model, field) {
    var key = this.keyFor(field),
        value = hash[key],
        serializer;
    if(typeof value === 'undefined') {
      return;
    }
    if(field.type) {
      serializer = this.serializerFor(field.type);
    }
    if(serializer) {
      value = serializer.deserialize(value);
    }
    if(typeof value !== 'undefined') {
      // TODO: optimize these setters, e.g. build attributes then set
      // all at once via ImmutableJS
      model[field.name] = value;
    }
  }

  createModel(type) {
    type = this.typeFor(type);
    return new type();
  }

  typeFor(type) {
    return this._container.typeFor(type);
  }

  serializerFor(type) {
    return this._container.serializerFor(type);
  }

}
