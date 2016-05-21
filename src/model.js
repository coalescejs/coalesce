import Immutable from 'immutable';

import Schema from './schema';
import Entity from './entity';

import Adapter from './adapter';
import Cache from './cache';
import ModelMerge from './merge/model';
import ModelSerializer from './serializers/model';

/**
 * A model is an Entity that has a defined schema and associated data.
 */
export default class Model extends Entity {

  static adapter = Adapter;
  static cache = Cache;
  static merge = ModelMerge;
  static serializer = ModelSerializer;

  _mutating = 0;
  _data = Immutable.Map();

  session = null;
  clientRev = 1;

  constructor(graph, fields={}) {
    super(graph);
    for(var key in fields) {
      this[key] = fields[key];
    }
    // TODO think through the location of this
    graph._idManager.reifyClientId(this);
  }

  // TODO: move to attribute
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
        this._data = this._data.withMutations(fn);
      } else {
        fn.call(this, this._data);
      }
    } finally {
      this._mutating--;
    }
  }

  /**
   * @override
   */
  assign(source) {
    this._data = source._data;
    return this;
  }

  /**
   * @override
   */
  ref(graph) {
    return new this.constructor(graph, {id: this.id, clientId: this.clientId});
  }

  /**
   * @override
   */
  clone(graph) {
    let clone = this.ref(graph);
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

  get typeKey() {
    return this.constructor.typeKey;
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
