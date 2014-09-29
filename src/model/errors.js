import BaseClass from '../utils/base_class';

class Errors extends BaseClass {

  set(name, value) {
    this[name] = value;
  }

  constructor(obj={}) {
    super()
    for(var key in obj) {
      if(!obj.hasOwnProperty(key)) continue;
      this[key] = obj[key];
    }
  }
  
  forEach(callback, binding) {
    for(var key in this) {
      if(!this.hasOwnProperty(key)) continue;
      callback.call(binding, this[key], key);
    }
  }
  
  copy() {
    return new this.constructor(this);
  }

}

export default Errors;
