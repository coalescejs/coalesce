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

    this.store = localforage.createInstance({
        name: storeName,
        storeName: storeName
    });

    this.storeOperationCount = 0;
  }

  get storageModelSerializer(){
    return this.serializerFactory.serializerFor("storage-model");
  }

  get storeIsSettled() {
    return this.storeOperationCount === 0;
  }

  afterStoreIsSettled(callback, binding, args){
    var self = this;
    
    var runnable = function(){
      if(self.storeIsSettled){
        // console.log('store settled.');
        callback.apply(binding, args);
      }else{
        // console.log('store not settled.');
        setTimeout(runnable, 10);
      }
    }

    runnable.apply(this);

    return;
  }

  add(obj) {
    this.addModelToStore(obj);

    return super(obj);
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

    var self = this;
    var serializedObject = self.storageModelSerializer.serialize(obj);

    return new Coalesce.Promise(function(resolve, reject) {

      self.storeOperationCount++;

      self.store.setItem(StorageModelSet.getStoreKeyForModel(obj), serializedObject, function(error, _serializedObject){

        self.storeOperationCount--;

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

    return new Coalesce.Promise(function(resolve, reject) {
      self.afterStoreIsSettled(self._mergeFromStorageToSession, self, [session, resolve]);
    }).then(function(value){
      console.log('mergeFromStorageToSession complete');

      return value;
    });
  }

  _mergeFromStorageToSession(session, resolve) {
    console.log('started _mergeFromStorageToSession');

    var self = this;

    this.storeOperationCount++;

    return this.store.iterate(function(value, key) {
        
        var typeKey = key.split(":")[0],
            deserializedModel = self.storageModelSerializer.deserialize(value);

        if(deserializedModel.isNew){
          console.log('model is new adding to session.')
          session.add(deserializedModel);
        }else{
          console.log('model is not new merging to session.')
          session.merge(deserializedModel);  
        }
    }, function(){
      self.storeOperationCount--;
      console.log('done with iterate');

      self.afterStoreIsSettled(resolve, self);
    });
  }

  _clearStore() {
    return this.store.clear();
  }
}
