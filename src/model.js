import Immutable from 'immutable';

import Schema from './schema';
import Entity from './entity';

export default class Model extends Entity {

  _mutating = 0;
  _attributes = Immutable.Map();
  // cache for new and detached models
  _rels = {};

  constructor(fields) {
    super();
    for(var key in fields) {
      this[key] = fields[key];
    }
  }

  get isNew() {
    return !this.id;
  }

  withMutations(fn) {
    try {
      if(this._mutating++ === 0) {
        if(this.session) {
          this.session.touch(this);
        }
        this._attributes = this._attributes.withMutations(fn);
      } else {
        fn.call(this, this._attributes);
      }
    } finally {
      this._mutating--;
    }
  }

  get schema() {
    return this.constructor.schema;
  }

  static defineSchema(config) {
    this.schema.configure(config);
    this.schema.apply(this.prototype);
  }

  static get typeKey() {
    return this.schema.typeKey;
  }

  static get schema() {
    // TODO use symbol?
    if(this.hasOwnProperty('_schema')) {
      return this._schema;
    }
    let parent = Object.getPrototypeOf(this),
        parentSchema = parent.schema;

    if(parentSchema) {
      this._schema = Object.create(parentSchema);
    } else {
      this._schema = new Schema();
    }
    return this._schema;
  }

}
