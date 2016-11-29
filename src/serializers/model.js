import EntitySerializer from './entity';
import Query from '../query';
import Graph from '../graph';

import { singularize, camelize, underscore, dasherize } from 'inflection';

/**
 * Serializes models.
 */
export default class ModelSerializer extends EntitySerializer {

  _keyCache = {};

  keyFor(field) {
    let {schema} = field;
    // Separate cache for each schema since multiple models may share the
    // same serializer instance and have different keys for fields of the
    // same name.
    let cache = this._keyCache[schema.typeKey];
    if(cache && cache[field.name]) {
      return cache[field.name];
    }

    if(!cache) {
      cache = this._keyCache[schema.typeKey] = {};
    }

    return cache[field.name] = this._keyFor(field);
  }

  /**
   * @protected
   */
  _keyFor(field) {
    return field.key || underscore(field.name);
  }

  serialize(model) {
    let serialized = {};

    let schema = model.schema;

    for(let field of schema.fields()) {
      this.addField(serialized, model, field);
    }

    return serialized;
  }

  addField(serialized, model, field) {
    if(field.transient || field.writable === false) {
      return;
    }

    let value = model[field.name];
    if(typeof value === 'undefined') {
      return;
    }

    if(field.kind === 'attribute' || field.kind === 'meta') {
      this.addAttribute(serialized, model, field);
    } else if(field.kind === 'belongsTo') {
      this.addBelongsTo(serialized, model, field);
    } else if(field.kind === 'hasMany') {
      this.addHasMany(serialized, model, field);
    }
  }

  addAttribute(serialized, model, field) {
    let key = this.keyFor(field),
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

  addBelongsTo(serialized, model, field) {
    let key = this.keyFor(field),
        value = model[field.name],
        serializer;

    if(field.embedded) {
      serializer = this.serializerFor(field.typeKey);
    } else {
      serializer = this.serializerFor('id');
      value = value.id;
    }

    if(serializer && value !== null) {
      value = serializer.serialize(value);
    }
    if(value !== undefined) {
      serialized[key] = value;
    }
  }

  addHasMany(serialized, model, field) {
    let key = this.keyFor(field),
        value = model[field.name],
        serializer;

    if(field.embedded) {
      serializer = this.serializerFor(Query);
    } else {
      // Cannot serialize a non-embedded has-many
      return;
    }

    value = serializer.serialize(value);
    serialized[key] = value;
  }

  deserialize(hash, graph=this.container.get(Graph), defaults) {
    let data = {...defaults},
        type = hash.type || data.type;

    console.assert(type, `Cannot infer model type`);

    type = this.typeFor(type);

    for(let field of type.schema.metaFields()) {
      this.extractField(hash, data, field, graph);
    }

    for(let field of type.schema.attributes()) {
      this.extractField(hash, data, field, graph);
    }

    // Create the model before we populate relationship fields. This is
    // because we want its id to be reified first.
    data = this.create(graph, type, data);

    for(let field of type.schema.relationships()) {
      this.extractField(hash, data, field, graph);
    }

    return data;
  }

  extractField(hash, data, field, graph) {
    let key = this.keyFor(field),
        value = hash[key];
    if(typeof value === 'undefined') {
      return;
    }
    if(field.kind === 'attribute' || field.kind === 'meta') {
      this.extractAttribute(hash, data, field, graph);
    } else if(field.kind === 'belongsTo') {
      this.extractBelongsTo(hash, data, field, graph);
    } else if(field.kind === 'hasMany') {
      this.extractHasMany(hash, data, field, graph);
    }
  }

  extractAttribute(hash, data, field, graph) {
    let key = this.keyFor(field),
        value = hash[key],
        serializer;

    if(field.type) {
      serializer = this.serializerFor(field.type);
    }
    if(serializer) {
      value = serializer.deserialize(value, graph);
    }
    if(typeof value !== 'undefined') {
      data[field.name] = value;
    }
  }

  extractBelongsTo(hash, data, field, graph) {
    let key = this.keyFor(field),
        value = hash[key],
        serializer;

    if(field.embedded) {
      serializer = this.serializerFor(field.typeKey);
      value = serializer.deserialize(value, graph, {type: field.typeKey});
    } else {
      serializer = this.serializerFor('id');
      value = serializer.deserialize(value);
      if(value) {
        value = graph.fetchBy(field.typeKey, {id: value});
      }
    }
    if(typeof value !== 'undefined') {
      data[field.name] = value;
    }
  }

  extractHasMany(hash, data, field, graph) {
    let key = this.keyFor(field),
        value = hash[key],
        serializer;

    serializer = this.serializerFor(Query);
    if(serializer) {
      // XXX: should pass in the actual model to `getQueryParams`
      value = serializer.deserialize(
        value,
        graph,
        this.typeFor(field.typeKey),
        field.getQueryParams(data)
      );
    }
    if(typeof value !== 'undefined') {
      data[field.name] = value;
    }
  }

}
