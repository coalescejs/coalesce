import {underscore} from 'inflection';

/**
  Abstract base class for attributes and relationships
  @class Field
*/
export default class Field {

  constructor(schema, name, options) {
    this.schema = schema;
    this.name = name;
    for(var key in options) {
      if(!options.hasOwnProperty(key)) continue;
      this[key] = options[key];
    }
  }

  get key() {
    return this._key || (this._key = underscore(this.name));
  }

  set key(value) {
    return this._key = value;
  }

  get serializerKey() {
    return this.type;
  }

}

Field.prototype.writable = true;
