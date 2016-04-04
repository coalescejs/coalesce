import IdManager from './session/id-manager';
import EntitySet from './utils/entity-set';

export default class Session {

  constructor() {
    this.entities = new EntitySet();
    this.shadows = new EntitySet();
    this.newEntities = new EntitySet();
    this.idManager = new IdManager();
  }

  /**
    Build an instance of the type. Unlike `create`, this will not mark the
    entity for creation.
  */
  build(type, hash) {
    type = this._typeFor(type);
    let entity = new type(hash || {});
    return entity;
  }

  /**
    Create an instance of the type. This instance will be marked for creation
    and will be persisted on the next call to `.flush()`.
  */
  create(type, ...rest) {
    var entity = this.build(type, ...rest);
    return this._adopt(entity);
  }

  /**
    Get the corresponding instance of the entity for this session.
  */
  get(entity) {
    return this.entities.get(entity);
  }

  /**
    Get the corresponding instance of the entity for this session based on
    a type and parameters.
  */
  getBy(type, {id, clientId}) {
    type = this._typeFor(type);
    if(id) {
      id = id+'';
      clientId = this.idManager.getClientId(type.typeKey, id);
    }
    return this.entities.get({clientId});
  }

  getQuery(type, params) {

  }

  /**
    Get the corresponding instance of the entity for this session or create
    one if one does not exist.
  */
  fetch(entity) {
    let res = this.get(entity);
    if(!res) {
      let {id, clientId} = entity;
      res = this.build(entity.constructor.typeKey, {id, clientId});
    }
    return res;
  }

  fetchBy(type, {id}) {
    type = this._typeFor(type);
    let typeKey = type.typeKey;
    // Always coerce to string
    id = id+'';
    let entity = this.getBy(typeKey, {id});
    if(!entity) {
      entity = this.build(typeKey, {id: id});
      this._adopt(entity);
    }
    return entity;
  }

  fetchQuery(type, params) {

  }

  /**
    Load the specified entity.
  */
  load(entity, ...rest) {

  }

  /**
    Perform the query immediately
  */
  query(type, params) {

  }

  /**
    Invalidate this entity. This removes the entity from the session cache
    and will load additional data next time a `.load()` is called.
  */
  invalidate(entity) {

  }

  /**
    Invalidate all queries related to this type.
  */
  invalidateQueries(type) {

  }

  /**
    Mark an entity as dirty. This will cause the model to be diffed against
    its shadow during the next flush.
  */
  touch(entity) {

  }

  /**
    Delete the entity.
  */
  delete(entity) {

  }

  /**
    Merge the entity into this session.
  */
  merge(serverEntity) {

  }

  /**
    Revert the local changes in the session based on the passed in "original".
  */
  revert(originalEntity) {

  }

  /**
    Flush local changes back down to the remote server.
  */
  flush(entities) {

  }

  /**
    @private

    Associate the entity with the session.
  */
  _adopt(entity) {
    this.reifyClientId(entity);
    console.assert(!entity.session || entity.session === this, "Entities cannot be moved between sessions. Use `get` or `merge` instead.");
    console.assert(!this.get(entity) || this.entities.get(entity) === entity, "An equivalent model already exists in the session!");

    // if(model.isNew) {
    //   this.newModels.add(model);
    // }
    // Only loaded models are stored on the session
    if(!entity.session) {
      this.entities.add(entity);
      entity.session = this;
    }
    return entity;
  }

  /**
    @private

    Ensure the passed in entity has a clientId
  */
  _reifyClientId(entity) {
    this.idManager.reifyClientId(entity);
  }

  /**
    @private

    Coerce a string typeKey into an actual type if needed
  */
  _typeFor(key) {
    // TODO
    return key;
  }

}
