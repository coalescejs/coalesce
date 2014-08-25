import isNone from '../utils/is_none';
import Serializer from './base';

/**
  @namespace serializers
  @class StringSerializer
*/
export default class StringSerializer extends Serializer {

  deserialize(serialized) {
    return isNone(serialized) ? null : String(serialized);
  }

  serialize(deserialized) {
    return isNone(deserialized) ? null : String(deserialized);
  }

}
