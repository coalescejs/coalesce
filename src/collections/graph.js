import ModelSet from './model_set';

export default class Graph extends ModelSet {
  
  /**
    Adds the model to the set or overwrites the existing
    model's data.
  */
  add(model) {
    var existing = this.get(model);
    if(existing) {
      model.copyTo(existing);
      return existing;
    } else {
      return super(model);
    }
  }
  
};
