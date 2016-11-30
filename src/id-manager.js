/**
  This class is responsible for maintaining a centralized mapping
  between client-side identifiers (`clientId`) and server-side
  identifiers (`id`).

  @class IdManager
*/
export default class IdManager {

  static singleton = true;

  constructor() {
    this.idMaps = {};
    this.uuid = 1;
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
    console.assert(model.isModel || model.isEntity && model.clientId, `${model} needs to have a clientId`);
    var id = model.id,
        clientId = model.clientId,
        typeKey = model.typeKey,
        idMap = this.idMaps[typeKey];

    if(!idMap) {
      idMap = this.idMaps[typeKey] = new Bimap();
    }

    if(id) {
      id = id + '';
    }

    if(id && clientId) {
      var existingClientId = idMap.get(id);
      console.assert(!existingClientId || existingClientId === clientId, "clientId has changed for " + model.toString());
      if(!existingClientId) {
        idMap.set(id, clientId);
      }
    } else if(!clientId) {
      if(id) {
        clientId = idMap.get(id);
      }
      if(!clientId) {
        clientId = this._generateClientId(typeKey);
      }
      model.clientId = clientId;
      if(id) {
        idMap.set(id, clientId);
      }
    } // else NO-OP, nothing to do if they already have a clientId and no id
    return clientId;
  }

  getId(type, clientId) {
    console.assert(clientId, "Must pass a valid clientId");
    if(type.typeKey) {
      type = type.typeKey;
    }
    let idMap = this.idMaps[type];
    return idMap && idMap.inverse(clientId);
  }

  getClientId(type, ...args) {
    // check for string (e.g. raw typeKey)
    if(typeof type === 'string' || type.isModel) {
      return this.getModelClientId(type, ...args);
    }
    // other types have deterministic ids that can be generated
    return type.clientId(this, ...args);
  }

  getModelClientId(type, {id, clientId}) {
    if(clientId) {
      return clientId;
    }
    id = id + '';
    if(type.typeKey) {
      type = type.typeKey;
    }
    let idMap = this.idMaps[type];
    return idMap && idMap.get(id + '');
  }

  _generateClientId(typeKey) {
    return `$${typeKey}${this.uuid++}`;
  }

}


class Bimap {

  constructor() {
    this.map = {};
    this.inverses = {};
  }

  get(key) {
    return this.map[key];
  }

  inverse(value) {
    return this.inverses[value];
  }

  set(key, value) {
    this.inverses[value] = key;
    return this.map[key] = value;
  }

  delete(key) {
    let value = this.get(key);
    delete this.map[key];
    delete this.inverses[value];
  }

}
