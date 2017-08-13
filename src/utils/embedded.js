export function findEmbeddedRoot(graph, entity) {
  if (entity._parent) {
    entity = findEmbeddedRoot(graph, graph.get({ clientId: entity._parent }));
  }
  return entity;
}

export function* eachEmbeddedChild(graph, entity) {
  for (let child of entity.relatedEntities()) {
    if (child._parent === entity.clientId) {
      yield child;
    }
  }
}
