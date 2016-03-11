
import ActiveModelAdapter  from './active_model/adapter'
import ActiveModelContext  from './active_model/context'
import ActiveModelSerializer  from './active_model/serializers/model'
import Adapter  from './adapter'
import HasManyArray  from './collections/has_many_array'
import ModelArray  from './collections/model_array'
import ModelSet  from './collections/model_set'
import Context  from './context/default'
import IdManager  from './id_manager'
import MergeStrategy  from './merge/base'
import PerField  from './merge/per_field'
import './model/diff'
import Errors  from './model/errors'
import Model  from './model/model'
import Coalesce  from './namespace'
import RestAdapter  from './rest/adapter'
import RestContext  from './rest/context'
import Payload  from './rest/payload'
import RestErrorsSerializer  from './rest/serializers/errors'
import PayloadSerializer  from './rest/serializers/payload'
import Serializer  from './serializers/base'
import BelongsToSerializer  from './serializers/belongs_to'
import BooleanSerializer  from './serializers/boolean'
import DateSerializer  from './serializers/date'
import HasManySerializer  from './serializers/has_many'
import IdSerializer  from './serializers/id'
import ModelSerializer  from './serializers/model'
import NumberSerializer  from './serializers/number'
import RevisionSerializer  from './serializers/revision'
import StringSerializer  from './serializers/string'
import CollectionManager  from './session/collection_manager'
import InverseManager  from './session/inverse_manager'
import ModelCache  from './session/model_cache'
import QueryCache  from './session/query_cache'
import Session  from './session/session'
import { pluralize, singularize } from './utils/inflector'
import isEqual  from './utils/is_equal'

Coalesce.Context = Context;

Coalesce.Adapter = Adapter;
Coalesce.IdManager = IdManager;

Coalesce.ModelArray = ModelArray;
Coalesce.ModelSet = ModelSet;
Coalesce.HasManyArray = HasManyArray;

Coalesce.MergeStrategy = MergeStrategy;
Coalesce.PerField = PerField;

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
Coalesce.InverseManager = InverseManager;
Coalesce.Session = Session;
Coalesce.QueryCache = QueryCache;
Coalesce.ModelCache = ModelCache;

Coalesce.pluralize = pluralize;
Coalesce.singularize = singularize;

Coalesce.isEqual = isEqual;

export default Coalesce;
