import Serializer from '../../serializers/base';
import Error from '../../error';
import {camelize} from '../../utils/inflector';
import isEmpty from '../../utils/is_empty';

export default class ErrorsSerializer extends Serializer {

  deserialize(serialized, opts) {
    var xhr = opts && opts.xhr;
    
    if(!xhr && (isEmpty(serialized) || isEmptyObject(serialized))) return;
    
    var Type = this.container.lookupFactory('model:errors');
    var res = Type.create();
    
    for(var key in serialized) {
      res[this.transformPropertyKey(key)] = serialized[key];
    }
    
    if(xhr) {
      res.status = xhr.status;
      res.xhr = xhr;
    }
    
    return res;
  }
  
  transformPropertyKey(name) {
    return camelize(name);
  }

  serialize(id) {
    throw new Error("Errors are not currently serialized down to the server.");
  }

}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
