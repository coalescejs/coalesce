import ModelSet from './model_set';

export default class Graph extends ModelSet {
  
  add(entity) {
    console.assert(!entity.graph || entity.graph === this, "Entity already belongs to a different graph, consider using fork() instead");
    console.assert(!this.get(entity) || this.get(entity) === entity, "An equivalent entity already exists in the graph");
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
    Similar to get but always returns a model. If the model is not part
    of this graph, then an unloaded model is returned with the same
    identifiers.
  */  
  fetch(entity) {
    var res = this.get(entity);
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
    if(entity.isModel && entity.isNew) {
      var model = entity,
          children = [];
      model.eachChild(function(child) {
        children.push(child);
      });
      model = this.update(model);
      children.forEach(function(child) {
        this.adopt(child);
      }, this);
      return model;
    } else {
      return this.fetch(model);
    }
  }

  
};
