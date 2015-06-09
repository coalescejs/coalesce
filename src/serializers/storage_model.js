import ModelSerializer from './model';
import {dasherize} from '../utils/inflector';
/**
  @namespace serializers
  @class StorageModelSerializer
*/
export default class StorageModelSerializer extends ModelSerializer {

  addMeta (serialized, model) {
    super(serialized,model);
    this.addProperty(serialized, model, 'typeKey', 'string');
  }

   deserialize (hash, opts) {
  	this.typeKey = hash.type_key;
	return super(hash, opts);
  }

  extractProperty (model, hash, name, type, opts) {
    
    if (type === 'has-many') {
      type = 'storage-has-many';
    }else if (type === 'belongs-to') {
      type = 'storage-belongs-to';
    } 

    return super(model, hash, name, type, opts);
  }

  addProperty (serialized, model, name, type, opts) {
    
    if (type === 'has-many') {
      type = 'storage-has-many';
    }else if (type === 'belongs-to') {
      type = 'storage-belongs-to';
    } 

    return super(serialized, model, name, type, opts);
  }
}
