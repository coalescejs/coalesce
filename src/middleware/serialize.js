import Container from '../container';
import Graph from '../graph';

import {isEmpty} from 'lodash';

/**
 * Middleware to serialize/deserialize using the serialization layer.
 */
export default class SerializeMiddleware {

  static singleton = true;
  static dependencies = [Container];

  constructor(container) {
    this.container = container;
  }

  async call(ctx, next) {
    const serializer = this._serializerFor(ctx.context);
    if(ctx.serialize !== false) {
      if(ctx.body) {
        ctx.body = serializer.serialize(ctx.body);
      }
    }

    let res = await next(),
        graph = this.container.get(Graph),
        entity = ctx.context;

    if(!isEmpty(res)) {
      let args;
      if(entity.isQuery) {
        args = [entity.type, entity.params];
      } else {
        // Some backends might not pass-through the client-id. In which case,
        // it is important to ensure it gets set during create operations.
        args = [{clientId: entity.clientId}];
      }
      res = serializer.deserialize(graph, res, ...args);
    } else if(entity.isEntity) {
      // if no data is returned from the server, we send back the original
      // entity
      res = ctx.context.fork(graph);
    } else {
      // TODO think through non-entity contexts
      res = ctx.context;
    }
    return res;
  }

  _serializerFor(ctx) {
    let type = ctx.constructor;
    return this.container.serializerFor(type);
  }

}
