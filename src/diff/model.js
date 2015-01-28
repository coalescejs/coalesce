import isEqual from '../utils/is_equal';

export default class ModelDiff extends Array {

  constructor(a, b) {
    
    for(var name in a.attributes) {
      
      var av = a[name],
          bv = b[name];
          
      if(!isEqual(av, bv)) {
        this.push({name: name, value: av});
      }
      
    }
    
  }

}
