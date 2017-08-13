/**
  Abstract base class for attributes and relationships
  @class Field
*/
export default class Field {
  constructor(schema, name, options) {
    this.schema = schema;
    this.name = name;
    for (var key in options) {
      if (!options.hasOwnProperty(key)) {continue;}
      this[key] = options[key];
    }
  }

  get serializerKey() {
    return this.type;
  }
}

Field.prototype.writable = true;
