import CollectionSerializer from './collection';
import Query from '../query';

export default class QuerySerializer extends CollectionSerializer {

  get type() {
    return Query;
  }

}
