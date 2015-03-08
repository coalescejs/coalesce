import EntitySet from './entity_set';

export default class Graph extends EntitySet {
  
  add(entity) {
    console.assert(!entity.graph || entity.graph === this, "Entity already belongs to a different graph, consider using fork() instead");
    console.assert(!this._get(entity) || this._get(entity) === entity, "An equivalent entity already exists in the graph");
    super(entity);
    entity.graph = this;
    return this;
  }
  
  /**
    Add the model to the session or update an existing
    model if one does not exist.
  */
  update(entity) {
    return entity.fork(this);
  }
  
  /**
    @private
    
    Ignores overridden public `get` implementations. E.g. session overrides to
    pull from the child session.
  */
  _get(entity) {
    return EntitySet.prototype.get.call(this, entity);
  }
  
  /**
    Similar to get but always returns a model. If the model is not part
    of this graph, then an unloaded model is returned with the same
    identifiers.
  */  
  fetch(entity) {
    // Don't use get since this creates a circular loop with child sessions
    var res = this._get(entity);
    if(!res) {
      res = entity.unloadedCopy();
      this.add(res);
    }
    return res;
  }
  
  /**
    Similar to fetch but will keep the fields of new models and recurse
    detached new models.
    
    TODO: OPTIMIZATION: re-use the model object if not associated with graph
  */
  adopt(entity) {
    if(this.has(entity)) {
      return this._get(entity);
    } else if(entity.isNew) {
      return this.update(entity);
    } else {
      return this.fetch(entity);
    }
  }

  
};
