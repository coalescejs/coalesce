import Query from './query';

export default class HasMany extends Query {
  
  static clientId(field, model) {
    return `${model.clientId}$${field.name}`;
  }
  
}
