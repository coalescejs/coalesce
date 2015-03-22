import Context from '../context/default';
import PayloadSerializer from './serializers/payload';
import JsonApiErrorsSerializer from './serializers/errors';
import JsonApiAdapter from './adapter';

export default class JsonApiContext extends Context {

  _setupContainer() {
    super._setupContainer()
    var container = this.container;

    container.register('adapter:default', container.lookupFactory('adapter:application') || JsonApiAdapter);

    container.register('serializer:errors', JsonApiErrorsSerializer);
    container.register('serializer:payload', PayloadSerializer);
  }

}
