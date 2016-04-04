/**
  The Adapter is the main object responsible for interfacing with a remote server.
*/
export default class Adapter {

  load(entity, opts, session) {
    throw new Error(`${this} does not support load()`);
  }

  persist(entity, shadow, opts, session) {
    throw new Error(`${this} does not support persist()`);
  }

  remoteCall(context, name, data, opts, session) {
    throw new Error(`${this} does not support remoteCall()`);
  }

  // for now defined here
  merge(entity, ancestor, shadow) {
    throw new Error(`${this} does not support merge()`);
  }

}
