import copy from './copy';

/**
  Similar to copy, but is model-graph aware. If an object
  does not have a fork method, this is equivalent to a deep
  copy.
*/
export default function fork(obj, graph) {
  // primitive data types are immutable, just return them.
  if ('object' !== typeof obj || obj===null) return obj;
  if (graph && obj.fork && typeof obj.fork === 'function') return obj.fork(graph);
  return copy(obj, true);
}
