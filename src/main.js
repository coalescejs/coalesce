
import Coalesce from './namespace';

import Context from './context/default';
import ActiveModelContext from './active_model/context';
import RestContext from './rest/context';

import Adapter from './adapter';
import IdManager from './id_manager';

import EntityArray from './collections/entity_array';
import EntitySet from './collections/entity_set';

import MergeStrategy from './merge/base';
import ModelMerge from './merge/model';

import Model from './entities/model';
import Errors from './errors';

import RestErrorsSerializer from './rest/serializers/errors';
import PayloadSerializer from './rest/serializers/payload';
import Payload from './rest/payload';
import RestAdapter from './rest/adapter';

import ActiveModelAdapter from './active_model/adapter';
import ActiveModelSerializer from './active_model/serializers/model';

import Serializer from './serializers/base';
import BelongsToSerializer from './serializers/belongs_to';
import BooleanSerializer from './serializers/boolean';
import DateSerializer from './serializers/date';
import HasManySerializer from './serializers/has_many';
import IdSerializer from './serializers/id';
import NumberSerializer from './serializers/number';
import ModelSerializer from './serializers/model';
import RevisionSerializer from './serializers/revision';
import StringSerializer from './serializers/string';

import CollectionManager from './session/collection_manager';
import Session from './session/session';
import QueryCache from './session/query_cache';
import ModelCache from './session/model_cache';

import isEqual from './utils/is_equal';

import {pluralize, singularize} from './utils/inflector';

Coalesce.Context = Context;

Coalesce.Adapter = Adapter;
Coalesce.IdManager = IdManager;

Coalesce.EntityArray = EntityArray;
Coalesce.EntitySet = EntitySet;

Coalesce.MergeStrategy = MergeStrategy;
Coalesce.ModelMerge = ModelMerge;

Coalesce.Model = Model;
Coalesce.Errors = Errors;

Coalesce.RestContext = RestContext;
Coalesce.RestErrorsSerializer = RestErrorsSerializer;
Coalesce.PayloadSerializer = PayloadSerializer;
Coalesce.Payload = Payload;
Coalesce.RestAdapter = RestAdapter;

Coalesce.ActiveModelContext = ActiveModelContext;
Coalesce.ActiveModelAdapter = ActiveModelAdapter;
Coalesce.ActiveModelSerializer = ActiveModelSerializer;

Coalesce.Serializer = Serializer;
Coalesce.BelongsToSerializer = BelongsToSerializer;
Coalesce.BooleanSerializer = BooleanSerializer;
Coalesce.DateSerializer = DateSerializer;
Coalesce.HasManySerializer = HasManySerializer;
Coalesce.IdSerializer = IdSerializer;
Coalesce.NumberSerializer = NumberSerializer;
Coalesce.ModelSerializer = ModelSerializer;
Coalesce.RevisionSerializer = RevisionSerializer;
Coalesce.StringSerializer = StringSerializer;

Coalesce.CollectionManager = CollectionManager;
Coalesce.Session = Session;
Coalesce.QueryCache = QueryCache;
Coalesce.ModelCache = ModelCache;

Coalesce.pluralize = pluralize;
Coalesce.singularize = singularize;

Coalesce.isEqual = isEqual;

export default Coalesce;
