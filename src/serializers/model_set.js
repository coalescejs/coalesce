import Serializer from './base';
import ModelSet from '../collections/model_set';
import {
    dasherize
}
from '../utils/inflector';

/**
  @namespace serializers
  @class ModelSetSerializer
*/
export default class ModelSetSerializer extends Serializer {

    constructor() {
        super();
        this.storageModelSerializer = this.serializerFactory.serializerFor("storage-model");
    }

    /**
      Turns an array of models
      into a modelSet
    */
    deserialize(serialized) {
        var self = this,
            modelSet = new ModelSet();

        if (!serialized) return modelSet;

        serialized.forEach(function(serializedModel) {
            var model = self.storageModelSerializer.deserialize(serializedModel);

            if (model) {
                modelSet.add(model);
            }
        });

        return modelSet;
    }

    /**
      Creates an array of serialized models
    */
    serialize(modelSet) {

        var self = this,
        	modelsToBeSerialized = new ModelSet(),
            adapter = this.serializerFactory.container.lookup('adapter:main');

        modelSet.toArray().forEach(function(model) {
            modelsToBeSerialized.addData(model);

            model.eachLoadedRelationship(function(name, relationship) {
                var type = dasherize(relationship.kind);

                if (type === 'belongs-to') {
                    var self = this,
                        parent = model[name];

                    //we know new models will already be in the modelSet
                    // embeded models are messing up.  Need to revist
                    if (parent && !parent.isNew) { //we know new models will already be in the modelSet
                        modelsToBeSerialized.addData(parent);

                        // may need parent parents
                        parent.eachLoadedRelationship(function(name, relationship) {
                            var type = dasherize(relationship.kind);

                            if (type === 'belongs-to') {
                                var parentParent = parent[name];

                                if (parentParent) {
                                    modelsToBeSerialized.addData(parentParent);
                                }
                            }
                        });

                        if (adapter.isEmbedded(parent)) {
                            var embeddedParent = adapter._embeddedManager.findParent(parent);

                            if (embeddedParent) {
                                modelsToBeSerialized.addData(embeddedParent);
                            }
                        }
                    }
                }
            }, this);
        }, this);

		return modelsToBeSerialized.toArray().map(function(model){
			return self.storageModelSerializer.serialize(model);
		});
    }
}
