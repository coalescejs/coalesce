import ModelSet from './model_set';
import SerializerFactory from '../factories/serializer';

/**
  An unordered collection of unique models.
  
  Uniqueness is determined by the `clientId`. If a model is added and an
  equivalent model already exists in the ModelSet, the existing model will be
  overwritten.  StoreModelSet will also keep a copy of each model in storage 
  (to be used for session serializer).  Each instance of storedModelSet 
  has its own localforage store.

  @class StoredModelSet
*/
export default class StoredModelSet extends ModelSet {

  constructor(storeName, container, iterable) {
    super(iterable);

    this.container = container;

    this.serializerFactory = new SerializerFactory(this.container);

    this.store = localforage.createInstance({
        name: storeName,
        storeName: storeName
    });
  }

  add(obj) {
    super(obj);

    addModelToStore(obj);
    
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

  serializerFor(typeKey) {
    return this.serializerFactory.serializerFor(typeKey);
  }

  addModelToStore(obj){
    var self = this,
        typeKey = obj.typeKey,
        serializer = this.serializerFor(typeKey),
        serializedObject = serializer.serialize(obj);

    return new Coalesce.Promise(function(resolve, reject) {

      self.store.setItem(StoredModelSet.getStoreKeyForModel(obj), serializedObject, function(error, _serializedObject){
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
        serializer = self.serializerFor(typeKey),
        deserializedModel = serializer.deserialize(value);

        session.merge(deserializedModel);

    });
  }

  _clearStore() {
    return this.store.clear();
  }
}
