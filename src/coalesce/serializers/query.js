import isEmpty from '../utils/is_empty';
import CollectionSerializer from './collection';

import Query from '../entities/query';

/**
  @class QuerySerializer
*/
export default class QuerySerializer extends CollectionSerializer {
  
  createEntity(opts) {
    return new Query(opts.type.typeKey, opts.params);
  }
  
}
