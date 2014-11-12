import ModelSet from './model_set';
import SerializerFactory from '../factories/serializer';

/**
  An unordered collection of unique models.
  
  Uniqueness is determined by the `clientId`. If a model is added and an
  equivalent model already exists in the ModelSet, the existing model will be
  overwritten.  StorageModelSet will also keep a copy of each model in storage 
  (to be used for session serializer).  Each instance of StorageModelSet 
  has its own localforage store.

  @class StorageModelSet
*/
export default class StorageModelSet extends ModelSet {

  constructor(storeName, container, iterable) {
    super(iterable);

    this.container = container;

    this.serializerFactory = new SerializerFactory(this.container);
    this.storageModelSerializer = this.serializerFactory.serializerFor("storage-model");

    this.store = localforage.createInstance({
        name: storeName,
        storeName: storeName
    });
  }

  add(obj) {
    super(obj);

    this.addModelToStore(obj);
    
    return this;
  }

  delete(obj) {
    var isDeleted = super.remove(obj);

    if(isDeleted){
        var storageKey = this.getStoreKeyForModel(obj);

        this.store.removeItem(storageKey, null);
    }

    return isDeleted;
  }

  addModelToStore(obj){
    var self = this,
        typeKey = obj.typeKey,
        serializedObject = this.storageModelSerializer.serialize(obj);

    return new Coalesce.Promise(function(resolve, reject) {

      self.store.setItem(StorageModelSet.getStoreKeyForModel(obj), serializedObject, function(error, _serializedObject){
        if(error !== null){
          reject(error);
        }else{
          resolve();
        }
      });
    });
  }

  static getStoreKeyForModel(model) {
    return model.typeKey + ":" + model.clientId;
  }

  /**
    Retrieves and deserializes and merges all models from storage
    for this stored model set into the session parameter
  */
  mergeFromStorageToSession(session) {
    var self = this;
    
    return this.store.iterate(function(value, key) {
        
        var typeKey = key.split(":")[0],
            deserializedModel = self.storageModelSerializer.deserialize(value);

        if(deserializedModel.isNew){
          session.add(deserializedModel);
        }else{
          session.merge(deserializedModel);  
        }
    });
  }

  _clearStore() {
    return this.store.clear();
  }
}
