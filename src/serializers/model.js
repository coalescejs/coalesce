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

  keyFor(field) {
    var key;
    if(key = this._keyCache[field.name]) {
      return key;
    }

    key = this._keyCache[name] = field.key;
    return key;
  }

  serialize(model) {
    var serialized = {};

    this.addMeta(serialized, model);
    this.addAttributes(serialized, model);
    this.addRelationships(serialized, model);

    return serialized;
  }

  addMeta(serialized, model) {
    for(var meta of model.schema.meta()) {
      this.addField(serialized, model, meta);
    }
  }

  addAttributes(serialized, model) {
    for(var attribute of model.schema.attributes()) {
      this.addField(serialized, model, attribute);
    }
  }

  addRelationships(serialized, model) {
    for(var relationship of model.schema.relationships()) {
      this.addField(serialized, model, relationship);
    }
  }

  addField(serialized, model, field) {
    var name = field.name,
        key = this.keyFor(field),
        value = model[name],
        serializer;

    if(!model.isFieldLoaded(name) || !field.writable) return;

    if(field.type) {
      serializer = this.serializerFor(field.serializerKey);
    }
    if(serializer) {
      value = serializer.serialize(value);
    }
    if(value !== undefined) {
      serialized[key] = value;
    }
  }

  deserialize(hash, opts={}) {
    var model = this.createModel();
    this.extractIdentifiers(model, hash, opts);
    
    // OPTIMIZATION: extract directly to graph
    if(opts.graph) {
      model = opts.graph.adopt(model);  
    }
    
    this.extractMeta(model, hash, opts);
    this.extractAttributes(model, hash, opts);
    this.extractRelationships(model, hash, opts);

    return model;
  }
  
  extractIdentifiers(model, hash, opts) {
    this.extractField(model, hash, model.schema.id, opts);
    this.extractField(model, hash, model.schema.clientId, opts);
    this.idManager.reifyClientId(model);
  }

  extractMeta(model, hash, opts) {
    this.extractField(model, hash, model.schema.rev, opts);
    this.extractField(model, hash, model.schema.clientRev, opts);
    this.extractField(model, hash, model.schema.errors, opts);
  }

  extractAttributes(model, hash, opts) {
    for(var attribute of model.schema.attributes()) {
      // TODO: PERFORMANCE: should not clone here
      opts = clone(opts);
      opts.field = attribute;
      this.extractField(model, hash, attribute, opts);
    }
  }

  extractRelationships(model, hash, opts) {
    for(var relationship of model.schema.relationships()) {
      // TODO: PERFORMANCE: should not clone here
      opts = clone(opts);
      opts.field = relationship;
      this.extractField(model, hash, relationship, opts);
    }
  }

  extractField(model, hash, field, opts) {
    var key = this.keyFor(field),
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
    if(typeof value !== 'undefined') {
      model[field.name] = value;
    }
  }

  createModel() {
    var klass = this.typeFor(this.typeKey);
    return new klass();
  }

  typeFor(typeKey) {
    return this.context.typeFor(typeKey);
  }

}
