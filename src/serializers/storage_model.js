import ModelSerializer from './model';
import {dasherize} from '../utils/inflector';
/**
  This class decouples the storage serialization of models from the standard 
  application/rest serialization.  This way storage serialization is 
  controlled internally and custom application adapters won't send side effects
  down to session serialization.

  This serializer class is generic and isn't bound to a model type like its parent
  (the normal model serializer) is.  

  @namespace serializers
  @class StorageModelSerializer
*/
export default class StorageModelSerializer extends ModelSerializer {

  /**
    Overridden: adds typeKey as a meta property for the result serialized
    has_many objects.  The typeKey is needed for object creation during
    deserialization.
  */
  addMeta (serialized, model) {
    super(serialized,model);
    this.addProperty(serialized, model, 'typeKey', 'string');
  }

  /**
    Overridden: Now calls this.createModel(type_key) instead of the parents 
    createModel()
  */
  deserialize (hash, opts) {
    var model = this.createModel(hash.type_key);

    this.extractMeta(model, hash, opts);
    this.extractAttributes(model, hash);
    this.extractRelationships(model, hash);

    return model;
  }

  /**
    Overridden: Due to this class being generic for all model types, 
    the serialized object contains the typeKey which infers what model to create.
  */
  createModel (typeKey) {
      return this.typeFor(typeKey).create();
  }

  /**
    Overridden: So that session deserialization uses our custom storage 
    has many serailzer
  */
  extractProperty (model, hash, name, type, opts) {
    
    if (type === 'has-many') {
      type = 'storage-has-many';
    } 
    else if(type === 'belongs-to'){
      type = 'storage-belongs-to';
    }

    return super(model, hash, name, type, opts);
  }

   /**
    Overridden: So that session serialization uses our custom storage 
    has many serailzer
  */
  addProperty (serialized, model, name, type, opts) {
    
    if (type === 'has-many') {
      type = 'storage-has-many';
    } 
    else if(type === 'belongs-to'){
      type = 'storage-belongs-to';
    }

    return super(serialized, model, name, type, opts);
  }
}
