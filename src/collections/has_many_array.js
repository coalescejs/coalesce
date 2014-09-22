import ModelArray from '../collections/model_array';

export default class HasManyArray extends ModelArray {
  
  get session() {
    return this.owner && this.owner.session;
  }

}
