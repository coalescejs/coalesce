import Context from '../context/default';
import PayloadSerializer from './serializers/payload';
import RestErrorsSerializer from './serializers/errors';
import RestAdapter from './adapter';
export default class RestContext extends Context {
  
  _setupContainer() {
    super()
    var container = this.container;
    
    container.register('adapter:default', container.lookupFactory('adapter:application') || RestAdapter);
    
    container.register('serializer:errors', RestErrorsSerializer);
    container.register('serializer:payload', PayloadSerializer);
  }
  
}
