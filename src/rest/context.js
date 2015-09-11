import Context  from '../context/default'
import RestAdapter  from './adapter'
import RestErrorsSerializer  from './serializers/errors'
import PayloadSerializer  from './serializers/payload'

export default class RestContext extends Context {
  
  _setupContainer() {
    super._setupContainer()
    var container = this.container;
    
    container.register('adapter:default', container.lookupFactory('adapter:application') || RestAdapter);
    
    container.register('serializer:errors', RestErrorsSerializer);
    container.register('serializer:payload', PayloadSerializer);
  }
  
}
