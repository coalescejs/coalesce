/**
 * Serializes Boolean values
 */
export default class BooleanSerializer {
  static singleton = true;

  deserialize(serialized) {
    var type = typeof serialized;

    if (type === 'boolean') {
      return serialized;
    } else if (type === 'string') {
      return serialized.match(/^true$|^t$|^1$/i) !== null;
    } else if (type === 'number') {
      return serialized === 1;
    } else {
      return false;
    }
  }

  serialize(deserialized) {
    return Boolean(deserialized);
  }
}
