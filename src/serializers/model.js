import Serializer from './base';
import {singularize, camelize, underscore, dasherize} from '../utils/inflector';

/**
  @namespace serializers
  @class ModelSerializer
*/
export default class ModelSerializer extends Serializer {

  constructor(...args) {
    super(...args);
    this._keyCache = {};
  }

  keyFor(name, type, opts) {
    var key;
    if(key = this._keyCache[name]) {
      return key;
    }

    key = opts && opts.key || this.keyForType(name, type, opts);
    this._keyCache[name] = key;
    return key;
  }

  keyForType(name, type, opts) {
    return underscore(name);
  }

  /**
    @private

    Determines the singular root name for a particular type.

    This is an underscored, lowercase version of the model name.
    For example, the type `App.UserGroup` will have the root
    `user_group`.

    @param {Coalesce.Model subclass} type
    @returns {String} name of the root element
  */
  rootForType(type) {
    return type.typeKey;
  }

  serialize(model) {
    var serialized = {};

    this.addMeta(serialized, model);
    this.addAttributes(serialized, model);
    this.addRelationships(serialized, model);

    return serialized;
  }

  addMeta(serialized, model) {
    this.addField(serialized, model, 'id', 'id');
    this.addField(serialized, model, 'clientId', 'string');
    this.addField(serialized, model, 'rev', 'revision');
    this.addField(serialized, model, 'clientRev', 'revision');
  }

  addAttributes(serialized, model) {
    model.eachLoadedAttribute(function(name, attribute) {
      // do not include transient properties
      if(attribute.transient) return;
      this.addField(serialized, model, name, attribute.type, attribute);
    }, this);
  }

  addRelationships(serialized, model) {
    model.eachLoadedRelationship(function(name, relationship) {
      // we dasherize the kind for lookups for consistency
      var kindKey = dasherize(relationship.kind);
      this.addField(serialized, model, name, kindKey, relationship);
    }, this);
  }

  addField(serialized, model, name, type, opts) {
    var key = this.keyFor(name, type, opts),
        value = model[name],
        serializer;

    if(type) {
      serializer = this.serializerFor(type);
    }
    if(serializer) {
      value = serializer.serialize(value, opts);
    }
    if(value !== undefined) {
      serialized[key] = value;
    }
  }

  deserialize(hash, opts) {
    var model = this.createModel();

    this.extractMeta(model, hash, opts);
    this.extractAttributes(model, hash);
    this.extractRelationships(model, hash);

    return model;
  }

  extractMeta(model, hash, opts) {
    this.extractField(model, hash, 'id', 'id');
    this.extractField(model, hash, 'clientId', 'string');
    this.extractField(model, hash, 'rev', 'revision');
    this.extractField(model, hash, 'clientRev', 'revision');
    this.extractField(model, hash, 'errors', 'errors');
    if(!opts || opts.reifyClientId !== false) {
      this.idManager.reifyClientId(model);
    }
  }

  extractAttributes(model, hash) {
    model.eachAttribute(function(name, attribute) {
      this.extractField(model, hash, name, attribute.type, attribute);
    }, this);
  }

  extractRelationships(model, hash) {
    model.eachRelationship(function(name, relationship) {
      // we dasherize the kind for lookups for consistency
      var kindKey = dasherize(relationship.kind);
      this.extractField(model, hash, name, kindKey, relationship);
    }, this);
  }

  extractField(model, hash, name, type, opts) {
    var key = this.keyFor(name, type, opts),
        value = hash[key],
        serializer;
    if(typeof value === 'undefined') {
      return;
    }
    if(type) {
      serializer = this.serializerFor(type);
    }
    if(serializer) {
      value = serializer.deserialize(value, opts);
    }
    if(typeof value !== 'undefined') {
      model[name] = value;
    }
  }

  createModel() {
    return this.typeFor(this.typeKey).create();
  }

  typeFor(typeKey) {
    return this.context.typeFor(typeKey);
  }

}
