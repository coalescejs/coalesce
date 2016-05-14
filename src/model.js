import Immutable from 'immutable';

import Schema from './schema';
import Entity from './entity';

import ModelMerge from './merge/model';


/**
 * A model is an Entity that has a defined schema and associated data.
 */
export default class Model extends Entity {

  static merge = ModelMerge;

  _mutating = 0;
  _attributes = Immutable.Map();
  // cache for new and detached models
  _rels = {};

  session = null;
  clientRev = 1;

  constructor(fields) {
    super();
    for(var key in fields) {
      this[key] = fields[key];
    }
  }

  get isNew() {
    return !this.id;
  }

  get isModel() {
    return true;
  }

  get isLoaded() {
    // if we have a rev, assume loaded
    if(this.rev) {
      return true;
    }

    // otherwise lets check for any attributes
    // TODO
  }

  get isDirty() {
    if(this.session) {
      return this.session.isEntityDirty(this);
    } else {
      return false;
    }
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


  /**
   * @override
   */
  assign(source) {
    this._attributes = source._attributes;
    return this;
  }

  clone() {
    let clone = new this.constructor();
    clone.assign(this);
    return clone;
  }

  get schema() {
    return this.constructor.schema;
  }


  /**
   * @override
   */
  *relatedEntities() {
    for(let relationship of this.schema.relationships()) {
      let rel = this[relationship.name];
      if(rel) {
        yield rel;
      }
    }
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

// apply the default fields
Model.schema.apply(Model.prototype);
