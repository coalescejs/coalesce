import Context from '../rest/context';
import ActiveModelSerializer from './serializers/model';
import ActiveModelAdapter from './adapter';

export default class ActiveModelContext extends Context {
  
  _setupContainer() {
    super();
    var container = this.container;
    container.register('adapter:default', container.lookupFactory('adapter:application') || ActiveModelAdapter);
    
    container.register('serializer:model', ActiveModelSerializer);
  }
  
}
