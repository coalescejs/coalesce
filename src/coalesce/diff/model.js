import isEqual from '../utils/is_equal';

export default class ModelDiff extends Array {

  constructor(a, b) {
    
    // TODO: come up with better public .attributes api
    for(var name in a._attributes) {
      
      var av = a[name],
          bv = b && b[name];
          
      if(!isEqual(av, bv)) {
        this.push({name: name, value: av});
      }
      
    }
    
  }

}
