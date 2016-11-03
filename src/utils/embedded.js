export function findEmbeddedRoot(graph, entity) {
  if(entity._parent) {
    entity = findEmbeddedRoot(graph, graph.get({clientId: entity._parent}));
  }
  return entity;
}
