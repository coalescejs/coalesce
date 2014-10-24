import Session from './session/session';
import IdManager from './id_manager';

var SINGLETON_KEY = '__singleton';

var defaults = _.defaults;

/**
  The main configuration context for a Coalesce application
  
  @class Context
*/
export default class Context {
  
  constructor(parent=null, reify=true) {
    super();
    this.instances = {};
    
    this.explicitConfigs = {};
    this.defaultConfigs = {};
    this.cachedConfigs = {};
    
    this.parent = parent;
    if(reify) {
      this.reify();
    }
  }
  
  /**
    Get the default session for this context.
  */
  get session() {
    return this.lookupSingleton('session');
  }
  
  /**
    Get the identity manager for this context
  */
  get idManager() {
    return this.lookupSingleton('idManager');
  }
  
  /**
    Get the adapter for this context
  */
  get adapter() {
    return this.lookupSingleton('adapter');
  }
  
  /**
    Create a child context.
  */
  child() {
    return new this.constructor(this);
  }
  
  /**
    Registers a provider. When requested, providers are created as singletons
    within the context.
    
    ```
    context.register('adapter', 'my-adapter', CustomAdapter);
    
    context.lookup('adapter', 'my-adapter'); // returns an instance of CustomAdapter
    ```
  */
  register(type, name, config={}) {
    var key = this._keyFor(type, name);
    if(klass) {
      this.registry[key] = klass;
    }
    // TODO merge?
    this.configs[key] = config;
  }
  
  /**
    Unregister a provider and remove all configuration for that provider.
  */
  unregister(name, type) {
    var key = this._keyFor(type, name);
    delete this.registry[key];
    delete this.configs[key];
  }
  
  /**
    Configures all providers of the given type
  */
  configureDefaults(type, config) {
    // TODO: unregister defaults?
    // TODO: merge?
    this.defaultConfigs[type] = config;
  }
  
  /**
    Look up a provider instance on the context. This will cause the provider
    to be instantiated. Subsequent lookups on the same provider will return
    the same instance.
    
  */
  lookup(type, name) {
    var key = this._keyFor(type, name),
        value;
    
    if(value = this.instances[key]) {
      return value;
    }
    
    value = this.getInstance(type, name);
    
    if(!value) {
      var factory = this.lookupFactory(type, name);
      
      value = this.instantiate(type, factory);
    }
        
    return this.instances[key] = value;
  }
  
  /**
    Get the instance for this type/name combination without instantiating
  */
  getInstance(type, name) {
    var key = this._keyFor(type, name),
        value = this.instances[key];
    
    if(!value && this.parent) {
      value = this.parent.getInstance(type, name);
    }
    
    return value;
  }
  
  /**
    Looks up the factory for a provider on the context.
  */
  lookupFactory(type, name) {
    var config = this.lookupConfiguration(type, name);
    
    return config.class;
  }
  
  /**
    Looks up the configuration for a provider on the context.
  */
  lookupConfiguration(type, name) {
    var key = this._keyFor(type, name),
        cached;
    if(cached = this.cachedConfigs[key]) {
      return cached;
    }
    
    var defaultConfig = this._lookupDefaultConfiguration(type),
        explicitConfig = this._lookupExplicitConfiguration(type, name);
  
    return this.cachedConfigs[key] = defaults(explicitConfig, defaultConfig);
  }
  
  _lookupExplicitConfiguration(type, name) {
    var key = this._keyFor(type, name),
        config = this.explicitConfigs[key] || {};
        
    if(this.parent) {
      var parentConfig = this.parent._lookupExplicitConfiguration(type, name);
      config = defaults(config, parentConfig);
    }
    
    return config;
  }
  
  _lookupDefaultConfiguration(type) {
    var config = this.defaultConfigs[type] || {};
        
    if(this.parent) {
      var parentConfig = this.parent._lookupDefaultConfiguration(type);
      config = defaults(config, parentConfig);
    }
    
    return config;
  }
  
  /**
    Looks up a provider that was specified as part of a configuration. For example:
    
    ```
    types {
      post: {serializer: 'mySerializer'}
    }
    ```
    
    `lookupConfiguredProvider('type', 'post', 'serializer')` would return the
    instantiated provider associated with the named 'mySerializer' definition.
  */
  lookupConfiguredProvider(type, name, providerType) {
    var config = this.lookupConfiguration(type, name),
        providerConfig = config[providerType];
        
    if(!providerConfig) {
      return null;
    }
    
    // named reference
    if(typeof providerConfig === 'string') {
      return this.lookup(providerType, providerConfig);
    }
    
    // at this point we are dealing with an inline provider definition, here we
    // come up with a computed name
    var providerName = type + "!" + name,
        value;
    
    // check for a cache hit
    if(value = this.getInstance(providerType, providerName)) {
      return value;
    }
    
    // Check to see if this is a shorthandle provider definition
    if(providerConfig.toString() !== '[object Object]') {
      providerConfig = {
        class: providerConfig
      }
    }
    
    // register the inline provider config
    this.register(providerType, providerName, providerConfig);
    
    return this.lookup(providerType, providerName);
  }
  
  /**
    Looks up a *singleton* provider. Singleton providers have only one instance
    with the same type in the context. `session` is a good example of a
    singleton provider.
  */
  lookupSingleton(type) {
    return this.lookup('session', SINGLETON_KEY);
  }
  
  instantiate(type, factory) {
    return new type(this);
  }
  
  /**
    Reifies the configuration, making it permanent. This is a final processing
    step that does things like merge in class-level configuration into the
    context and performs validation.
  */
  reify() {
    
  }
  
  /**
    Types are somewhat of a special case since they are never instantiated in
    the container.
  */
  typeFor(typeKey) {
    return this.lookupFactory('type', typeKey);
  }
  
  serializerFor(typeKey) {
    return this.lookupConfiguredProvider('type', typeKey, 'serializer');
  }
  
  mergeStrategyFor(typeKey) {
    return this.lookupConfiguredProvider('type', typeKey, 'merge-strategy');
  }
  
  _keyFor(type, name) {
    return type + '$' + name;
  }
  
}

Context.prototype.parent = null;
