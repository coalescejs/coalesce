import Error from './error';
import BaseClass from './utils/base_class';
import Session from './session/session';
import array_from from './utils/array_from';

export default class Adapter extends BaseClass {

  serialize(model, opts) {
    return this._serializerFor(model).serialize(model, opts);
  }

  deserialize(typeKey, data, opts) {
    if(!opts.typeKey)
    return this._serializerFor(typeKey).deserialize(data, opts);
  }

  serializerFor(typeKey) {
    return this._serializerFor(typeKey);
  }

  merge(model, session) {
    if(!session) {
      session = this.container.lookup('session:main');
    }
    return session.merge(model);
  }

  mergeData(data, typeKey, session) {
    if(!typeKey) {
      typeKey = this.defaultSerializer;
    }

    var serializer = this._serializerFor(typeKey),
        deserialized = serializer.deserialize(data);

    if(deserialized.isModel) {
      return this.merge(deserialized, session);
    } else {
      return array_from(deserialized).map(function(model) {
        return this.merge(model, session);
      }, this);
    }
  }

  // This can be overridden in the adapter sub-classes
  isDirtyFromRelationships(model, cached, relDiff) {
    return relDiff.length > 0;
  }

  shouldSave(model) {
    return true;
  }

  reifyClientId(model) {
    this.idManager.reifyClientId(model);
  }
  
  _serializerFor(key) {
    return this.context.configFor(key).get('serializer');
  }

}
