import BaseClass  from './utils/base_class'

var uuid = 1;

/**
  This class is responsible for maintaining a centralized mapping
  between client-side identifiers (`clientId`) and server-side
  identifiers (`id`).

  @class IdManager
*/
export default class IdManager extends BaseClass {
  constructor() {
    super();
    this.idMaps = {};
  }

  /**
    Three possible cases:

    1. The model already has a clientId and an id.
       Make sure the clientId maps to the id.

    2. The model has no id or clientId. The model must be a new
       record. Generate a clientId and set on the model.

    3. The model has and id but no clientId. Generate a new clientId,
       update the mapping, and assign it to the model.
  */
  reifyClientId(model) {
    var id = model.id,
        clientId = model.clientId,
        typeKey = model.typeKey,
        idMap = this.idMaps[typeKey];

    if(!idMap) {
      idMap = this.idMaps[typeKey] = {};
    }

    if(id) {
      id = id + '';
    }

    if(id && clientId) {
      var existingClientId = idMap[id];
      console.assert(!existingClientId || existingClientId === clientId, "clientId has changed for " + model.toString());
      if(!existingClientId) {
        idMap[id] = clientId;
      }
    } else if(!clientId) {
      if(id) {
        clientId = idMap[id];
      }
      if(!clientId) {
        clientId = this._generateClientId(typeKey);
      }
      model.clientId = clientId;
      idMap[id] = clientId;
    } // else NO-OP, nothing to do if they already have a clientId and no id
    return clientId;
  }

  getClientId(typeKey, id) {
    var idMap = this.idMaps[typeKey];
    return idMap && idMap[id + ''];
  }

  _generateClientId(typeKey) {
    return typeKey + (uuid++);
  }

}
