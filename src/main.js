
import Coalesce from './namespace';

import {setupContainer} from './container';
import Container from './container';

import Adapter from './adapter';
import IdManager from './id_manager';

import ModelArray from './collections/model_array';
import ModelSet from './collections/model_set';

import MergeStrategy from './merge/base';
import PerField from './merge/per_field';

import Model from './model/model';
import './model/diff';
import Errors from './model/errors';

import RestErrorsSerializer from './rest/serializers/errors';
import PayloadSerializer from './rest/serializers/payload';
import EmbeddedManager from './rest/embedded_manager';
import Operation from './rest/operation';
import OperationGraph from './rest/operation_graph';
import Payload from './rest/payload';
import RestAdapter from './rest/rest_adapter';

import ActiveModelAdapter from './active_model/active_model_adapter';
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
import InverseManager from './session/inverse_manager';
import Session from './session/session';

import isEqual from './utils/is_equal';

Coalesce.Container = Container;
Coalesce.setupContainer = setupContainer;

Coalesce.Adapter = Adapter;
Coalesce.IdManager = IdManager;

Coalesce.ModelArray = ModelArray;
Coalesce.ModelSet = ModelSet;

Coalesce.MergeStrategy = MergeStrategy;
Coalesce.PerField = PerField;

Coalesce.Model = Model;
Coalesce.Errors = Errors;

Coalesce.RestErrorsSerializer = RestErrorsSerializer;
Coalesce.PayloadSerializer = PayloadSerializer;
Coalesce.EmbeddedManager = EmbeddedManager;
Coalesce.Operation = Operation;
Coalesce.OperationGraph = OperationGraph;
Coalesce.Payload = Payload;
Coalesce.RestAdapter = RestAdapter;

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

Coalesce.isEqual = isEqual;

export default Coalesce;
