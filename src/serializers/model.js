import IdManager from '../id-manager';
import Graph from '../graph';
import Container from '../container';

import { singularize, camelize, underscore, dasherize } from 'inflection';

/**
 * Serializes models.
 */
export default class ModelSerializer {

  static singleton = true;
  static dependencies = [Container];

  constructor(container) {
    this._container = container;
    this._idManager = container.get(IdManager);
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

  deserialize(hash, graph=new Graph(this._idManager)) {
    let data = {},
        type = hash.type;

    console.assert(type, `Model payload must include 'type'`);

    type = this.typeFor(type);

    for(var field of type.schema.fields()) {
      this.extractField(hash, data, field, graph);
    }

    return this.createModel(type, graph, data);
  }

  extractField(hash, data, field, graph) {
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
      value = serializer.deserialize(value, graph);
    }
    if(typeof value !== 'undefined') {
      // TODO: optimize these setters, e.g. build attributes then set
      // all at once via ImmutableJS
      data[field.name] = value;
    }
  }

  createModel(type, graph, data) {
    return new type(graph, data);
  }

  typeFor(type) {
    return this._container.typeFor(type);
  }

  serializerFor(type) {
    return this._container.serializerFor(type);
  }

}
