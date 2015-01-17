import ModelSet from './model_set';

export default class Graph extends ModelSet {
  
  /**
    Add the model to the session or update an existing
    model if one does not exist.
  */
  update(model) {
    return model.fork(this);
  }
  
  /**
    Similar to get but always returns a model. If the model is not part
    of this graph, then an unloaded model is returned with the same
    identifiers.
  */  
  fetch(model) {
    var model = this.get(model);
    if(!model) {
      model = model.unloadedCopy();
      this.adopt(model);
    }
    return model;
  }
  
  adopt(model) {
    console.assert(!this.models.getModel(model) || this.models.getModel(model) === model, "An equivalent model already exists in the session!");

    // Only loaded models are stored on the session
    if(!model.graph) {
      this.add(model);
      model.graph = this;
    }
    return model;
  }

  
};
