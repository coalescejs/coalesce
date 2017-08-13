import isNil from 'lodash/isNil';

/**
 * Number serializer.
 */
export default class NumberSerializer {
  static singleton = true;

  deserialize(serialized) {
    return isNil(serialized) ? null : Number(serialized);
  }

  serialize(deserialized) {
    return isNil(deserialized) ? null : Number(deserialized);
  }
}
