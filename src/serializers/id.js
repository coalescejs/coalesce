/**
 * Identifier serializer
 */
export default class IdSerializer {

  deserialize(serialized) {
    if(serialized === undefined || serialized === null) return;
    return serialized+'';
  }

  serialize(id) {
    if (isNaN(id) || id === null) { return id; }
    return +id;
  }

}
