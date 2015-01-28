import ArrayDiff from '../utils/array_diff';
import isEqual from '../utils/is_equal';

export default class QueryDiff extends Array {
  
  constructor(a, b) {
    var diff = new ArrayDiff(a, b, isEqual);
    
    for(var eleDiff of diff.diff) {
      if(!eleDiff.common) {
        this.push(eleDiff);
      }
    }
  }
  
}
