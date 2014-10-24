import Session from '../session/session';
import IdManager from './id_manager';
import RestAdapter from './rest/rest_adapter';

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

import Errors from './model/errors';

/**
  Context with sensible default providers.
*/
class DefaultContext extends Context {
  
  constructor() {
    super();
    this.registerSingletonProvider('session', Session);
    this.registerSingletonProvider('idManager', IdManager);
    this.registerSingletonProvider('adapter', RestAdapter);
    
    this.registerSerializer('belongsTo', BelongsToSerializer);
    this.registerSerializer('boolean', BooleanSerializer);
    this.registerSerializer('date', DateSerializer);
    this.registerSerializer('hasMany', HasManySerializer);
    this.registerSerializer('id', IdSerializer);
    this.registerSerializer('number', NumberSerializer);
    this.registerSerializer('model', ModelSerializer);
    this.registerSerializer('revision', RevisionSerializer);
    this.registerSerializer('string', StringSerializer);
    
    this.registerType('errors', Errors);
    
    this.registerMergeStrategy('perField', PerField);
    
    this.configureDefault('serializer', 'model');
  }
  
}
