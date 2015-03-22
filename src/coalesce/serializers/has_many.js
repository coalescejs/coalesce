import isEmpty from '../utils/is_empty';
import CollectionSerializer from './collection';

import HasMany from '../entities/has_many';

/**
  @class HasManySerializer
*/
export default class HasManySerializer extends CollectionSerializer {

  deserialize(serialized, opts) {
    opts = {
      graph: opts.graph,
      type: opts.field.type
    };
    return super.deserialize(serialized, opts)
  }

  createEntity(opts) {
    /*
      We avoid the constructor. The constructor is applied inside Model.setRelationship
    */
    return new HasMany();
  }

}
