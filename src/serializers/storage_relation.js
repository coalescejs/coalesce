import ModelSerializer from './model';
import {
    dasherize
}
from '../utils/inflector';

export default class StorageRelationSerializer extends ModelSerializer {
    serialize(model) {
        var serialized = {};

        if(model.isNew){
        	this.addMeta(serialized, model);
        	this.addAttributes(serialized, model);
        	this.addRelationships(serialized, model);
        }else{
        	this.addExistingMeta(serialized, model);
        	// this.addAttributes(serialized, model);
        	// this.addRelationships(serialized, model);
        }  

        return serialized;
    }

    addExistingMeta(serialized, model) {
        this.addProperty(serialized, model, 'id', 'id');
        this.addProperty(serialized, model, 'clientId', 'string');
    }

    deserialize(hash, opts) {
        var model = this.typeFor(opts.typeKey).create();

        this.extractMeta(model, hash, opts);
        this.extractAttributes(model, hash);

        if (model.isNew) {
            this.extractNewRelationships(model, hash);
        } else {
            this.extractRelationships(model, hash);
        }

        return model;
    }

    extractNewRelationships(model, hash) {
        model.eachRelationship(function(name, relationship) {
            var config = this.configFor(name),
                opts = {
                    typeKey: relationship.typeKey,
                    embedded: config.embedded
                },
                type = dasherize(relationship.kind),
                key = this.keyFor(name, type, opts),
                value = hash[key],
                serializer;

            // CH: Special Sauce - this enables newModels with a hasMany of new models to be serialized from storage
            if (!value && type === "belongs-to" && key === opts.typeKey) {
                model[name] = model;
                return;
            }

            if (typeof value === 'undefined') {
                return;
            }
            if (type) {
                serializer = this.serializerFor(type);
            }
            if (serializer) {
                value = serializer.deserialize(value, opts);
            }
            if (typeof value !== 'undefined') {
                model[name] = value;
            }
        }, this);
    }
}
