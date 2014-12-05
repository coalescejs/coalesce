/**
  Per-type configuration object. Used to access the per-type adapter/serializer/etc.
*/
export default class Config {
  
  constructor(typeKey, context) {
    this._typeKey = typeKey;
    this._context = context;
    this._container = context.container;
  }
  
  get type() {
    if(this._type !== undefined) {
      return this._type;
    }
    var Type = this._container.lookupFactory(`model:${this._typeKey}`);
    if(Type) {
      // Ember's container extends by default
      Type = Type.parentType;
    }
    return this._type = Type;
  }
  
  get(key) {
    var containerKey = `${key}:${this._typeKey}`,
        container = this._container;
    
    if(!container.has(containerKey)) {
      var defaultKey = `${key}:default`,
          Default = container.lookupFactory(defaultKey);
          
      console.assert(Default, `No default '${key}' found`);
          
      class Factory extends Default {};
      
      container.register(containerKey, Factory);
    }
    
    var value = this._container.lookup(containerKey);
    
    if(!value.typeKey) {
      value.typeKey = this._typeKey;
    }
    
    return value;
  }
  
}
