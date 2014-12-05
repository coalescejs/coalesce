import Container from './container';

export default class Base {
  
  constructor(configOrParent={}, container=new Container()) {
    this.container = container;
    if(typeof configOrParent === 'object') {
      this.configure(configOrParent);
    } else {
      this.parent = configOrParent;
    }
  }
  
  configure(config) {
    
  }
  
}
