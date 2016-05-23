import CollectionSerializer from './collection';
import HasMany from '../has-many';

export default class HasManySerializer extends CollectionSerializer {

  get type() {
    return HasMany;
  }

}
