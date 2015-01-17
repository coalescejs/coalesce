import Base from './base';

import Session from '../session/session';

import BelongsToSerializer from '../serializers/belongs_to';
import BooleanSerializer from '../serializers/boolean';
import DateSerializer from '../serializers/date';
import HasManySerializer from '../serializers/has_many';
import IdSerializer from '../serializers/id';
import NumberSerializer from '../serializers/number';
import ModelSerializer from '../serializers/model';
import RevisionSerializer from '../serializers/revision';
import StringSerializer from '../serializers/string';

import ModelMerge from '../merge/model';
import HasManyMerge from '../merge/has_many';
import BelongsToMerge from '../merge/belongs_to';

import ModelCache from '../session/model_cache';
import QueryCache from '../session/query_cache';

import Errors from '../model/errors';

import IdManager from '../id_manager';

/**
  Default context with sensible default configuration
*/
export default class Context extends Base {
  
  newSession() {
    return this.container.lookup('session:default');
  }
  
  get session() {
    return this.container.lookup('session:main');
  }
  
  _setupContainer() {
    super();
    var container = this.container;
    container.register('model:errors', Errors);
    this._setupSession(container);
    this._setupInjections(container);
    this._setupSerializers(container);
    this._setupMergeStrategies(container);
    this._setupCaches(container);
  }
  
  _setupSession(container) {
    container.register('session:default',  container.lookupFactory('session:application') || Session, {singleton: false});
    container.register('session:main', container.lookupFactory('session:application') || Session);
    container.register('idManager:default', IdManager);
  }
  
  _setupInjections(container) {
    container.typeInjection('session', 'context', 'context:main');
    container.typeInjection('serializer', 'context', 'context:main');
    container.typeInjection('adapter', 'context', 'context:main');
    
    container.typeInjection('serializer', 'idManager', 'idManager:default');
    container.typeInjection('session', 'idManager', 'idManager:default');
    container.typeInjection('adapter', 'idManager', 'idManager:default');
  }
  
  _setupSerializers(container) {
    container.register('serializer:default', ModelSerializer);
    
    container.register('serializer:belongs-to', BelongsToSerializer);
    container.register('serializer:boolean', BooleanSerializer);
    container.register('serializer:date', DateSerializer);
    container.register('serializer:has-many', HasManySerializer);
    container.register('serializer:id', IdSerializer);
    container.register('serializer:number', NumberSerializer);
    container.register('serializer:revision', RevisionSerializer);
    container.register('serializer:string', StringSerializer);
  }
  
  _setupMergeStrategies(container) {
    container.register('merge:default', ModelMerge);
    container.register('merge:belongs-to', BelongsToMerge);
    container.register('merge:has-many', HasManyMerge);
  }
  
  _setupCaches(container) {
    container.register('queryCache:default', QueryCache);
    container.register('modelCache:default', ModelCache);
  }
  
}
