import Graph from '../collections/graph';

/**
  A JSON API Payload
  http://jsonapi.org/format/
  
*/
class Payload extends Graph {

}

Payload.prototype.isPayload = true;

Payload.prototype.data = null;
Payload.prototype.meta = null;
Payload.prototype.errors = null;
Payload.prototype.includes = null;

export default Payload;
