/**
  @namespace factory
  @class MergeFactory
*/
export default class ModelCacheFactory {

  constructor(container) {
    this.container = container;
  }

  modelCacheFor(typeKey) {
    console.assert(typeof typeKey === 'string', 'Passed in typeKey must be a string');
    var modelCache = this.container.lookup('model-cache:' + typeKey);
    // if none exists, create and register a default
    if(!modelCache) {
      var ModelCache = this.container.lookupFactory('model-cache:default');
      this.container.register('model-cache:' + typeKey, ModelCache);
      modelCache = this.container.lookup('model-cache:' + typeKey);
    }
    modelCache.typeKey = typeKey;
    return modelCache;
  }

}
