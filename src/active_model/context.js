import Context  from '../rest/context'
import ActiveModelAdapter  from './adapter'
import ActiveModelSerializer  from './serializers/model'

export default class ActiveModelContext extends Context {
  
  _setupContainer() {
    super._setupContainer();
    var container = this.container;
    container.register('adapter:default', container.lookupFactory('adapter:application') || ActiveModelAdapter);
    
    container.register('serializer:model', ActiveModelSerializer);
  }
  
}
