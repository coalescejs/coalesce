import ModelSerializer  from '../../serializers/model'
import { singularize } from '../../utils/inflector'


export default class ActiveModelSerializer extends ModelSerializer {

  keyForType(name, type, opts) {
    var key = super.keyForType(name, type);
    if(!opts || !opts.embedded) {
      if(type === 'belongs-to') {
        return key + '_id';
      } else if(type === 'has-many') {
        return singularize(key) + '_ids';
      }
    }
    return key;
  }

}
