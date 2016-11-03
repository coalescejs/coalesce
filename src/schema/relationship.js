import Field from './field';

import {dasherize} from 'inflection';

export default class Relationship extends Field {

  static isRelationship = true;

  constructor(schema, name, options) {
    // make sure typeKey is set
    console.assert(options.kind, "Relationships must have a 'kind' property specified");
    console.assert(options.type || options.typeKey, "Must specify a `type` or `typeKey` option");
    if(options.type) {
      var typeKey;
      if(typeof options.type === "string") {
        typeKey = options.type;
      } else {
        typeKey = options.type.typeKey;
      }

      console.assert(!options.typeKey || options.typeKey == typeKey, "type and typekey must match");

      options.typeKey = typeKey;
      delete options.type;
    }

    super(schema, name, options);
  }

  get serializerKey() {
    return this._serializerKey || (this._serializerKey = dasherize(this.kind));
  }

  get owner() {
    if(this._owner) {
      return this._owner;
    }

    // by default, belongsTo own the relationship
    return this._owner = this.kind === 'belongsTo';
  }

  set owner(value) {
    return this._owner = value;
  }

}
