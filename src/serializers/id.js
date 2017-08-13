/**
 * Identifier serializer
 */
export default class IdSerializer {
  static singleton = true;

  deserialize(serialized) {
    if (serialized === undefined || serialized === null) {return;}
    return serialized + '';
  }

  serialize(id) {
    if (isNaN(id) || id === null) {
      return id;
    }
    return +id;
  }
}
