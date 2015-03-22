import Graph from '../collections/graph';

/**
 * A JSON API Payload
 * http://jsonapi.org/format/
 *
 * The Payload itself is a Graph.
 */
class Payload extends Graph {

  /**
   * The *included* models are all of those inside
   * the graph *not including* the data
  */
  *included() {
    var context = this.context;
    for(var entity of this) {
      if(this.context) {
        if(this.context.isQuery && entity.type === this.context.type) {
          continue;
        } else if(this.context.isEqual(entity)) {
          continue;
        }
      }
      yield entity;
    }
  }

}

Payload.prototype.isPayload = true;

Payload.prototype.data = null;
Payload.prototype.meta = null;
Payload.prototype.errors = null;

export default Payload;
