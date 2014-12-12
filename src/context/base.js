import IdManager from './id_manager';
import Container from './container';

export default class Base {
  
  constructor(config=null, parent=null, container=new Container()) {
    this.container = container;
    this.parent = parent;
    this._configs = {};
    this._setupContainer();
    if(config) {
      this.configure(config);
    }
  }
  
  configure(config) {
    this._configureTypes(config.types);
  }
  
  contextFor(typeKey) {
    var config = this._configs[typeKey];
    if(!config) {
      config = this._configs[typeKey] = new Config(this.container);
    }
    return config;
  }
  
  _configureTypes(typesConfig) {
    
    for(var key in typesConfig) {
      if(!typesConfig.hasOwnProperty(key)) continue;
      
      var config = typesConfig[key];
      
      this._configureType(key, config);
    }
    
  }
  
  _configureType(name, config) {
    var container = this.container;
    
    // handle shorthand where config is just the class
    if(typeof config !== 'object') {
      config = {
        class: config
      };
    }
    
    for(var key in config) {
      if(!config.hasOwnProperty(key)) continue;
      var value = config[key];
      
      // types are currently registered on the container under the `model`
      // namespace (e.g. model:post)
      if(key === 'class') {
        key = 'model';
      }
      
      container.register(`${key}:${name}`, value);
    }
  }
  
  _setupContainer() {
    container.register('id-manager:main', IdManager);
    
    container.typeInjection('serializer', 'idManager', 'id-manager:main');
    container.typeInjection('session', 'idManager', 'id-manager:main');
    container.typeInjection('adapter', 'idManager', 'id-manager:main');
  }
  
  
  get session() {
    
  }
  
  get adapter() {
    
  }
  
  get queryCache() {
    
  }
  
  get modelCache() {
    
  }
  
  get serializer() {
    
  }
  
}
