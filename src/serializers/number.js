import isEmpty from '../utils/is_empty';
import Serializer from './base';

/**
  @namespace serializers
  @class NumberSerializer
*/
export default class NumberSerializer extends Serializer {

  deserialize(serialized) {
    return isEmpty(serialized) ? null : Number(serialized);
  }

  serialize(deserialized) {
    return isEmpty(deserialized) ? null : Number(deserialized);
  }
}
