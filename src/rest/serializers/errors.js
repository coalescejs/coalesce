import RestErrors from '../rest_errors';
import Serializer from '../../serializers/base';
import Error from '../../error';
import {camelize} from '../../utils/inflector';
import isEmpty from '../../utils/is_empty';

export default class ErrorsSerializer extends Serializer {

  deserialize(serialized, opts) {
    var xhr = opts && opts.xhr;
    
    if(!xhr && (isEmpty(serialized) || isEmptyObject(serialized))) return;
    
    var content = {};
    for(var key in serialized) {
      content[this.transformPropertyKey(key)] = serialized[key];
    }
    
    // XXX: clean up rest errors class
    var res = new RestErrors({
      content: content
    });
    
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
