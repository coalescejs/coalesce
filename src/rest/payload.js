import Graph from '../collections/graph';

class Payload extends Graph {

}

Payload.prototype.isPayload = true;
Payload.prototype.context = null;
Payload.prototype.meta = null;

export default Payload;
