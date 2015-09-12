import Error  from '../error';
import Config  from './config';
import Container  from './container';

export default class Base {
  
  constructor(config=null, container=new Container()) {
    container.register('context:main', this, {instantiate: false});
    this.container = container;
    this._configs = {};
    this._setupContainer();
    if(config) {
      this.configure(config);
    }
  }
  
  typeFor(typeKey) {
    return this.configFor(typeKey).type;
  }
  
  configFor(typeKey) {
    typeKey = this._normalizeKey(typeKey);
    var config = this._configs[typeKey];
    if(!config) {
      config = this._configs[typeKey] = new Config(typeKey, this);
      if(config.type) {
        config.type.reify(this, typeKey);
      }
    }
    return config;
  }
  
  configure(config, typeKey='default') {
    for(var key in config) {
      if(!config.hasOwnProperty(key)) continue;
      var value = config[key];
      
      // the `types` config property is special and configures subtypes
      if(key === 'types') {
        this._configureTypes(config.types);
        continue;
      }
      
      // types are currently registered on the container under the `model`
      // namespace (e.g. model:post)
      if(key === 'class') {
        key = 'model';
      }
      
      this._register(typeKey, key, value);
    }
  }
  
  _normalizeKey(key) {
    if(typeof key !== 'string') {
      key = key.typeKey;
    }
    console.assert(key, `Unknown type '${key}'`);
    return key;
  }
  
  _configureTypes(typesConfig) {
    for(var key in typesConfig) {
      if(!typesConfig.hasOwnProperty(key)) continue;
      var config = typesConfig[key];
      // support shorthand notation of just a class
      if(typeof config === 'function') {
        config = {
          class: config
        };
      }
      var klass = config.class;
      if(klass && !klass.typeKey) {
        klass.typeKey = key;
      }
      this.configure(config, key);
    }
  }
  
  _register(typeKey, type, value, opts) {
    var key = `${type}:${typeKey}`
    return this.container.register(key, value);
  }
  
  _setupContainer() {
    // subclasses override
  }
  
}
