import Serializer from './base';

var clone = _.clone;

/**
  @namespace serializers
  @class ModelSerializer
*/
export default class ModelSerializer extends Serializer {

  constructor(...args) {
    super(...args);
    this._keyCache = {};
  }

  serialize(model) {
    var serialized = {};

    this._addMeta(serialized, model);
    this._addAttributes(serialized, model);
    this._addRelationships(serialized, model);

    return serialized;
  }

  _addMeta(serialized, model) {
    for(var meta of this.schema.meta()) {
      this._addField(serialized, model, meta);
    }
  }

  _addAttributes(serialized, model) {
    for(var attribute of this.schema.attributes()) {
      this._addField(serialized, model, attribute);
    }
  }

  _addRelationships(serialized, model) {
    for(var relationship of this.schema.relationships()) {
      this._addField(serialized, model, relationship);
    }
  }

  _addField(serialized, model, field) {
    var name = field.name,
        key = this._keyFor(field),
        // if the field is a relationship, we want to retrieve the raw entity
        value = field.isRelationship ? model.getRelationship(name) : model[name],
        serializer;

    if(!model.isFieldLoaded(name) || !field.writable) return;

    if(field.type) {
      serializer = this.serializerFor(field.serializerKey);
    }
    if(serializer) {
      value = serializer.serialize(value, field);
    }
    if(value !== undefined) {
      serialized[key] = value;
    }
  }

  deserialize(hash, opts={}) {
    model = this._buildModel(hash, opts);

    this._extractMeta(model, hash, opts);
    this._extractAttributes(model, hash, opts);
    this._extractRelationships(model, hash, opts);

    return model;
  }

  _buildModel(hash, opts) {
    var clientId = this._deserializeField(hash, this.schema.clientId, opts),
        id = this._deserializeField(hash, this.schema.id, opts),
        graph = opts.graph,
        model;

    // OPTIMIZATION: load directly from the graph
    if(graph) {
      if(id && !clientId) {
        clientId = this.idManager.getClientId(this.typeKey, id);
      }
      if(clientId) {
        model = graph.findByClientId(clientId);
      }
    }

    if(!model) {
      model = new this.modelClass({id: id, clientId: clientId});
      if(graph) {
        graph.add(model);
      }
    }

    return model;
  }

  _extractMeta(model, hash, opts) {
    this._extractField(model, hash, this.schema.rev, opts);
    this._extractField(model, hash, this.schema.clientRev, opts);
    this._extractField(model, hash, this.schema.errors, opts);
  }

  _extractAttributes(model, hash, opts) {
    for(var attribute of this.schema.attributes()) {
      // TODO: PERFORMANCE: should not clone here
      opts = clone(opts);
      opts.field = attribute;
      this._extractField(model, hash, attribute, opts);
    }
  }

  _extractRelationships(model, hash, opts) {
    for(var relationship of this.schema.relationships()) {
      // TODO: PERFORMANCE: should not clone here
      opts = clone(opts);
      opts.field = relationship;
      this._extractField(model, hash, relationship, opts);
    }
  }

  _extractField(model, hash, field, opts) {
    var value = this._deserializeField(hash, field, opts);
    if(typeof value !== 'undefined') {
      if(field.isRelationship) {
        // the raw entity is deserialized, so we use setRelationship
        model.setRelationship(field.name, value);
      } else {
        model[field.name] = value;
      }
    }
  }

  _deserializeField(hash, field, opts) {
    var key = this._keyFor(field),
        value = hash[key],
        serializer;
    if(typeof value === 'undefined') {
      return;
    }
    if(field.type) {
      serializer = this.serializerFor(field.serializerKey);
    }
    if(serializer) {
      value = serializer.deserialize(value, opts);
    }
    return value;
  }

  _keyFor(field) {
    var key;
    if(key = this._keyCache[field.name]) {
      return key;
    }

    key = this._keyCache[name] = field.key;
    return key;
  }

  get modelClass() {
    return this.typeFor(this.typeKey);
  }

  get schema() {
    return this.modelClass.schema;
  }

  typeFor(typeKey) {
    return this.context.typeFor(typeKey);
  }

}
