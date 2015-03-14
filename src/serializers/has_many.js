import isEmpty from '../utils/is_empty';
import QuerySerializer from './query';

import HasMany from '../entities/has_many';

/**
  @class HasManySerializer
*/
export default class HasManySerializer extends QuerySerializer {
  
  deserialize(serialized, opts) {
    opts = {
      graph: opts.graph,
      type: opts.field.type
    };
    return super(serialized, opts)
  }

  // TODO: make this work, for now we just return a query which still populates
  // since the hasMany field definition's `set` method
  // createEntity() {
  //   return new HasMany();
  // }

  
}
