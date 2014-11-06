import Container from './container/container';

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
import SessionSerializer from './serializers/session';
import ModelSetSerializer from './serializers/model_set';
import StorageModelSerializer from './serializers/storage_model';

import PerField from './merge/per_field';

import RestAdapter from './rest/rest_adapter';

import Errors from './model/errors';

function setupContainer(container) {
  container.register('model:errors', Errors);
  setupSession(container);
  setupInjections(container);
  setupSerializers(container);
  setupMergeStrategies(container);
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
  container.register('serializer:session', SessionSerializer);
  container.register('serializer:model-set', ModelSetSerializer);
  container.register('serializer:storage-model', StorageModelSerializer);
}

function setupMergeStrategies(container) {
  container.register('merge-strategy:per-field', PerField);
  container.register('merge-strategy:default', PerField);
}

function CoalesceContainer() {
  Container.apply(this, arguments);
  setupContainer(this);
}

CoalesceContainer.prototype = Object.create(Container.prototype);

export {setupContainer};
export default CoalesceContainer;
