import BaseClass from './utils/base_class';
import Error from './error';

/**
  The Adapter is the main object responsible for interfacing with a remote server.
*/
export default class Adapter extends BaseClass {

  load(model, opts, session) {
    throw new Error(`${this} does not support load()`);
  }
  
  query(typeKey, params, opts, session) {
    throw new Error(`${this} does not support query()`);
  }

  persist(model, shadow, opts, session) {
    throw new Error(`${this} does not support persist()`);
  }
  
  remoteCall(context, name, data, opts, session) {
    throw new Error(`${this} does not support remoteCall()`);
  }
  
  isDirty(model, shadow) {
    return true;
  }
  
  isRelationshipOwner(relationship) {
    return relationship.embedded ||
      relationship.kind === 'belongsTo' && relationship.owner !== false ||
      relationship.kind === 'hasMany' && relationship.owner === true;
  }

}
