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

  async call({serialize, body, entity}, next) {
    const serializer = this._serializerFor(entity);
    if(serialize !== false) {
      if(body) {
        body = serializer.serialize(body);
      }
    }

    let res = await next(),
        graph = this.container.get(Graph);

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
    } else {
      // if no data is returned from the server, we send back the original
      // entity
      res = entity.fork(graph);
    }
    return res;
  }

  _serializerFor(entity) {
    let type = entity.constructor;
    return this.container.serializerFor(type);
  }

}
