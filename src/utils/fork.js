import copy from './copy';

/**
  Utility method to fork session-aware objects and to copy other objects
  
  @method fork
  @param {Object} obj the object to fork
  @param {Session} session the session to fork into
  @return {Object} the forked/copied object
*/
export default function(obj, session) {
  if (obj.fork && typeof obj.fork === 'function') return obj.fork(session);
  return copy(obj, true);
}
