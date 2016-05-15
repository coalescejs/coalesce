import {isNil} from 'lodash';

/**
 * String serializer.
 */
export default class StringSerializer {

  deserialize(serialized) {
    return isNil(serialized) ? null : String(serialized);
  }

  serialize(deserialized) {
    return isNil(deserialized) ? null : String(deserialized);
  }

}
