import {isNil} from 'lodash';

/**
 * Number serializer.
 */
export default class NumberSerializer {

  deserialize(serialized) {
    return isNil(serialized) ? null : Number(serialized);
  }

  serialize(deserialized) {
    return isNil(deserialized) ? null : Number(deserialized);
  }
}
