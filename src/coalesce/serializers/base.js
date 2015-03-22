import BaseClass from '../utils/base_class';

/**
  Base class for serialization/deserialization

  @namespace serializers
  @class Base
*/
export default class Base extends BaseClass {

  serialize() {}
  
  deserialize() {}

  serializerFor(typeKey) {
    return this.context.configFor(typeKey).get('serializer');
  }

}
