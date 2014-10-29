import ModelSet from './model_set';

/**
  An unordered collection of unique models.
  
  Uniqueness is determined by the `clientId`. If a model is added and an
  equivalent model already exists in the ModelSet, the existing model will be
  overwritten.  StoreModelSet will also keep a copy of each model in storage 
  (to be used for session serializer).

  @class StoredModelSet
*/
export default class StoredModelSet extends ModelSet {

  constructor(iterable) {
    super(iterable);
    this._storeKeyPrefix = "";
  }

  get storeKeyPrefix() {
    return this._storeKeyPrefix;
  }
}
