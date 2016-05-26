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

  static defaults = Immutable.Map({isNew: false, isDeleted: false});

  _data = this.constructor.defaults;

  session = null;
  clientRev = 1;

  constructor(graph, {id, clientId, ...rest}) {
    super(graph);
    this.id = id;
    this.clientId = clientId;
    // TODO think through the location of this
    graph._idManager.reifyClientId(this);
    for(var key in rest) {
      this[key] = rest[key];
    }
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

  /**
   * @override
   */
  ref(graph) {
    return new this.constructor(graph, {id: this.id, clientId: this.clientId});
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
