
import Coalesce from './namespace';

import Context from './context/default';
import JsonapiContext from './jsonapi/context';

import Adapter from './adapter';
import IdManager from './id_manager';

import EntityArray from './collections/entity_array';
import EntitySet from './collections/entity_set';

import MergeStrategy from './merge/base';
import ModelMerge from './merge/model';

import Model from './entities/model';
import Errors from './errors';

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

import JsonApiErrorsSerializer from './json_api/serializers/errors';
import JsonApiPayloadSerializer from './json_api/serializers/payload';
import JsonApiPayload from './json_api/payload';
import JsonApiAdapter from './json_api/adapter';

Coalesce.Context = Context;

Coalesce.Adapter = Adapter;
Coalesce.IdManager = IdManager;

Coalesce.EntityArray = EntityArray;
Coalesce.EntitySet = EntitySet;

Coalesce.MergeStrategy = MergeStrategy;
Coalesce.ModelMerge = ModelMerge;

Coalesce.Model = Model;
Coalesce.Errors = Errors;

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

Coalesce.JsonApiContext = JsonApiContext;
Coalesce.JsonApiErrorsSerializer = JsonApiErrorsSerializer;
Coalesce.JsonApiPayloadSerializer = JsonApiPayloadSerializer;
Coalesce.JsonApiPayload = JsonApiPayload;
Coalesce.JsonApiAdapter = JsonApiAdapter;

export default Coalesce;
