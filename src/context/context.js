import Base from './base';
import Container from './container';


/**
  Default context with sensible default configuration
*/
export default class Context extends Base {
  
  constructor(configOrParent={}, container=new Container()) {
    super(configOrParent, container);
    setupContainer(container);
  }
  
}

import Session from './session/session';

import IdManager from './id_manager';

import BelongsToSerializer from './serializers/belongs_to';
import BooleanSerializer from './serializers/boolean';
import DateSerializer from './serializers/date';
import HasManySerializer from './serializers/has_many';
import IdSerializer from './serializers/id';
import NumberSerializer from './serializers/number';
import ModelSerializer from './serializers/model';
import RevisionSerializer from './serializers/revision';
import StringSerializer from './serializers/string';

import PerField from './merge/per_field';

import ModelCache from './session/model_cache';
import QueryCache from './session/query_cache';

import RestAdapter from './rest/rest_adapter';

import Errors from './model/errors';

function setupContainer(container) {
  container.register('model:errors', Errors);
  setupSession(container);
  setupInjections(container);
  setupSerializers(container);
  setupMergeStrategies(container);
  setupCaches(container);
}

function setupSession(container) {
  container.register('adapter:main', container.lookupFactory('adapter:application') || RestAdapter);
  container.register('session:base',  Session);
  container.register('session:main', container.lookupFactory('session:application') || Session);
  container.register('id-manager:main', IdManager);
}

function setupInjections(container) {
  container.typeInjection('session', 'adapter', 'adapter:main');
  container.typeInjection('serializer', 'idManager', 'id-manager:main');
  container.typeInjection('session', 'idManager', 'id-manager:main');
  container.typeInjection('adapter', 'idManager', 'id-manager:main');
  container.typeInjection('model-cache', 'session', 'session:main');
  container.typeInjection('query-cache', 'session', 'session:main');
}

function setupSerializers(container) {
  container.register('serializer:belongs-to', BelongsToSerializer);
  container.register('serializer:boolean', BooleanSerializer);
  container.register('serializer:date', DateSerializer);
  container.register('serializer:has-many', HasManySerializer);
  container.register('serializer:id', IdSerializer);
  container.register('serializer:number', NumberSerializer);
  container.register('serializer:model', ModelSerializer);
  container.register('serializer:revision', RevisionSerializer);
  container.register('serializer:string', StringSerializer);
}

function setupMergeStrategies(container) {
  container.register('merge-strategy:per-field', PerField);
  container.register('merge-strategy:default', PerField);
}

function setupCaches(container) {
  container.register('query-cache:default', QueryCache);
  container.register('model-cache:default', ModelCache);
}
