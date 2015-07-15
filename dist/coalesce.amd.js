/*!
 * @overview  Coalesce.js
 * @copyright Copyright 2014 Gordon L. Hempton and contributors
 * @license   Licensed under MIT license
 *            See https://raw.github.com/coalescejs/coalesce/master/LICENSE
 * @version   0.4.0+dev.c008febd
 */
define("coalesce", ['./namespace', './container', './container', './adapter', './id_manager', './collections/model_array', './collections/model_set', './collections/has_many_array', './merge/base', './merge/per_field', './model/model', './model/diff', './model/errors', './rest/serializers/errors', './rest/serializers/payload', './rest/embedded_manager', './rest/operation', './rest/operation_graph', './rest/payload', './rest/rest_adapter', './active_model/active_model_adapter', './active_model/serializers/model', './serializers/base', './serializers/belongs_to', './serializers/boolean', './serializers/date', './serializers/has_many', './serializers/id', './serializers/number', './serializers/model', './serializers/revision', './serializers/string', './session/collection_manager', './session/inverse_manager', './session/session', './session/query_cache', './session/model_cache', './utils/is_equal', './utils/inflector'], function($__0,$__2,$__4,$__6,$__8,$__10,$__12,$__14,$__16,$__18,$__20,$__22,$__23,$__25,$__27,$__29,$__31,$__33,$__35,$__37,$__39,$__41,$__43,$__45,$__47,$__49,$__51,$__53,$__55,$__57,$__59,$__61,$__63,$__65,$__67,$__69,$__71,$__73,$__75) {
  "use strict";
  var __moduleName = "coalesce";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  if (!$__16 || !$__16.__esModule)
    $__16 = {default: $__16};
  if (!$__18 || !$__18.__esModule)
    $__18 = {default: $__18};
  if (!$__20 || !$__20.__esModule)
    $__20 = {default: $__20};
  if (!$__22 || !$__22.__esModule)
    $__22 = {default: $__22};
  if (!$__23 || !$__23.__esModule)
    $__23 = {default: $__23};
  if (!$__25 || !$__25.__esModule)
    $__25 = {default: $__25};
  if (!$__27 || !$__27.__esModule)
    $__27 = {default: $__27};
  if (!$__29 || !$__29.__esModule)
    $__29 = {default: $__29};
  if (!$__31 || !$__31.__esModule)
    $__31 = {default: $__31};
  if (!$__33 || !$__33.__esModule)
    $__33 = {default: $__33};
  if (!$__35 || !$__35.__esModule)
    $__35 = {default: $__35};
  if (!$__37 || !$__37.__esModule)
    $__37 = {default: $__37};
  if (!$__39 || !$__39.__esModule)
    $__39 = {default: $__39};
  if (!$__41 || !$__41.__esModule)
    $__41 = {default: $__41};
  if (!$__43 || !$__43.__esModule)
    $__43 = {default: $__43};
  if (!$__45 || !$__45.__esModule)
    $__45 = {default: $__45};
  if (!$__47 || !$__47.__esModule)
    $__47 = {default: $__47};
  if (!$__49 || !$__49.__esModule)
    $__49 = {default: $__49};
  if (!$__51 || !$__51.__esModule)
    $__51 = {default: $__51};
  if (!$__53 || !$__53.__esModule)
    $__53 = {default: $__53};
  if (!$__55 || !$__55.__esModule)
    $__55 = {default: $__55};
  if (!$__57 || !$__57.__esModule)
    $__57 = {default: $__57};
  if (!$__59 || !$__59.__esModule)
    $__59 = {default: $__59};
  if (!$__61 || !$__61.__esModule)
    $__61 = {default: $__61};
  if (!$__63 || !$__63.__esModule)
    $__63 = {default: $__63};
  if (!$__65 || !$__65.__esModule)
    $__65 = {default: $__65};
  if (!$__67 || !$__67.__esModule)
    $__67 = {default: $__67};
  if (!$__69 || !$__69.__esModule)
    $__69 = {default: $__69};
  if (!$__71 || !$__71.__esModule)
    $__71 = {default: $__71};
  if (!$__73 || !$__73.__esModule)
    $__73 = {default: $__73};
  if (!$__75 || !$__75.__esModule)
    $__75 = {default: $__75};
  var Coalesce = $__0.default;
  var setupContainer = $__2.setupContainer;
  var Container = $__4.default;
  var Adapter = $__6.default;
  var IdManager = $__8.default;
  var ModelArray = $__10.default;
  var ModelSet = $__12.default;
  var HasManyArray = $__14.default;
  var MergeStrategy = $__16.default;
  var PerField = $__18.default;
  var Model = $__20.default;
  $__22;
  var Errors = $__23.default;
  var RestErrorsSerializer = $__25.default;
  var PayloadSerializer = $__27.default;
  var EmbeddedManager = $__29.default;
  var Operation = $__31.default;
  var OperationGraph = $__33.default;
  var Payload = $__35.default;
  var RestAdapter = $__37.default;
  var ActiveModelAdapter = $__39.default;
  var ActiveModelSerializer = $__41.default;
  var Serializer = $__43.default;
  var BelongsToSerializer = $__45.default;
  var BooleanSerializer = $__47.default;
  var DateSerializer = $__49.default;
  var HasManySerializer = $__51.default;
  var IdSerializer = $__53.default;
  var NumberSerializer = $__55.default;
  var ModelSerializer = $__57.default;
  var RevisionSerializer = $__59.default;
  var StringSerializer = $__61.default;
  var CollectionManager = $__63.default;
  var InverseManager = $__65.default;
  var Session = $__67.default;
  var QueryCache = $__69.default;
  var ModelCache = $__71.default;
  var isEqual = $__73.default;
  var $__76 = $__75,
      pluralize = $__76.pluralize,
      singularize = $__76.singularize;
  Coalesce.Container = Container;
  Coalesce.setupContainer = setupContainer;
  Coalesce.Adapter = Adapter;
  Coalesce.IdManager = IdManager;
  Coalesce.ModelArray = ModelArray;
  Coalesce.ModelSet = ModelSet;
  Coalesce.HasManyArray = HasManyArray;
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
  Coalesce.QueryCache = QueryCache;
  Coalesce.ModelCache = ModelCache;
  Coalesce.pluralize = pluralize;
  Coalesce.singularize = singularize;
  Coalesce.isEqual = isEqual;
  var $__default = Coalesce;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/active_model/active_model_adapter", ['../rest/rest_adapter', './serializers/model', '../utils/inflector'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce/active_model/active_model_adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var RestAdapter = $__0.default;
  var ActiveModelSerializer = $__2.default;
  var $__5 = $__4,
      decamelize = $__5.decamelize,
      underscore = $__5.underscore,
      pluralize = $__5.pluralize;
  var ActiveModelAdapter = function ActiveModelAdapter() {
    $traceurRuntime.defaultSuperCall(this, $ActiveModelAdapter.prototype, arguments);
  };
  var $ActiveModelAdapter = ActiveModelAdapter;
  ($traceurRuntime.createClass)(ActiveModelAdapter, {
    setupContainer: function(parent) {
      var container = $traceurRuntime.superCall(this, $ActiveModelAdapter.prototype, "setupContainer", [parent]);
      container.register('serializer:model', ActiveModelSerializer);
      return container;
    },
    pathForType: function(type) {
      var decamelized = decamelize(type);
      var underscored = underscore(decamelized);
      return pluralize(underscored);
    }
  }, {}, RestAdapter);
  var $__default = ActiveModelAdapter;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/active_model/serializers/model", ['../../serializers/model', '../../utils/inflector'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/active_model/serializers/model";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ModelSerializer = $__0.default;
  var singularize = $__2.singularize;
  var ActiveModelSerializer = function ActiveModelSerializer() {
    $traceurRuntime.defaultSuperCall(this, $ActiveModelSerializer.prototype, arguments);
  };
  var $ActiveModelSerializer = ActiveModelSerializer;
  ($traceurRuntime.createClass)(ActiveModelSerializer, {keyForType: function(name, type, opts) {
      var key = $traceurRuntime.superCall(this, $ActiveModelSerializer.prototype, "keyForType", [name, type]);
      if (!opts || !opts.embedded) {
        if (type === 'belongs-to') {
          return key + '_id';
        } else if (type === 'has-many') {
          return singularize(key) + '_ids';
        }
      }
      return key;
    }}, {}, ModelSerializer);
  var $__default = ActiveModelSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/adapter", ['./error', './utils/base_class', './factories/serializer', './session/session', './utils/array_from'], function($__0,$__2,$__4,$__6,$__8) {
  "use strict";
  var __moduleName = "coalesce/adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var Error = $__0.default;
  var BaseClass = $__2.default;
  var SerializerFactory = $__4.default;
  var Session = $__6.default;
  var array_from = $__8.default;
  var Adapter = function Adapter() {
    this.configs = {};
    this.container = this.setupContainer(this.container);
    this.serializerFactory = new SerializerFactory(this.container);
  };
  ($traceurRuntime.createClass)(Adapter, {
    setupContainer: function(container) {
      return container;
    },
    configFor: function(type) {
      var configs = this.configs,
          typeKey = type.typeKey;
      return configs[typeKey] || {};
    },
    newSession: function() {
      return new Session({
        adapter: this,
        idManager: this.idManager,
        container: this.container
      });
    },
    serialize: function(model, opts) {
      return this.serializerFactory.serializerForModel(model).serialize(model, opts);
    },
    deserialize: function(typeKey, data, opts) {
      return this.serializerFor(typeKey).deserialize(data, opts);
    },
    serializerFor: function(typeKey) {
      return this.serializerFactory.serializerFor(typeKey);
    },
    merge: function(model, session) {
      if (!session) {
        session = this.container.lookup('session:main');
      }
      return session.merge(model);
    },
    mergeData: function(data, typeKey, session) {
      if (!typeKey) {
        typeKey = this.defaultSerializer;
      }
      var serializer = this.serializerFor(typeKey),
          deserialized = serializer.deserialize(data);
      if (deserialized.isModel) {
        return this.merge(deserialized, session);
      } else {
        return array_from(deserialized).map(function(model) {
          return this.merge(model, session);
        }, this);
      }
    },
    isDirtyFromRelationships: function(model, cached, relDiff) {
      return relDiff.length > 0;
    },
    shouldSave: function(model) {
      return true;
    },
    reifyClientId: function(model) {
      this.idManager.reifyClientId(model);
    }
  }, {}, BaseClass);
  var $__default = Adapter;
  function mustImplement(name) {
    return function() {
      throw new Error("Your adapter " + this.toString() + " does not implement the required method " + name);
    };
  }
  Adapter.reopen({
    mergeError: Adapter.mergeData,
    willMergeModel: function() {},
    didMergeModel: function() {},
    load: mustImplement("load"),
    query: mustImplement("find"),
    refresh: mustImplement("refresh"),
    flush: mustImplement("flush"),
    remoteCall: mustImplement("remoteCall")
  });
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/collections/has_many_array", ['../collections/model_array'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/collections/has_many_array";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var ModelArray = $__0.default;
  var HasManyArray = function HasManyArray() {
    $traceurRuntime.defaultSuperCall(this, $HasManyArray.prototype, arguments);
  };
  var $HasManyArray = HasManyArray;
  ($traceurRuntime.createClass)(HasManyArray, {
    get session() {
      return this.owner && this.owner.session;
    },
    replace: function(idx, amt, objects) {
      if (this.session) {
        objects = objects.map(function(model) {
          return this.session.add(model);
        }, this);
      }
      $traceurRuntime.superCall(this, $HasManyArray.prototype, "replace", [idx, amt, objects]);
    },
    arrayContentWillChange: function(index, removed, added) {
      var model = this.owner,
          name = this.name,
          session = this.session;
      if (session) {
        session.modelWillBecomeDirty(model);
        if (!model._suspendedRelationships) {
          for (var i = index; i < index + removed; i++) {
            var inverseModel = this.objectAt(i);
            session.inverseManager.unregisterRelationship(model, name, inverseModel);
          }
        }
      }
      return $traceurRuntime.superCall(this, $HasManyArray.prototype, "arrayContentWillChange", [index, removed, added]);
    },
    arrayContentDidChange: function(index, removed, added) {
      $traceurRuntime.superCall(this, $HasManyArray.prototype, "arrayContentDidChange", [index, removed, added]);
      var model = this.owner,
          name = this.name,
          session = this.session;
      if (session && !model._suspendedRelationships) {
        for (var i = index; i < index + added; i++) {
          var inverseModel = this.objectAt(i);
          session.inverseManager.registerRelationship(model, name, inverseModel);
        }
      }
    }
  }, {}, ModelArray);
  var $__default = HasManyArray;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/collections/model_array", ['./observable_array', './model_set', '../utils/is_equal', '../namespace'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce/collections/model_array";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var ObservableArray = $__0.default;
  var ModelSet = $__2.default;
  var isEqual = $__4.default;
  var Coalesce = $__6.default;
  var ModelArray = function ModelArray() {
    $traceurRuntime.defaultSuperCall(this, $ModelArray.prototype, arguments);
  };
  var $ModelArray = ModelArray;
  ($traceurRuntime.createClass)(ModelArray, {
    arrayContentWillChange: function(index, removed, added) {
      for (var i = index; i < index + removed; i++) {
        var model = this.objectAt(i);
        var session = this.session;
        if (session) {
          session.collectionManager.unregister(this, model);
        }
      }
      $traceurRuntime.superCall(this, $ModelArray.prototype, "arrayContentWillChange", [index, removed, added]);
    },
    arrayContentDidChange: function(index, removed, added) {
      $traceurRuntime.superCall(this, $ModelArray.prototype, "arrayContentDidChange", [index, removed, added]);
      for (var i = index; i < index + added; i++) {
        var model = this.objectAt(i);
        var session = this.session;
        if (session) {
          session.collectionManager.register(this, model);
        }
      }
    },
    removeObject: function(obj) {
      var loc = this.length || 0;
      while (--loc >= 0) {
        var curObject = this.objectAt(loc);
        if (isEqual(curObject, obj))
          this.removeAt(loc);
      }
      return this;
    },
    contains: function(obj) {
      for (var i = 0; i < this.length; i++) {
        var m = this.objectAt(i);
        if (isEqual(obj, m))
          return true;
      }
      return false;
    },
    copyTo: function(dest) {
      var existing = new ModelSet(dest);
      this.forEach(function(model) {
        if (existing.has(model)) {
          existing.delete(model);
        } else {
          dest.pushObject(model);
        }
      });
      for (var $__9 = existing[Symbol.iterator](),
          $__10; !($__10 = $__9.next()).done; ) {
        var model = $__10.value;
        {
          dest.removeObject(model);
        }
      }
    },
    copy: function() {
      return $traceurRuntime.superCall(this, $ModelArray.prototype, "copy", [true]);
    },
    diff: function(arr) {
      var diff = new this.constructor();
      this.forEach(function(model) {
        if (!arr.contains(model)) {
          diff.push(model);
        }
      }, this);
      arr.forEach(function(model) {
        if (!this.contains(model)) {
          diff.push(model);
        }
      }, this);
      return diff;
    },
    isEqual: function(arr) {
      return this.diff(arr).length === 0;
    },
    load: function() {
      var array = this;
      return Coalesce.Promise.all(this.map(function(model) {
        return model.load();
      })).then(function() {
        return array;
      });
    }
  }, {}, ObservableArray);
  var $__default = ModelArray;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/collections/model_set", ['../utils/array_from', '../utils/base_class'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/collections/model_set";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  function guidFor(model) {
    return model.clientId;
  }
  var array_from = $__0.default;
  var BaseClass = $__2.default;
  var ModelSet = function ModelSet(iterable) {
    this._size = 0;
    if (iterable) {
      this.addObjects(iterable);
    }
  };
  ($traceurRuntime.createClass)(ModelSet, {
    get size() {
      return this._size;
    },
    clear: function() {
      var len = this._size;
      if (len === 0) {
        return this;
      }
      var guid;
      for (var i = 0; i < len; i++) {
        guid = guidFor(this[i]);
        delete this[guid];
        delete this[i];
      }
      this._size = 0;
      return this;
    },
    add: function(obj) {
      var guid = guidFor(obj),
          idx = this[guid],
          len = this._size;
      if (idx >= 0 && idx < len && (this[idx] && this[idx].isEqual(obj))) {
        if (this[idx] !== obj) {
          this[idx] = obj;
        }
        return this;
      }
      len = this._size;
      this[guid] = len;
      this[len] = obj;
      this._size = len + 1;
      return this;
    },
    delete: function(obj) {
      var guid = guidFor(obj),
          idx = this[guid],
          len = this._size,
          isFirst = idx === 0,
          isLast = idx === len - 1,
          last;
      if (idx >= 0 && idx < len && (this[idx] && this[idx].isEqual(obj))) {
        if (idx < len - 1) {
          last = this[len - 1];
          this[idx] = last;
          this[guidFor(last)] = idx;
        }
        delete this[guid];
        delete this[len - 1];
        this._size = len - 1;
        return true;
      }
      return false;
    },
    has: function(obj) {
      return this[guidFor(obj)] >= 0;
    },
    copy: function() {
      var deep = arguments[0] !== (void 0) ? arguments[0] : false;
      var C = this.constructor,
          ret = new C(),
          loc = this._size;
      ret._size = loc;
      while (--loc >= 0) {
        ret[loc] = deep ? this[loc].copy() : this[loc];
        ret[guidFor(this[loc])] = loc;
      }
      return ret;
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this._size; i++) {
        callbackFn.call(thisArg, this[i], this[i], this);
      }
    },
    toString: function() {
      var len = this.size,
          idx,
          array = [];
      for (idx = 0; idx < len; idx++) {
        array[idx] = this[idx];
      }
      return ("ModelSet<" + array.join(',') + ">");
    },
    get: function(model) {
      var idx = this[guidFor(model)];
      if (idx === undefined)
        return;
      return this[idx];
    },
    getForClientId: function(clientId) {
      var idx = this[clientId];
      if (idx === undefined)
        return;
      return this[idx];
    },
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var i;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 7;
              break;
            case 7:
              $ctx.state = (i < this._size) ? 1 : -2;
              break;
            case 4:
              i++;
              $ctx.state = 7;
              break;
            case 1:
              $ctx.state = 2;
              return this[i];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    }),
    addData: function(model) {
      var existing = this.getModel(model);
      var dest;
      if (existing) {
        dest = existing.copy();
        model.copyTo(dest);
      } else {
        dest = model.copy();
      }
      this.add(dest);
      return dest;
    },
    addObjects: function(iterable) {
      if (typeof iterable.forEach === 'function') {
        iterable.forEach(function(item) {
          this.add(item);
        }, this);
      } else {
        for (var $__5 = iterable[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var item = $__6.value;
          {
            this.add(item);
          }
        }
      }
      return this;
    },
    removeObjects: function(iterable) {
      if (typeof iterable.forEach === 'function') {
        iterable.forEach(function(item) {
          this.delete(item);
        }, this);
      } else {
        for (var $__5 = iterable[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var item = $__6.value;
          {
            this.delete(item);
          }
        }
      }
      return this;
    },
    toArray: function() {
      return array_from(this);
    }
  }, {}, BaseClass);
  var $__default = ModelSet;
  var aliases = {
    'remove': 'delete',
    'contains': 'has',
    'addObject': 'add',
    'removeObject': 'delete',
    'getModel': 'get'
  };
  for (var alias in aliases) {
    if (!aliases.hasOwnProperty(alias))
      continue;
    var target = aliases[alias];
    ModelSet.prototype[alias] = ModelSet.prototype[target];
  }
  Object.defineProperty(ModelSet.prototype, Symbol.iterator, {
    value: ModelSet.prototype.values,
    configurable: true,
    writable: true
  });
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/collections/observable_array", ['../error', '../utils/copy', '../utils/array_from'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce/collections/observable_array";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Error = $__0.default;
  var copy = $__2.default;
  var array_from = $__4.default;
  var EMPTY = [],
      splice = Array.prototype.splice;
  var ObservableArray = function ObservableArray() {
    $traceurRuntime.defaultSuperCall(this, $ObservableArray.prototype, arguments);
  };
  var $ObservableArray = ObservableArray;
  ($traceurRuntime.createClass)(ObservableArray, {
    clear: function() {
      var len = this.length;
      if (len === 0)
        return this;
      this.replace(0, len, EMPTY);
      return this;
    },
    insertAt: function(idx, object) {
      if (idx > this.length)
        throw new Error("Index out of range");
      this.replace(idx, 0, [object]);
      return this;
    },
    removeAt: function(start, len) {
      if ('number' === typeof start) {
        if ((start < 0) || (start >= this.length)) {
          throw new Error("Index out of range");
        }
        if (len === undefined)
          len = 1;
        this.replace(start, len, EMPTY);
      }
      return this;
    },
    pushObject: function(obj) {
      this.insertAt(this.length, obj);
      return obj;
    },
    pushObjects: function(objects) {
      this.replace(this.length, 0, objects);
      return this;
    },
    popObject: function() {
      var len = this.length;
      if (len === 0)
        return null;
      var ret = this.objectAt(len - 1);
      this.removeAt(len - 1, 1);
      return ret;
    },
    shiftObject: function() {
      if (this.length === 0)
        return null;
      var ret = this.objectAt(0);
      this.removeAt(0);
      return ret;
    },
    unshiftObject: function(obj) {
      this.insertAt(0, obj);
      return obj;
    },
    unshiftObjects: function(objects) {
      this.replace(0, 0, objects);
      return this;
    },
    reverseObjects: function() {
      var len = this.length;
      if (len === 0)
        return this;
      var objects = this.toArray().reverse();
      this.replace(0, len, objects);
      return this;
    },
    toArray: function() {
      return array_from(this);
    },
    setObjects: function(objects) {
      if (objects.length === 0)
        return this.clear();
      var len = this.length;
      this.replace(0, len, objects);
      return this;
    },
    removeObject: function(obj) {
      var loc = this.length || 0;
      while (--loc >= 0) {
        var curObject = this.objectAt(loc);
        if (curObject === obj)
          this.removeAt(loc);
      }
      return this;
    },
    addObject: function(obj) {
      if (!this.contains(obj))
        this.pushObject(obj);
      return this;
    },
    objectAt: function(idx) {
      return this[idx];
    },
    addObjects: function(objects) {
      for (var i = objects.length - 1; i >= 0; i--) {
        this.addObject(objects[i]);
      }
      return this;
    },
    removeObjects: function(objects) {
      for (var i = objects.length - 1; i >= 0; i--) {
        this.removeObject(objects[i]);
      }
      return this;
    },
    replace: function(idx, amt, objects) {
      var len = objects ? objects.length : 0;
      this.arrayContentWillChange(idx, amt, len);
      if (len === 0) {
        this.splice(idx, amt);
      } else {
        replace(this, idx, amt, objects);
      }
      this.arrayContentDidChange(idx, amt, len);
      return this;
    },
    indexOf: function(object, startAt) {
      var idx,
          len = this.length;
      if (startAt === undefined)
        startAt = 0;
      else
        startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0)
        startAt += len;
      for (idx = startAt; idx < len; idx++) {
        if (this[idx] === object)
          return idx;
      }
      return -1;
    },
    lastIndexOf: function(object, startAt) {
      var idx,
          len = this.length;
      if (startAt === undefined)
        startAt = len - 1;
      else
        startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0)
        startAt += len;
      for (idx = startAt; idx >= 0; idx--) {
        if (this[idx] === object)
          return idx;
      }
      return -1;
    },
    copy: function(deep) {
      var arr;
      if (deep) {
        arr = this.map(function(item) {
          return copy(item, true);
        });
      } else {
        arr = this.slice();
      }
      var res = new this.constructor();
      res.addObjects(arr);
      return res;
    },
    get firstObject() {
      return this.objectAt(0);
    },
    get lastObject() {
      return this.objectAt(this.length - 1);
    },
    contains: function(obj) {
      return this.indexOf(obj) >= 0;
    },
    arrayContentWillChange: function(index, removed, added) {},
    arrayContentDidChange: function(index, removed, added) {}
  }, {}, Array);
  var $__default = ObservableArray;
  function replace(array, idx, amt, objects) {
    var args = [].concat(objects),
        chunk,
        ret = [],
        size = 60000,
        start = idx,
        ends = amt,
        count;
    while (args.length) {
      count = ends > size ? size : ends;
      if (count <= 0) {
        count = 0;
      }
      chunk = args.splice(0, size);
      chunk = [start, count].concat(chunk);
      start += size;
      ends -= count;
      ret = ret.concat(splice.apply(array, chunk));
    }
    return ret;
  }
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/container", ['./container/container', './session/session', './id_manager', './serializers/belongs_to', './serializers/boolean', './serializers/date', './serializers/has_many', './serializers/id', './serializers/number', './serializers/model', './serializers/revision', './serializers/string', './merge/per_field', './session/model_cache', './session/query_cache', './rest/rest_adapter', './model/errors'], function($__0,$__2,$__4,$__6,$__8,$__10,$__12,$__14,$__16,$__18,$__20,$__22,$__24,$__26,$__28,$__30,$__32) {
  "use strict";
  var __moduleName = "coalesce/container";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  if (!$__16 || !$__16.__esModule)
    $__16 = {default: $__16};
  if (!$__18 || !$__18.__esModule)
    $__18 = {default: $__18};
  if (!$__20 || !$__20.__esModule)
    $__20 = {default: $__20};
  if (!$__22 || !$__22.__esModule)
    $__22 = {default: $__22};
  if (!$__24 || !$__24.__esModule)
    $__24 = {default: $__24};
  if (!$__26 || !$__26.__esModule)
    $__26 = {default: $__26};
  if (!$__28 || !$__28.__esModule)
    $__28 = {default: $__28};
  if (!$__30 || !$__30.__esModule)
    $__30 = {default: $__30};
  if (!$__32 || !$__32.__esModule)
    $__32 = {default: $__32};
  var Container = $__0.default;
  var Session = $__2.default;
  var IdManager = $__4.default;
  var BelongsToSerializer = $__6.default;
  var BooleanSerializer = $__8.default;
  var DateSerializer = $__10.default;
  var HasManySerializer = $__12.default;
  var IdSerializer = $__14.default;
  var NumberSerializer = $__16.default;
  var ModelSerializer = $__18.default;
  var RevisionSerializer = $__20.default;
  var StringSerializer = $__22.default;
  var PerField = $__24.default;
  var ModelCache = $__26.default;
  var QueryCache = $__28.default;
  var RestAdapter = $__30.default;
  var Errors = $__32.default;
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
    container.register('session:base', Session);
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
  function CoalesceContainer() {
    Container.apply(this, arguments);
    setupContainer(this);
  }
  CoalesceContainer.prototype = Object.create(Container.prototype);
  ;
  var $__default = CoalesceContainer;
  return {
    get setupContainer() {
      return setupContainer;
    },
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/container/container", ['./inheriting_dict'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/container/container";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var InheritingDict = $__0.default;
  function Container(parent) {
    this.parent = parent;
    this.children = [];
    this.resolver = parent && parent.resolver || function() {};
    this.registry = new InheritingDict(parent && parent.registry);
    this.cache = new InheritingDict(parent && parent.cache);
    this.factoryCache = new InheritingDict(parent && parent.factoryCache);
    this.resolveCache = new InheritingDict(parent && parent.resolveCache);
    this.typeInjections = new InheritingDict(parent && parent.typeInjections);
    this.injections = {};
    this.factoryTypeInjections = new InheritingDict(parent && parent.factoryTypeInjections);
    this.factoryInjections = {};
    this._options = new InheritingDict(parent && parent._options);
    this._typeOptions = new InheritingDict(parent && parent._typeOptions);
  }
  Container.prototype = {
    parent: null,
    children: null,
    resolver: null,
    registry: null,
    cache: null,
    typeInjections: null,
    injections: null,
    _options: null,
    _typeOptions: null,
    child: function() {
      var container = new Container(this);
      this.children.push(container);
      return container;
    },
    set: function(object, key, value) {
      object[key] = value;
    },
    register: function(fullName, factory, options) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      if (factory === undefined) {
        throw new TypeError('Attempting to register an unknown factory: `' + fullName + '`');
      }
      var normalizedName = this.normalize(fullName);
      if (this.cache.has(normalizedName)) {
        throw new Error('Cannot re-register: `' + fullName + '`, as it has already been looked up.');
      }
      this.registry.set(normalizedName, factory);
      this._options.set(normalizedName, options || {});
    },
    unregister: function(fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      var normalizedName = this.normalize(fullName);
      this.registry.remove(normalizedName);
      this.cache.remove(normalizedName);
      this.factoryCache.remove(normalizedName);
      this.resolveCache.remove(normalizedName);
      this._options.remove(normalizedName);
    },
    resolve: function(fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return resolve(this, this.normalize(fullName));
    },
    describe: function(fullName) {
      return fullName;
    },
    normalize: function(fullName) {
      return fullName;
    },
    makeToString: function(factory, fullName) {
      return factory.toString();
    },
    lookup: function(fullName, options) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return lookup(this, this.normalize(fullName), options);
    },
    lookupFactory: function(fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return factoryFor(this, this.normalize(fullName));
    },
    has: function(fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return has(this, this.normalize(fullName));
    },
    optionsForType: function(type, options) {
      if (this.parent) {
        illegalChildOperation('optionsForType');
      }
      this._typeOptions.set(type, options);
    },
    options: function(type, options) {
      this.optionsForType(type, options);
    },
    typeInjection: function(type, property, fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      if (this.parent) {
        illegalChildOperation('typeInjection');
      }
      var fullNameType = fullName.split(':')[0];
      if (fullNameType === type) {
        throw new Error('Cannot inject a `' + fullName + '` on other ' + type + '(s). Register the `' + fullName + '` as a different type and perform the typeInjection.');
      }
      addTypeInjection(this.typeInjections, type, property, fullName);
    },
    injection: function(fullName, property, injectionName) {
      if (this.parent) {
        illegalChildOperation('injection');
      }
      validateFullName(injectionName);
      var normalizedInjectionName = this.normalize(injectionName);
      if (fullName.indexOf(':') === -1) {
        return this.typeInjection(fullName, property, normalizedInjectionName);
      }
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      var normalizedName = this.normalize(fullName);
      if (this.cache.has(normalizedName)) {
        throw new Error("Attempted to register an injection for a type that has already been looked up. ('" + normalizedName + "', '" + property + "', '" + injectionName + "')");
      }
      addInjection(this.injections, normalizedName, property, normalizedInjectionName);
    },
    factoryTypeInjection: function(type, property, fullName) {
      if (this.parent) {
        illegalChildOperation('factoryTypeInjection');
      }
      addTypeInjection(this.factoryTypeInjections, type, property, this.normalize(fullName));
    },
    factoryInjection: function(fullName, property, injectionName) {
      if (this.parent) {
        illegalChildOperation('injection');
      }
      var normalizedName = this.normalize(fullName);
      var normalizedInjectionName = this.normalize(injectionName);
      validateFullName(injectionName);
      if (fullName.indexOf(':') === -1) {
        return this.factoryTypeInjection(normalizedName, property, normalizedInjectionName);
      }
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      if (this.factoryCache.has(normalizedName)) {
        throw new Error('Attempted to register a factoryInjection for a type that has already ' + 'been looked up. (\'' + normalizedName + '\', \'' + property + '\', \'' + injectionName + '\')');
      }
      addInjection(this.factoryInjections, normalizedName, property, normalizedInjectionName);
    },
    destroy: function() {
      for (var i = 0,
          length = this.children.length; i < length; i++) {
        this.children[i].destroy();
      }
      this.children = [];
      eachDestroyable(this, function(item) {
        item.destroy();
      });
      this.parent = undefined;
      this.isDestroyed = true;
    },
    reset: function() {
      for (var i = 0,
          length = this.children.length; i < length; i++) {
        resetCache(this.children[i]);
      }
      resetCache(this);
    }
  };
  function resolve(container, normalizedName) {
    var cached = container.resolveCache.get(normalizedName);
    if (cached) {
      return cached;
    }
    var resolved = container.resolver(normalizedName) || container.registry.get(normalizedName);
    container.resolveCache.set(normalizedName, resolved);
    return resolved;
  }
  function has(container, fullName) {
    if (container.cache.has(fullName)) {
      return true;
    }
    return !!container.resolve(fullName);
  }
  function lookup(container, fullName, options) {
    options = options || {};
    if (container.cache.has(fullName) && options.singleton !== false) {
      return container.cache.get(fullName);
    }
    var value = instantiate(container, fullName);
    if (value === undefined) {
      return;
    }
    if (isSingleton(container, fullName) && options.singleton !== false) {
      container.cache.set(fullName, value);
    }
    return value;
  }
  function illegalChildOperation(operation) {
    throw new Error(operation + ' is not currently supported on child containers');
  }
  function isSingleton(container, fullName) {
    var singleton = option(container, fullName, 'singleton');
    return singleton !== false;
  }
  function buildInjections(container, injections) {
    var hash = {};
    if (!injections) {
      return hash;
    }
    var injection,
        injectable;
    for (var i = 0,
        length = injections.length; i < length; i++) {
      injection = injections[i];
      injectable = lookup(container, injection.fullName);
      if (injectable !== undefined) {
        hash[injection.property] = injectable;
      } else {
        throw new Error('Attempting to inject an unknown injection: `' + injection.fullName + '`');
      }
    }
    return hash;
  }
  function option(container, fullName, optionName) {
    var options = container._options.get(fullName);
    if (options && options[optionName] !== undefined) {
      return options[optionName];
    }
    var type = fullName.split(':')[0];
    options = container._typeOptions.get(type);
    if (options) {
      return options[optionName];
    }
  }
  function factoryFor(container, fullName) {
    var cache = container.factoryCache;
    if (cache.has(fullName)) {
      return cache.get(fullName);
    }
    var factory = container.resolve(fullName);
    if (factory === undefined) {
      return;
    }
    var type = fullName.split(':')[0];
    if (!factory || typeof factory.extend !== 'function') {
      return factory;
    } else {
      var injections = injectionsFor(container, fullName);
      var factoryInjections = factoryInjectionsFor(container, fullName);
      factoryInjections._toString = container.makeToString(factory, fullName);
      var injectedFactory = factory.extend(injections);
      injectedFactory.reopenClass(factoryInjections);
      cache.set(fullName, injectedFactory);
      return injectedFactory;
    }
  }
  function injectionsFor(container, fullName) {
    var splitName = fullName.split(':'),
        type = splitName[0],
        injections = [];
    injections = injections.concat(container.typeInjections.get(type) || []);
    injections = injections.concat(container.injections[fullName] || []);
    injections = buildInjections(container, injections);
    injections._debugContainerKey = fullName;
    injections.container = container;
    return injections;
  }
  function factoryInjectionsFor(container, fullName) {
    var splitName = fullName.split(':'),
        type = splitName[0],
        factoryInjections = [];
    factoryInjections = factoryInjections.concat(container.factoryTypeInjections.get(type) || []);
    factoryInjections = factoryInjections.concat(container.factoryInjections[fullName] || []);
    factoryInjections = buildInjections(container, factoryInjections);
    factoryInjections._debugContainerKey = fullName;
    return factoryInjections;
  }
  function instantiate(container, fullName) {
    var factory = factoryFor(container, fullName);
    if (option(container, fullName, 'instantiate') === false) {
      return factory;
    }
    if (factory) {
      if (typeof factory.create !== 'function') {
        throw new Error('Failed to create an instance of \'' + fullName + '\'. ' + 'Most likely an improperly defined class or an invalid module export.');
      }
      if (typeof factory.extend === 'function') {
        return factory.create();
      } else {
        return factory.create(injectionsFor(container, fullName));
      }
    }
  }
  function eachDestroyable(container, callback) {
    container.cache.eachLocal(function(key, value) {
      if (option(container, key, 'instantiate') === false) {
        return;
      }
      callback(value);
    });
  }
  function resetCache(container) {
    container.cache.eachLocal(function(key, value) {
      if (option(container, key, 'instantiate') === false) {
        return;
      }
      value.destroy();
    });
    container.cache.dict = {};
  }
  function addTypeInjection(rules, type, property, fullName) {
    var injections = rules.get(type);
    if (!injections) {
      injections = [];
      rules.set(type, injections);
    }
    injections.push({
      property: property,
      fullName: fullName
    });
  }
  var VALID_FULL_NAME_REGEXP = /^[^:]+.+:[^:]+$/;
  function validateFullName(fullName) {
    if (!VALID_FULL_NAME_REGEXP.test(fullName)) {
      throw new TypeError('Invalid Fullname, expected: `type:name` got: ' + fullName);
    }
    return true;
  }
  function addInjection(rules, factoryName, property, injectionName) {
    var injections = rules[factoryName] = rules[factoryName] || [];
    injections.push({
      property: property,
      fullName: injectionName
    });
  }
  var $__default = Container;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/container/inheriting_dict", [], function() {
  "use strict";
  var __moduleName = "coalesce/container/inheriting_dict";
  function InheritingDict(parent) {
    this.parent = parent;
    this.dict = {};
  }
  InheritingDict.prototype = {
    parent: null,
    dict: null,
    get: function(key) {
      var dict = this.dict;
      if (dict.hasOwnProperty(key)) {
        return dict[key];
      }
      if (this.parent) {
        return this.parent.get(key);
      }
    },
    set: function(key, value) {
      this.dict[key] = value;
    },
    remove: function(key) {
      delete this.dict[key];
    },
    has: function(key) {
      var dict = this.dict;
      if (dict.hasOwnProperty(key)) {
        return true;
      }
      if (this.parent) {
        return this.parent.has(key);
      }
      return false;
    },
    eachLocal: function(callback, binding) {
      var dict = this.dict;
      for (var prop in dict) {
        if (dict.hasOwnProperty(prop)) {
          callback.call(binding, prop, dict[prop]);
        }
      }
    }
  };
  var $__default = InheritingDict;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/error", [], function() {
  "use strict";
  var __moduleName = "coalesce/error";
  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];
  function CsError() {
    var tmp = Error.apply(this, arguments);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CsError);
    }
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }
  }
  CsError.prototype = Object.create(Error.prototype);
  var $__default = CsError;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/factories/merge", [], function() {
  "use strict";
  var __moduleName = "coalesce/factories/merge";
  var MergeFactory = function MergeFactory(container) {
    this.container = container;
  };
  ($traceurRuntime.createClass)(MergeFactory, {mergeFor: function(typeKey) {
      console.assert(typeof typeKey === 'string', 'Passed in typeKey must be a string');
      var mergeStrategy = this.container.lookup('merge-strategy:' + typeKey);
      if (!mergeStrategy) {
        var Strategy = this.container.lookupFactory('merge-strategy:default');
        this.container.register('merge-strategy:' + typeKey, Strategy);
        mergeStrategy = this.container.lookup('merge-strategy:' + typeKey);
      }
      mergeStrategy.typeKey = typeKey;
      return mergeStrategy;
    }}, {});
  var $__default = MergeFactory;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/factories/model_cache", [], function() {
  "use strict";
  var __moduleName = "coalesce/factories/model_cache";
  var ModelCacheFactory = function ModelCacheFactory(container) {
    this.container = container;
  };
  ($traceurRuntime.createClass)(ModelCacheFactory, {modelCacheFor: function(typeKey) {
      console.assert(typeof typeKey === 'string', 'Passed in typeKey must be a string');
      var modelCache = this.container.lookup('model-cache:' + typeKey);
      if (!modelCache) {
        var ModelCache = this.container.lookupFactory('model-cache:default');
        this.container.register('model-cache:' + typeKey, ModelCache);
        modelCache = this.container.lookup('model-cache:' + typeKey);
      }
      modelCache.typeKey = typeKey;
      return modelCache;
    }}, {});
  var $__default = ModelCacheFactory;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/factories/query_cache", [], function() {
  "use strict";
  var __moduleName = "coalesce/factories/query_cache";
  var QueryCacheFactory = function QueryCacheFactory(container) {
    this.container = container;
  };
  ($traceurRuntime.createClass)(QueryCacheFactory, {queryCacheFor: function(typeKey) {
      console.assert(typeof typeKey === 'string', 'Passed in typeKey must be a string');
      var queryCache = this.container.lookup('query-cache:' + typeKey);
      if (!queryCache) {
        var QueryCache = this.container.lookupFactory('query-cache:default');
        this.container.register('query-cache:' + typeKey, QueryCache);
        queryCache = this.container.lookup('query-cache:' + typeKey);
      }
      queryCache.typeKey = typeKey;
      return queryCache;
    }}, {});
  var $__default = QueryCacheFactory;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/factories/serializer", [], function() {
  "use strict";
  var __moduleName = "coalesce/factories/serializer";
  var SerializerFactory = function SerializerFactory(container) {
    this.container = container;
  };
  ($traceurRuntime.createClass)(SerializerFactory, {
    serializerFor: function(typeKey) {
      console.assert(typeof typeKey === 'string', 'Passed in typeKey must be a string');
      var serializer = this.container.lookup('serializer:' + typeKey);
      if (!serializer) {
        var modelExists = !!this.container.lookupFactory('model:' + typeKey);
        if (!modelExists)
          return;
        var Serializer = this.container.lookupFactory('serializer:model');
        this.container.register('serializer:' + typeKey, Serializer);
        serializer = this.container.lookup('serializer:' + typeKey);
      }
      if (!serializer.typeKey) {
        serializer.typeKey = typeKey;
      }
      return serializer;
    },
    serializerForType: function(type) {
      return this.serializerFor(type.typeKey);
    },
    serializerForModel: function(model) {
      var type = model.constructor;
      return this.serializerForType(type);
    }
  }, {});
  var $__default = SerializerFactory;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/factories/type", [], function() {
  "use strict";
  var __moduleName = "coalesce/factories/type";
  var TypeFactory = function TypeFactory(container) {
    this.container = container;
  };
  ($traceurRuntime.createClass)(TypeFactory, {typeFor: function(typeKey) {
      var factory = this.container.lookupFactory('model:' + typeKey);
      console.assert(factory, "No model was found for '" + typeKey + "'");
      factory.session = this;
      factory.typeKey = typeKey;
      return factory;
    }}, {});
  var $__default = TypeFactory;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/id_manager", ['./utils/base_class'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/id_manager";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var BaseClass = $__0.default;
  var uuid = 1;
  var IdManager = function IdManager() {
    this.idMaps = {};
  };
  ($traceurRuntime.createClass)(IdManager, {
    reifyClientId: function(model) {
      var id = model.id,
          clientId = model.clientId,
          typeKey = model.typeKey,
          idMap = this.idMaps[typeKey];
      if (!idMap) {
        idMap = this.idMaps[typeKey] = {};
      }
      if (id) {
        id = id + '';
      }
      if (id && clientId) {
        var existingClientId = idMap[id];
        console.assert(!existingClientId || existingClientId === clientId, "clientId has changed for " + model.toString());
        if (!existingClientId) {
          idMap[id] = clientId;
        }
      } else if (!clientId) {
        if (id) {
          clientId = idMap[id];
        }
        if (!clientId) {
          clientId = this._generateClientId(typeKey);
        }
        model.clientId = clientId;
        idMap[id] = clientId;
      }
      return clientId;
    },
    getClientId: function(typeKey, id) {
      var idMap = this.idMaps[typeKey];
      return idMap && idMap[id + ''];
    },
    _generateClientId: function(typeKey) {
      return typeKey + (uuid++);
    }
  }, {}, BaseClass);
  var $__default = IdManager;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/merge/base", ['../utils/base_class'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/merge/base";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var BaseClass = $__0.default;
  var Base = function Base() {
    $traceurRuntime.defaultSuperCall(this, $Base.prototype, arguments);
  };
  var $Base = Base;
  ($traceurRuntime.createClass)(Base, {merge: function(ours, ancestor, theirs) {}}, {}, BaseClass);
  var $__default = Base;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/merge/per_field", ['./base', '../collections/model_set', '../utils/is_equal', '../utils/copy'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce/merge/per_field";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Base = $__0.default;
  var ModelSet = $__2.default;
  var isEqual = $__4.default;
  var copy = $__6.default;
  var PerField = function PerField() {
    $traceurRuntime.defaultSuperCall(this, $PerField.prototype, arguments);
  };
  var $PerField = PerField;
  ($traceurRuntime.createClass)(PerField, {
    merge: function(ours, ancestor, theirs) {
      this.mergeAttributes(ours, ancestor, theirs);
      this.mergeRelationships(ours, ancestor, theirs);
      return ours;
    },
    mergeAttributes: function(ours, ancestor, theirs) {
      ours.eachAttribute(function(name, meta) {
        this.mergeProperty(ours, ancestor, theirs, name);
      }, this);
    },
    mergeRelationships: function(ours, ancestor, theirs) {
      var session = this.session;
      ours.eachRelationship(function(name, relationship) {
        if (relationship.kind === 'belongsTo') {
          this.mergeBelongsTo(ours, ancestor, theirs, name);
        } else if (relationship.kind === 'hasMany') {
          this.mergeHasMany(ours, ancestor, theirs, name);
        }
      }, this);
    },
    mergeBelongsTo: function(ours, ancestor, theirs, name) {
      this.mergeProperty(ours, ancestor, theirs, name);
    },
    mergeHasMany: function(ours, ancestor, theirs, name) {
      this.mergeProperty(ours, ancestor, theirs, name);
    },
    mergeProperty: function(ours, ancestor, theirs, name) {
      var oursValue = ours[name],
          ancestorValue = ancestor[name],
          theirsValue = theirs[name];
      if (!ours.isFieldLoaded(name)) {
        if (theirs.isFieldLoaded(name)) {
          ours[name] = copy(theirsValue);
        }
        return;
      }
      if (!theirs.isFieldLoaded(name) || isEqual(oursValue, theirsValue)) {
        return;
      }
      if (!ancestor.isFieldLoaded(name) || isEqual(oursValue, ancestorValue)) {
        ours[name] = copy(theirsValue);
      } else {}
    }
  }, {}, Base);
  var $__default = PerField;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/attribute", ['./field', '../utils/is_equal'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/model/attribute";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Field = $__0.default;
  var isEqual = $__2.default;
  var Attribute = function Attribute() {
    $traceurRuntime.defaultSuperCall(this, $Attribute.prototype, arguments);
  };
  var $Attribute = Attribute;
  ($traceurRuntime.createClass)(Attribute, {
    get kind() {
      return 'attribute';
    },
    defineProperty: function(prototype) {
      var name = this.name;
      Object.defineProperty(prototype, name, {
        enumerable: true,
        get: function() {
          return this._attributes[name];
        },
        set: function(value) {
          var oldValue = this._attributes[name];
          if (isEqual(oldValue, value))
            return;
          this.attributeWillChange(name);
          this._attributes[name] = value;
          this.attributeDidChange(name);
          return value;
        }
      });
    }
  }, {}, Field);
  var $__default = Attribute;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/belongs_to", ['./relationship', '../utils/is_equal'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/model/belongs_to";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Relationship = $__0.default;
  var isEqual = $__2.default;
  var BelongsTo = function BelongsTo() {
    $traceurRuntime.defaultSuperCall(this, $BelongsTo.prototype, arguments);
  };
  var $BelongsTo = BelongsTo;
  ($traceurRuntime.createClass)(BelongsTo, {defineProperty: function(prototype) {
      var name = this.name;
      Object.defineProperty(prototype, name, {
        enumerable: true,
        get: function() {
          var value = this._relationships[name],
              session = this.session;
          if (session && value && value.session !== session) {
            value = this._relationships[name] = this.session.add(value);
          }
          return value;
        },
        set: function(value) {
          var oldValue = this._relationships[name];
          if (oldValue === value)
            return;
          this.belongsToWillChange(name);
          var session = this.session;
          if (session) {
            session.modelWillBecomeDirty(this);
            if (value) {
              value = session.add(value);
            }
          }
          this._relationships[name] = value;
          this.belongsToDidChange(name);
          return value;
        }
      });
    }}, {}, Relationship);
  var $__default = BelongsTo;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/diff", ['./model', '../collections/model_set'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/model/diff";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Model = $__0.default;
  var ModelSet = $__2.default;
  Model.reopen({diff: function(model) {
      var diffs = [];
      this.eachLoadedAttribute(function(name, meta) {
        var left = this[name];
        var right = model[name];
        if (left && typeof left.diff === 'function' && right && typeof right.diff === 'function') {
          if (left.diff(right).length > 0) {
            diffs.push({
              type: 'attr',
              name: name
            });
          }
          return;
        }
        if (left && right && typeof left === 'object' && typeof right === 'object') {
          if (JSON.stringify(left) !== JSON.stringify(right)) {
            diffs.push({
              type: 'attr',
              name: name
            });
          }
          return;
        }
        if (left instanceof Date && right instanceof Date) {
          left = left.getTime();
          right = right.getTime();
        }
        if (left !== right) {
          diffs.push({
            type: 'attr',
            name: name
          });
        }
      }, this);
      this.eachLoadedRelationship(function(name, relationship) {
        var left = this[name];
        var right = model[name];
        if (relationship.kind === 'belongsTo') {
          if (left && right) {
            if (!left.isEqual(right)) {
              diffs.push({
                type: 'belongsTo',
                name: name,
                relationship: relationship,
                oldValue: right
              });
            }
          } else if (left || right) {
            diffs.push({
              type: 'belongsTo',
              name: name,
              relationship: relationship,
              oldValue: right
            });
          }
        } else if (relationship.kind === 'hasMany') {
          var dirty = false;
          var cache = new ModelSet();
          left.forEach(function(model) {
            cache.add(model);
          });
          right.forEach(function(model) {
            if (dirty)
              return;
            if (!cache.contains(model)) {
              dirty = true;
            } else {
              cache.remove(model);
            }
          });
          if (dirty || cache.length > 0) {
            diffs.push({
              type: 'hasMany',
              name: name,
              relationship: relationship
            });
          }
        }
      }, this);
      return diffs;
    }});
  return {};
});

define("coalesce/model/errors", ['../utils/base_class'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/model/errors";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var BaseClass = $__0.default;
  var Errors = function Errors() {
    var obj = arguments[0] !== (void 0) ? arguments[0] : {};
    $traceurRuntime.superCall(this, $Errors.prototype, "constructor", []);
    for (var key in obj) {
      if (!obj.hasOwnProperty(key))
        continue;
      this[key] = obj[key];
    }
  };
  var $Errors = Errors;
  ($traceurRuntime.createClass)(Errors, {
    set: function(name, value) {
      this[name] = value;
    },
    forEach: function(callback, binding) {
      for (var key in this) {
        if (!this.hasOwnProperty(key))
          continue;
        callback.call(binding, this[key], key);
      }
    },
    copy: function() {
      return new this.constructor(this);
    }
  }, {}, BaseClass);
  var $__default = Errors;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/field", [], function() {
  "use strict";
  var __moduleName = "coalesce/model/field";
  var Field = function Field(name, options) {
    this.name = name;
    for (var key in options) {
      if (!options.hasOwnProperty(key))
        continue;
      this[key] = options[key];
    }
  };
  ($traceurRuntime.createClass)(Field, {}, {});
  var $__default = Field;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/has_many", ['../namespace', './relationship', '../collections/has_many_array', '../utils/is_equal', '../utils/copy'], function($__0,$__2,$__4,$__6,$__8) {
  "use strict";
  var __moduleName = "coalesce/model/has_many";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var Coalesce = $__0.default;
  var Relationship = $__2.default;
  var HasManyArray = $__4.default;
  var isEqual = $__6.default;
  var copy = $__8.default;
  var defaults = _.defaults;
  var HasMany = function HasMany(name, options) {
    defaults(options, {collectionType: HasManyArray});
    $traceurRuntime.superCall(this, $HasMany.prototype, "constructor", [name, options]);
  };
  var $HasMany = HasMany;
  ($traceurRuntime.createClass)(HasMany, {defineProperty: function(prototype) {
      var name = this.name;
      var field = this;
      Object.defineProperty(prototype, name, {
        enumerable: true,
        get: function() {
          var value = this._relationships[name];
          if (this.isNew && !value) {
            var content = value;
            value = this._relationships[name] = new field.collectionType();
            value.owner = this;
            value.name = name;
            if (content) {
              value.addObjects(content);
            }
          }
          return value;
        },
        set: function(value) {
          var oldValue = this._relationships[name];
          if (oldValue === value)
            return;
          if (value && value instanceof field.collectionType) {
            value = copy(value);
          }
          if (oldValue && oldValue instanceof field.collectionType) {
            oldValue.clear();
            if (value) {
              oldValue.addObjects(value);
            }
          } else {
            this.hasManyWillChange(name);
            var content = value;
            value = this._relationships[name] = new field.collectionType();
            value.owner = this;
            value.name = name;
            if (content) {
              value.addObjects(content);
            }
            this.hasManyDidChange(name);
          }
          return value;
        }
      });
    }}, {}, Relationship);
  var $__default = HasMany;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/model", ['../namespace', '../utils/base_class', '../collections/model_set', '../utils/copy', '../utils/lazy_copy', '../utils/is_equal', './attribute', './belongs_to', './has_many', '../error', './field', '../utils/inflector'], function($__0,$__2,$__4,$__6,$__8,$__10,$__12,$__14,$__16,$__18,$__20,$__22) {
  "use strict";
  var __moduleName = "coalesce/model/model";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  if (!$__16 || !$__16.__esModule)
    $__16 = {default: $__16};
  if (!$__18 || !$__18.__esModule)
    $__18 = {default: $__18};
  if (!$__20 || !$__20.__esModule)
    $__20 = {default: $__20};
  if (!$__22 || !$__22.__esModule)
    $__22 = {default: $__22};
  var Coalesce = $__0.default;
  var BaseClass = $__2.default;
  var ModelSet = $__4.default;
  var copy = $__6.default;
  var lazyCopy = $__8.default;
  var isEqual = $__10.default;
  var Attribute = $__12.default;
  var BelongsTo = $__14.default;
  var HasMany = $__16.default;
  var Error = $__18.default;
  var Field = $__20.default;
  var $__23 = $__22,
      camelize = $__23.camelize,
      pluralize = $__23.pluralize,
      underscore = $__23.underscore,
      classify = $__23.classify;
  var Model = function Model(fields) {
    this._meta = {
      id: null,
      clientId: null,
      rev: null,
      clientRev: 0,
      isDeleted: false,
      errors: null
    };
    this._attributes = {};
    this._relationships = {};
    this._suspendedRelationships = false;
    this._session = null;
    for (var name in fields) {
      if (!fields.hasOwnProperty(name))
        continue;
      this[name] = fields[name];
    }
  };
  var $Model = Model;
  ($traceurRuntime.createClass)(Model, {
    get id() {
      return getMeta.call(this, 'id');
    },
    set id(value) {
      return setMeta.call(this, 'id', value);
    },
    get clientId() {
      return getMeta.call(this, 'clientId');
    },
    set clientId(value) {
      return setMeta.call(this, 'clientId', value);
    },
    get rev() {
      return getMeta.call(this, 'rev');
    },
    set rev(value) {
      return setMeta.call(this, 'rev', value);
    },
    get clientRev() {
      return getMeta.call(this, 'clientRev');
    },
    set clientRev(value) {
      return setMeta.call(this, 'clientRev', value);
    },
    get isDeleted() {
      return getMeta.call(this, 'isDeleted');
    },
    set isDeleted(value) {
      return setMeta.call(this, 'isDeleted', value);
    },
    get errors() {
      return getMeta.call(this, 'errors');
    },
    set errors(value) {
      return setMeta.call(this, 'errors', value);
    },
    get isModel() {
      return true;
    },
    get session() {
      return this._session;
    },
    set session(value) {
      console.assert(!this._session || this._session === value, "Cannot re-assign a model's session");
      this._session = value;
    },
    isEqual: function(model) {
      if (!model)
        return false;
      var clientId = this.clientId;
      var otherClientId = model.clientId;
      if (clientId && otherClientId) {
        return clientId === otherClientId;
      }
      var id = this.id;
      var otherId = model.id;
      return this instanceof model.constructor && id === otherId;
    },
    get typeKey() {
      return this.constructor.typeKey;
    },
    toString: function() {
      var sessionString = this.session ? this.session.toString() : "(detached)";
      return this.constructor.toString() + "<" + (this.id || '(no id)') + ", " + this.clientId + ", " + sessionString + ">";
    },
    toJSON: function() {
      var res = {};
      _.merge(res, this._meta);
      _.merge(res, this._attributes);
      return res;
    },
    get hasErrors() {
      return !!this.errors;
    },
    get isDetached() {
      return !this.session;
    },
    get isManaged() {
      return !!this.session;
    },
    get isNew() {
      return !this.id;
    },
    get isDirty() {
      if (this.session) {
        return this.session.dirtyModels.contains(this);
      } else {
        return false;
      }
    },
    lazyCopy: function() {
      var copy = new this.constructor({
        id: this.id,
        clientId: this.clientId
      });
      return copy;
    },
    copy: function() {
      var dest = new this.constructor();
      this.copyTo(dest);
      return dest;
    },
    copyTo: function(dest) {
      this.copyMeta(dest);
      this.copyAttributes(dest);
      this.copyRelationships(dest);
    },
    copyMeta: function(dest) {
      dest._meta = copy(this._meta);
    },
    copyAttributes: function(dest) {
      this.loadedAttributes.forEach(function(options, name) {
        dest._attributes[name] = copy(this._attributes[name], true);
      }, this);
    },
    copyRelationships: function(dest) {
      this.eachLoadedRelationship(function(name, relationship) {
        dest[name] = this[name];
      }, this);
    },
    willWatchProperty: function(key) {
      if (this.isManaged && this.shouldTriggerLoad(key)) {
        Coalesce.run.scheduleOnce('actions', this, this.load);
      }
    },
    shouldTriggerLoad: function(key) {
      return this.isField(key) && !this.isFieldLoaded(key);
    },
    isField: function(key) {
      return !!this.fields.get(key);
    },
    isFieldLoaded: function(key) {
      return this.isNew || typeof this[key] !== 'undefined';
    },
    get isPartiallyLoaded() {
      var res = false;
      this.fields.forEach(function(options, name) {
        res = res || this.isFieldLoaded(name);
      }, this);
      return res;
    },
    get isLoaded() {
      var res = true;
      this.fields.forEach(function(options, name) {
        res = res && this.isFieldLoaded(name);
      }, this);
      return res;
    },
    get attributes() {
      return this.constructor.attributes;
    },
    get fields() {
      return this.constructor.fields;
    },
    get loadedAttributes() {
      var res = new Map();
      this.attributes.forEach(function(options, name) {
        if (this.isFieldLoaded(name)) {
          res.set(name, options);
        }
      }, this);
      return res;
    },
    get relationships() {
      return this.constructor.relationships;
    },
    get loadedRelationships() {
      var res = new Map();
      this.relationships.forEach(function(options, name) {
        if (this.isFieldLoaded(name)) {
          res.set(name, options);
        }
      }, this);
      return res;
    },
    metaWillChange: function(name) {},
    metaDidChange: function(name) {},
    attributeWillChange: function(name) {
      var session = this.session;
      if (session) {
        session.modelWillBecomeDirty(this);
      }
    },
    attributeDidChange: function(name) {},
    belongsToWillChange: function(name) {
      if (this._suspendedRelationships) {
        return;
      }
      var inverseModel = this[name],
          session = this.session;
      if (session && inverseModel) {
        session.inverseManager.unregisterRelationship(this, name, inverseModel);
      }
    },
    belongsToDidChange: function(name) {
      if (this._suspendedRelationships) {
        return;
      }
      var inverseModel = this[name],
          session = this.session;
      if (session && inverseModel) {
        session.inverseManager.registerRelationship(this, name, inverseModel);
      }
    },
    hasManyWillChange: function(name) {},
    hasManyDidChange: function(name) {},
    eachAttribute: function(callback, binding) {
      this.attributes.forEach(function(options, name) {
        callback.call(binding, name, options);
      });
    },
    eachLoadedAttribute: function(callback, binding) {
      this.loadedAttributes.forEach(function(options, name) {
        callback.call(binding, name, options);
      });
    },
    eachRelationship: function(callback, binding) {
      this.relationships.forEach(function(options, name) {
        callback.call(binding, name, options);
      });
    },
    eachLoadedRelationship: function(callback, binding) {
      this.loadedRelationships.forEach(function(options, name) {
        callback.call(binding, name, options);
      });
    },
    eachRelatedModel: function(callback, binding, cache) {
      if (!cache)
        cache = new Set();
      if (cache.has(this))
        return;
      cache.add(this);
      callback.call(binding || this, this);
      this.eachLoadedRelationship(function(name, relationship) {
        if (relationship.kind === 'belongsTo') {
          var child = this[name];
          if (!child)
            return;
          this.eachRelatedModel.call(child, callback, binding, cache);
        } else if (relationship.kind === 'hasMany') {
          var children = this[name];
          children.forEach(function(child) {
            this.eachRelatedModel.call(child, callback, binding, cache);
          }, this);
        }
      }, this);
    },
    eachChild: function(callback, binding) {
      this.eachLoadedRelationship(function(name, relationship) {
        if (relationship.kind === 'belongsTo') {
          var child = this[name];
          if (child) {
            callback.call(binding, child);
          }
        } else if (relationship.kind === 'hasMany') {
          var children = this[name];
          children.forEach(function(child) {
            callback.call(binding, child);
          }, this);
        }
      }, this);
    },
    suspendRelationshipObservers: function(callback, binding) {
      if (this._suspendedRelationships) {
        return callback.call(binding || this);
      }
      try {
        this._suspendedRelationships = true;
        callback.call(binding || this);
      } finally {
        this._suspendedRelationships = false;
      }
    }
  }, {
    toString: function() {
      if (this.__toString = this.__toString || this.name || (this.typeKey && classify(this.typeKey))) {
        return this.__toString;
      }
      return "[No Type Key]";
    },
    defineSchema: function(schema) {
      if (typeof schema.typeKey !== 'undefined') {
        this.typeKey = schema.typeKey;
      }
      var attributes = schema.attributes || {};
      for (var name in attributes) {
        if (!attributes.hasOwnProperty(name))
          continue;
        var field = new Attribute(name, attributes[name]);
        this.defineField(field);
      }
      var relationships = schema.relationships || {};
      for (var name in relationships) {
        if (!relationships.hasOwnProperty(name))
          continue;
        var options = relationships[name];
        console.assert(options.kind, "Relationships must have a 'kind' property specified");
        var field;
        if (options.kind === 'belongsTo') {
          field = new BelongsTo(name, options);
        } else if (options.kind === 'hasMany') {
          field = new HasMany(name, options);
        } else {
          console.assert(false, "Unkown relationship kind '" + options.kind + "'. Supported kinds are 'belongsTo' and 'hasMany'");
        }
        this.defineField(field);
      }
    },
    defineField: function(field) {
      field.defineProperty(this.prototype);
      field.parentType = this;
      this.ownFields.set(field.name, field);
      return field;
    },
    get ownFields() {
      if (!this.hasOwnProperty('_ownFields')) {
        this._ownFields = new Map();
      }
      return this._ownFields;
    },
    get fields() {
      if (this.hasOwnProperty('_fields')) {
        return this._fields;
      }
      var res = new Map(),
          parentClass = this.parentType;
      var maps = [this.ownFields];
      if (parentClass.prototype instanceof $Model) {
        var parentFields = parentClass.fields;
        if (parentFields) {
          maps.push(parentClass.fields);
        }
      }
      for (var i = 0; i < maps.length; i++) {
        maps[i].forEach(function(field, name) {
          res.set(name, field);
        });
      }
      return this._fields = res;
    },
    get attributes() {
      if (this.hasOwnProperty('_attributes')) {
        return this._attributes;
      }
      var res = new Map();
      this.fields.forEach(function(options, name) {
        if (options.kind === 'attribute') {
          res.set(name, options);
        }
      });
      return this._attributes = res;
    },
    get relationships() {
      if (this.hasOwnProperty('_relationships')) {
        return this._relationships;
      }
      var res = new Map();
      this.fields.forEach(function(options, name) {
        if (options.kind === 'belongsTo' || options.kind === 'hasMany') {
          reifyRelationshipType(options);
          res.set(name, options);
        }
      });
      return this._relationships = res;
    },
    eachRelationship: function(callback, binding) {
      this.relationships.forEach(function(options, name) {
        callback.call(binding, name, options);
      });
    },
    get parentType() {
      return Object.getPrototypeOf(this);
    },
    inverseFor: function(name) {
      var relationship = this.relationships.get(name);
      if (!relationship) {
        return null;
      }
      var inverseType = relationship.type;
      if (typeof relationship.inverse !== 'undefined') {
        var inverseName = relationship.inverse;
        return inverseName && inverseType.relationships.get(inverseName);
      }
      var possibleRelationships = findPossibleInverses(this, inverseType);
      if (possibleRelationships.length === 0) {
        return null;
      }
      console.assert(possibleRelationships.length === 1, "You defined the '" + name + "' relationship on " + this + " but multiple possible inverse relationships of type " + this + " were found on " + inverseType + ".");
      function findPossibleInverses(type, inverseType, possibleRelationships) {
        possibleRelationships = possibleRelationships || [];
        var relationships = inverseType.relationships;
        var typeKey = type.typeKey;
        var propertyName = camelize(typeKey);
        var inverse = relationships.get(propertyName) || relationships.get(pluralize(propertyName));
        if (inverse) {
          possibleRelationships.push(inverse);
        }
        var parentType = type.parentType;
        if (parentType && parentType.typeKey) {}
        return possibleRelationships;
      }
      return possibleRelationships[0];
    }
  }, BaseClass);
  var $__default = Model;
  function reifyRelationshipType(relationship) {
    if (!relationship.type) {
      relationship.type = Coalesce.__container__.lookupFactory('model:' + relationship.typeKey);
    }
    if (!relationship.type) {
      throw new Error("Could not find a type for '" + relationship.name + "' with typeKey '" + relationship.typeKey + "'");
    }
    if (!relationship.type.typeKey) {
      throw new Error("Relationship '" + relationship.name + "' has no typeKey");
    }
    if (!relationship.typeKey) {
      relationship.typeKey = relationship.type.typeKey;
    }
  }
  function sessionAlias(name) {
    return function() {
      var session = this.session;
      console.assert(session, "Cannot call " + name + " on a detached model");
      var args = [].splice.call(arguments, 0);
      args.unshift(this);
      return session[name].apply(session, args);
    };
  }
  function getMeta(name) {
    return this._meta[name];
  }
  function setMeta(name, value) {
    var oldValue = this._meta[name];
    if (oldValue === value)
      return oldValue;
    this.metaWillChange(name);
    this._meta[name] = value;
    this.metaDidChange(name);
    return value;
  }
  Model.reopen({
    load: sessionAlias('loadModel'),
    refresh: sessionAlias('refresh'),
    deleteModel: sessionAlias('deleteModel'),
    remoteCall: sessionAlias('remoteCall'),
    markClean: sessionAlias('markClean'),
    invalidate: sessionAlias('invalidate'),
    touch: sessionAlias('touch')
  });
  Model.reopenClass({find: function(id) {
      if (!Coalesce.__container__) {
        throw new Error("The Coalesce.__container__ property must be set in order to use static find methods.");
      }
      var container = Coalesce.__container__;
      var session = container.lookup('session:main');
      return session.find(this, id);
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/model/relationship", ['./field'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/model/relationship";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Field = $__0.default;
  var Relationship = function Relationship(name, options) {
    console.assert(options.type || options.typeKey, "Must specify a `type` or `typeKey` option");
    if (typeof options.type === "string") {
      var typeKey = options.type;
      delete options.type;
      options.typeKey = typeKey;
    } else if (!options.typeKey) {
      options.typeKey = options.type.typeKey;
    }
    $traceurRuntime.superCall(this, $Relationship.prototype, "constructor", [name, options]);
  };
  var $Relationship = Relationship;
  ($traceurRuntime.createClass)(Relationship, {}, {}, Field);
  var $__default = Relationship;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/namespace", [], function() {
  "use strict";
  var __moduleName = "coalesce/namespace";
  var ajax = this.jQuery && this.jQuery.ajax;
  var Backburner = this.Backburner;
  if (requireModule && typeof requireModule === 'function') {
    try {
      Backburner = requireModule('backburner').Backburner;
    } catch (e) {}
  }
  var Coalesce = {
    VERSION: '0.4.0+dev.c008febd',
    Promise: Promise,
    ajax: ajax,
    run: Backburner && new Backburner(['actions'])
  };
  var $__default = Coalesce;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
}.bind(Reflect.global));

define("coalesce/rest/embedded_manager", ['../utils/base_class'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/rest/embedded_manager";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var BaseClass = $__0.default;
  var EmbeddedManager = function EmbeddedManager(adapter) {
    this.adapter = adapter;
    this._parentMap = {};
    this._cachedIsEmbedded = new Map();
  };
  ($traceurRuntime.createClass)(EmbeddedManager, {
    updateParents: function(model) {
      var type = model.constructor,
          adapter = this.adapter,
          typeKey = type.typeKey,
          serializer = adapter.serializerFor(typeKey);
      this.eachEmbeddedRecord(model, function(embedded, kind) {
        this.adapter.reifyClientId(embedded);
        this._parentMap[embedded.clientId] = model;
      }, this);
    },
    findParent: function(model) {
      var parent = this._parentMap[model.clientId];
      return parent;
    },
    isEmbedded: function(model) {
      var type = model.constructor,
          result = this._cachedIsEmbedded.get(type);
      if (result !== undefined)
        return result;
      var adapter = this.adapter,
          result = false;
      type.eachRelationship(function(name, relationship) {
        var serializer = adapter.serializerFor(relationship.typeKey),
            inverse = type.inverseFor(relationship.name);
        if (!inverse)
          return;
        var config = serializer.configFor(inverse.name);
        result = result || config.embedded === 'always';
      }, this);
      this._cachedIsEmbedded.set(type, result);
      return result;
    },
    embeddedType: function(type, name) {
      var serializer = this.adapter.serializerFactory.serializerForType(type);
      return serializer.embeddedType(type, name);
    },
    eachEmbeddedRecord: function(model, callback, binding) {
      this.eachEmbeddedBelongsToRecord(model, callback, binding);
      this.eachEmbeddedHasManyRecord(model, callback, binding);
    },
    eachEmbeddedBelongsToRecord: function(model, callback, binding) {
      this.eachEmbeddedBelongsTo(model.constructor, function(name, relationship, embeddedType) {
        if (!model.isFieldLoaded(name)) {
          return;
        }
        var embeddedRecord = model[name];
        if (embeddedRecord) {
          callback.call(binding, embeddedRecord, embeddedType);
        }
      });
    },
    eachEmbeddedHasManyRecord: function(model, callback, binding) {
      this.eachEmbeddedHasMany(model.constructor, function(name, relationship, embeddedType) {
        if (!model.isFieldLoaded(name)) {
          return;
        }
        var collection = model[name];
        collection.forEach(function(model) {
          callback.call(binding, model, embeddedType);
        });
      });
    },
    eachEmbeddedHasMany: function(type, callback, binding) {
      this.eachEmbeddedRelationship(type, 'hasMany', callback, binding);
    },
    eachEmbeddedBelongsTo: function(type, callback, binding) {
      this.eachEmbeddedRelationship(type, 'belongsTo', callback, binding);
    },
    eachEmbeddedRelationship: function(type, kind, callback, binding) {
      type.eachRelationship(function(name, relationship) {
        var embeddedType = this.embeddedType(type, name);
        if (embeddedType) {
          if (relationship.kind === kind) {
            callback.call(binding, name, relationship, embeddedType);
          }
        }
      }, this);
    },
    eachEmbeddedRelative: function(model, callback, binding, visited) {
      if (!visited)
        visited = new Set();
      if (visited.has(model))
        return;
      visited.add(model);
      callback.call(binding, model);
      this.eachEmbeddedRecord(model, function(embeddedRecord, embeddedType) {
        this.eachEmbeddedRelative(embeddedRecord, callback, binding, visited);
      }, this);
      var parent = this.findParent(model);
      if (parent) {
        this.eachEmbeddedRelative(parent, callback, binding, visited);
      }
    }
  }, {}, BaseClass);
  var $__default = EmbeddedManager;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/rest/operation", ['../namespace'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/rest/operation";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Coalesce = $__0.default;
  var Operation = function Operation(model, graph, adapter, session) {
    this.model = model;
    this.graph = graph;
    this.adapter = adapter;
    this.session = session;
    this.force = false;
    this.children = new Set();
    this.parents = new Set();
    var op = this;
    this.promise = new Coalesce.Promise(function(resolve, reject) {
      op.resolve = resolve;
      op.reject = reject;
    });
  };
  ($traceurRuntime.createClass)(Operation, {
    then: function() {
      for (var args = [],
          $__3 = 0; $__3 < arguments.length; $__3++)
        args[$__3] = arguments[$__3];
      var promise = this.promise;
      return promise.then.apply(promise, args);
    },
    get dirtyRelationships() {
      var adapter = this.adapter,
          model = this.model,
          rels = [],
          shadow = this.shadow;
      if (model.isNew) {
        model.eachRelationship(function(name, relationship) {
          if (adapter.isRelationshipOwner(relationship)) {
            rels.push({
              name: name,
              type: relationship.kind,
              relationship: relationship,
              oldValue: null
            });
          }
        }, this);
      } else {
        var diff = model.diff(shadow);
        for (var i = 0; i < diff.length; i++) {
          var d = diff[i];
          if (d.relationship && adapter.isRelationshipOwner(d.relationship)) {
            rels.push(d);
          }
        }
      }
      return rels;
    },
    get isDirty() {
      return !!this.dirtyType;
    },
    get isDirtyFromUpdates() {
      var model = this.model,
          shadow = this.shadow,
          adapter = this.adapter;
      if (!shadow)
        return false;
      var diff = model.diff(shadow);
      var dirty = false;
      var relDiff = [];
      for (var i = 0; i < diff.length; i++) {
        var d = diff[i];
        if (d.type == 'attr') {
          dirty = true;
        } else {
          relDiff.push(d);
        }
      }
      return dirty || adapter.isDirtyFromRelationships(model, shadow, relDiff);
    },
    get dirtyType() {
      var model = this.model;
      if (model.isNew) {
        return "created";
      } else if (model.isDeleted) {
        return "deleted";
      } else if (this.isDirtyFromUpdates || this.force) {
        return "updated";
      }
    },
    perform: function() {
      var adapter = this.adapter,
          session = this.session,
          dirtyType = this.dirtyType,
          model = this.model,
          shadow = this.shadow,
          promise;
      if (!dirtyType || !adapter.shouldSave(model)) {
        if (adapter.isEmbedded(model)) {
          promise = this._promiseFromEmbeddedParent();
        } else {
          promise = Coalesce.Promise.resolve();
        }
      } else if (dirtyType === "created") {
        promise = adapter._contextualizePromise(adapter._create(model), model);
      } else if (dirtyType === "updated") {
        promise = adapter._contextualizePromise(adapter._update(model), model);
      } else if (dirtyType === "deleted") {
        promise = adapter._contextualizePromise(adapter._deleteModel(model), model);
      }
      promise = promise.then(function(serverModel) {
        if (!model.id) {
          model.id = serverModel.id;
        }
        if (!serverModel) {
          serverModel = model;
        } else {
          if (serverModel.meta && Object.keys(serverModel).length == 1) {
            model.meta = serverModel.meta;
            serverModel = model;
          }
          if (!serverModel.clientRev) {
            serverModel.clientRev = model.clientRev;
          }
        }
        return serverModel;
      }, function(serverModel) {
        if (shadow && serverModel === model) {
          shadow.errors = serverModel.errors;
          throw shadow;
        }
        throw serverModel;
      });
      this.resolve(promise);
      return this;
    },
    fail: function() {
      var errors = this.adapter.serializerFactory.serializerFor('errors');
      errors.status = 0;
      this.model.errors = errors;
      return this.model;
    },
    get _embeddedParent() {
      var model = this.model,
          parentModel = this.adapter._embeddedManager.findParent(model),
          graph = this.graph;
      console.assert(parentModel, "Embedded parent does not exist!");
      return graph.getOp(parentModel);
    },
    _promiseFromEmbeddedParent: function() {
      var model = this.model,
          adapter = this.adapter;
      function findInParent(parentModel) {
        var res = null;
        adapter._embeddedManager.eachEmbeddedRecord(parentModel, function(child, embeddedType) {
          if (res)
            return;
          if (child.isEqual(model))
            res = child;
        });
        return res;
      }
      return this._embeddedParent.then(function(parent) {
        return findInParent(parent);
      }, function(parent) {
        throw findInParent(parent);
      });
    },
    addChild: function(child) {
      this.children.add(child);
      child.parents.add(this);
    }
  }, {});
  var $__default = Operation;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/rest/operation_graph", ['./operation', '../namespace', '../utils/array_from'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce/rest/operation_graph";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Operation = $__0.default;
  var Coalesce = $__2.default;
  var array_from = $__4.default;
  var OperationGraph = function OperationGraph(models, shadows, adapter, session) {
    this.models = models;
    this.shadows = shadows;
    this.adapter = adapter;
    this.session = session;
    this.ops = new Map();
    this.build();
  };
  ($traceurRuntime.createClass)(OperationGraph, {
    perform: function() {
      var adapter = this.adapter,
          results = [],
          pending = [];
      function createNestedPromise(op) {
        var promise;
        if (op.parents.size > 0) {
          promise = Coalesce.Promise.all(array_from(op.parents)).then(function() {
            return op.perform();
          });
        } else {
          promise = op.perform();
        }
        promise = promise.then(function(model) {
          results.push(model);
          _.remove(pending, op);
          return model;
        }, function(model) {
          results.push(model);
          _.remove(pending, op);
          throw model;
        });
        if (op.children.size > 0) {
          promise = promise.then(function(model) {
            return Coalesce.Promise.all(array_from(op.children)).then(function(models) {
              adapter.rebuildRelationships(models, model);
              return model;
            }, function(models) {
              throw model;
            });
          });
        }
        return promise;
      }
      var promises = [];
      this.ops.forEach(function(op, model) {
        promises.push(createNestedPromise(op));
        pending.push(op);
      });
      return Coalesce.Promise.all(promises).then(function() {
        return results;
      }, function(err) {
        var failures = pending.map(function(op) {
          return op.fail();
        });
        results = results.concat(failures);
        throw results;
      });
    },
    build: function() {
      var adapter = this.adapter,
          models = this.models,
          shadows = this.shadows,
          ops = this.ops;
      models.forEach(function(model) {
        var shadow = shadows.getModel(model);
        console.assert(shadow || model.isNew, "Shadow does not exist for non-new model");
        var op = this.getOp(model);
        op.shadow = shadow;
        var rels = op.dirtyRelationships;
        for (var i = 0; i < rels.length; i++) {
          var d = rels[i];
          var name = d.name;
          var parentModel = model[name] || d.oldValue && shadows.getModel(d.oldValue);
          var isEmbeddedRel = adapter.embeddedType(model.constructor, name);
          if (parentModel && !isEmbeddedRel) {
            var parentOp = this.getOp(parentModel);
            parentOp.addChild(op);
          }
        }
        var isEmbedded = adapter.isEmbedded(model);
        if (op.isDirty && isEmbedded) {
          var rootModel = adapter.findEmbeddedRoot(model, models);
          var rootOp = this.getOp(rootModel);
          rootOp.force = true;
          var parentModel = adapter._embeddedManager.findParent(model);
          var parentOp = this.getOp(parentModel);
          op.parents.forEach(function(parent) {
            if (parent === rootOp)
              return;
            if (adapter.findEmbeddedRoot(parent.model, models) === rootModel)
              return;
            parent.addChild(rootOp);
          });
          parentOp.addChild(op);
        }
      }, this);
    },
    getOp: function(model) {
      var models = this.models,
          materializedModel = models.getModel(model);
      if (materializedModel)
        model = materializedModel;
      var op = this.ops.get(model);
      if (!op) {
        op = new Operation(model, this, this.adapter, this.session);
        this.ops.set(model, op);
      }
      return op;
    }
  }, {});
  var $__default = OperationGraph;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/rest/payload", ['../collections/model_set', '../utils/array_from'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/rest/payload";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var isArray = Array.isArray;
  var ModelSet = $__0.default;
  var array_from = $__2.default;
  var Payload = function Payload(iterable) {
    $traceurRuntime.superCall(this, $Payload.prototype, "constructor", [iterable]);
    this.isPayload = true;
    this.context = null;
    this.meta = null;
  };
  var $Payload = Payload;
  ($traceurRuntime.createClass)(Payload, {merge: function(session) {
      var merged = array_from(this).map(function(model) {
        return session.merge(model);
      }, this);
      var context = this.context;
      if (context && isArray(context)) {
        context = context.map(function(model) {
          return session.getModel(model);
        });
      } else if (context) {
        context = session.getModel(context);
      }
      var result = new $Payload(merged);
      result.context = context;
      result.meta = this.meta;
      result.errors = this.errors;
      return result;
    }}, {}, ModelSet);
  var $__default = Payload;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/rest/rest_adapter", ['../namespace', '../adapter', './embedded_manager', '../collections/model_set', './operation_graph', './serializers/payload', './serializers/errors', '../factories/serializer', '../utils/materialize_relationships', '../utils/inflector', '../utils/array_from'], function($__0,$__2,$__4,$__6,$__8,$__10,$__12,$__14,$__16,$__18,$__20) {
  "use strict";
  var __moduleName = "coalesce/rest/rest_adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  if (!$__16 || !$__16.__esModule)
    $__16 = {default: $__16};
  if (!$__18 || !$__18.__esModule)
    $__18 = {default: $__18};
  if (!$__20 || !$__20.__esModule)
    $__20 = {default: $__20};
  var Coalesce = $__0.default;
  var Adapter = $__2.default;
  var EmbeddedManager = $__4.default;
  var ModelSet = $__6.default;
  var OperationGraph = $__8.default;
  var PayloadSerializer = $__10.default;
  var RestErrorsSerializer = $__12.default;
  var SerializerFactory = $__14.default;
  var materializeRelationships = $__16.default;
  var $__19 = $__18,
      decamelize = $__19.decamelize,
      pluralize = $__19.pluralize,
      camelize = $__19.camelize;
  var array_from = $__20.default;
  var RestAdapter = function RestAdapter() {
    $traceurRuntime.superCall(this, $RestAdapter.prototype, "constructor", []);
    this._embeddedManager = new EmbeddedManager(this);
    this.serializerFactory = new SerializerFactory(this.container);
    this._pendingOps = {};
  };
  var $RestAdapter = RestAdapter;
  ($traceurRuntime.createClass)(RestAdapter, {
    setupContainer: function(parent) {
      var container = parent;
      container.register('serializer:errors', RestErrorsSerializer);
      container.register('serializer:payload', PayloadSerializer);
      return container;
    },
    load: function(model, opts, session) {
      return this._mergeAndContextualizePromise(this._load(model, opts), session, model, opts);
    },
    _load: function(model, opts) {
      opts = opts || {};
      _.defaults(opts, {type: 'GET'});
      return this._remoteCall(model, null, null, opts);
    },
    update: function(model, opts, session) {
      return this._mergeAndContextualizePromise(this._update(model, opts), session, model, opts);
    },
    _update: function(model, opts) {
      opts = opts || {};
      _.defaults(opts, {type: 'PUT'});
      return this._remoteCall(model, null, model, opts);
    },
    create: function(model, opts, session) {
      return this._mergeAndContextualizePromise(this._create(model, opts), session, model, opts);
    },
    _create: function(model, opts) {
      return this._remoteCall(model, null, model, opts);
    },
    deleteModel: function(model, opts, session) {
      return this._mergeAndContextualizePromise(this._deleteModel(model, opts), session, model, opts);
    },
    _deleteModel: function(model, opts) {
      opts = opts || {};
      _.defaults(opts, {type: 'DELETE'});
      return this._remoteCall(model, null, null, opts);
    },
    query: function(typeKey, query, opts, session) {
      return this._mergeAndContextualizePromise(this._query(typeKey, query, opts), session, typeKey, opts);
    },
    _query: function(typeKey, query, opts) {
      opts = opts || {};
      _.defaults(opts, {
        type: 'GET',
        serialize: false,
        deserializer: 'payload'
      });
      return this._remoteCall(typeKey, null, query, opts);
    },
    remoteCall: function(context, name, data, opts, session) {
      var serialize = data && !!data.isModel;
      opts = opts || {};
      _.defaults(opts, {
        serialize: serialize,
        deserializer: 'payload'
      });
      return this._mergeAndContextualizePromise(this._remoteCall(context, name, data, opts), session, context, opts);
    },
    _remoteCall: function(context, name, data, opts) {
      var adapter = this,
          opts = this._normalizeOptions(opts),
          url;
      if (opts.url) {
        url = opts.url;
      } else {
        url = this.buildUrlFromContext(context, name);
      }
      var method = opts.type || "POST";
      if (opts.serialize !== false) {
        var serializer = opts.serializer,
            serializerOptions = opts.serializerOptions || {};
        if (!serializer && context) {
          serializer = this.serializerForContext(context);
        }
        if (serializer && data) {
          serializer = this.serializerFor(serializer);
          serializerOptions = _.defaults(serializerOptions, {context: context});
          data = serializer.serialize(data, serializerOptions);
        }
      }
      if (opts.params) {
        data = data || {};
        data = _.defaults(data, opts.params);
      }
      return this._deserializePromise(this.ajax(url, method, {data: data}), context, opts);
    },
    _normalizeOptions: function(opts) {
      opts = opts || {};
      if (opts.serializerOptions && typeof opts.serializerOptions.context === 'function') {
        opts.serializerOptions.context = opts.serializerOptions.context.typeKey;
      }
      return opts;
    },
    serializerForContext: function(context) {
      return this.defaultSerializer;
    },
    _deserializePromise: function(promise, context, opts) {
      var serializer = opts.deserializer || opts.serializer,
          serializerOptions = opts.serializerOptions || {};
      if (!serializer && context) {
        serializer = this.serializerForContext(context);
      }
      if (serializer) {
        serializer = this.serializerFor(serializer);
        _.defaults(serializerOptions, {context: context});
      }
      var adapter = this;
      return promise.then(function(data) {
        if (opts.deserialize !== false) {
          return serializer.deserialize(data, serializerOptions);
        }
        return data;
      }, function(xhr) {
        if (opts.deserialize !== false) {
          var data;
          if (xhr.responseText) {
            data = JSON.parse(xhr.responseText);
          } else {
            data = {};
          }
          serializerOptions = _.defaults(serializerOptions, {
            context: context,
            xhr: xhr
          });
          if (xhr.status === 422) {
            throw serializer.deserialize(data, serializerOptions);
          } else {
            serializer = adapter.serializerFor(opts.errorSerializer || 'errors');
            var errors = serializer.deserialize(data, serializerOptions);
            if (context && context.isModel) {
              var model = context.lazyCopy();
              model.errors = errors;
              throw model;
            }
            throw errors;
          }
        }
        throw xhr;
      });
    },
    _mergePromise: function(promise, session, opts) {
      if (opts && opts.deserialize === false) {
        return promise;
      }
      function merge(deserialized) {
        if (typeof deserialized.merge === 'function') {
          return deserialized.merge(session);
        } else if (deserialized.isModel) {
          return session.merge(deserialized);
        }
        return deserialized;
      }
      return promise.then(function(deserialized) {
        return merge(deserialized);
      }, function(deserialized) {
        throw merge(deserialized);
      });
    },
    _contextualizePromise: function(promise, context, opts) {
      if (opts && opts.deserializationContext !== undefined) {
        context = opts.deserializationContext;
      }
      function contextualize(merged) {
        if (context && merged.isPayload) {
          var result = merged.context;
          if (!result) {
            result = context;
          }
          result.meta = merged.meta;
          if (merged.errors && (!result.errors || result === context)) {
            result.errors = merged.errors;
          }
          return result;
        }
        return merged;
      }
      return promise.then(function(merged) {
        return contextualize(merged);
      }, function(merged) {
        throw contextualize(merged);
      });
    },
    _mergeAndContextualizePromise: function(promise, session, context, opts) {
      return this._contextualizePromise(this._mergePromise(promise, session, opts), context, opts);
    },
    mergePayload: function(data, context, session) {
      var payload = this.deserialize('payload', data, {context: context});
      if (!session) {
        session = this.container.lookup('session:main');
      }
      payload.merge(session);
      if (context) {
        return payload.context;
      }
      return payload;
    },
    willMergeModel: function(model) {
      this._embeddedManager.updateParents(model);
    },
    flush: function(session) {
      var models = this.buildDirtySet(session);
      var shadows = new ModelSet(array_from(models).map(function(model) {
        return session.shadows.getModel(model) || model.copy();
      }));
      this.removeEmbeddedOrphans(models, shadows, session);
      materializeRelationships(models);
      var op = new OperationGraph(models, shadows, this, session);
      return this._performFlush(op, session);
    },
    _performFlush: function(op, session) {
      var models = op.models,
          pending = new Set();
      models.forEach(function(model) {
        var op = this._pendingOps[model.clientId];
        if (op)
          pending.add(op);
      }, this);
      var adapter = this;
      if (pending.size > 0) {
        return Coalesce.Promise.all(array_from(pending)).then(function() {
          return adapter._performFlush(op, session);
        });
      }
      var promise = op.perform();
      models.forEach(function(model) {
        this._pendingOps[model.clientId] = promise;
      }, this);
      return promise.then(function(res) {
        models.forEach(function(model) {
          delete adapter._pendingOps[model.clientId];
        });
        return res.map(function(model) {
          return session.merge(model);
        });
      }, function(err) {
        models.forEach(function(model) {
          delete adapter._pendingOps[model.clientId];
        });
        throw err.map(function(model) {
          return session.merge(model);
        });
      });
    },
    rebuildRelationships: function(children, parent) {
      parent.suspendRelationshipObservers(function() {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          child.eachLoadedRelationship(function(name, relationship) {
            if (relationship.kind === 'belongsTo') {
              var value = child[name],
                  inverse = child.constructor.inverseFor(name);
              if (inverse) {
                if (!(parent instanceof inverse.parentType)) {
                  return;
                }
                if (this.embeddedType(inverse.parentType, inverse.name)) {
                  return;
                }
                if (inverse.kind === 'hasMany' && parent.isFieldLoaded(inverse.name)) {
                  var parentCollection = parent[inverse.name];
                  if (child.isDeleted) {
                    parentCollection.removeObject(child);
                  } else if (value && value.isEqual(parent)) {
                    parentCollection.addObject(child);
                  }
                }
              }
            }
          }, this);
        }
      }, this);
    },
    isRelationshipOwner: function(relationship) {
      var config = this.configFor(relationship.parentType);
      var owner = config[relationship.name] && config[relationship.name].owner;
      return relationship.kind === 'belongsTo' && owner !== false || relationship.kind === 'hasMany' && owner === true;
    },
    embeddedType: function(type, name) {
      return this._embeddedManager.embeddedType(type, name);
    },
    isDirtyFromRelationships: function(model, cached, relDiff) {
      var serializer = this.serializerFactory.serializerForModel(model);
      for (var i = 0; i < relDiff.length; i++) {
        var diff = relDiff[i];
        if (this.isRelationshipOwner(diff.relationship) || serializer.embeddedType(model.constructor, diff.name) === 'always') {
          return true;
        }
      }
      return false;
    },
    shouldSave: function(model) {
      return !this.isEmbedded(model);
    },
    isEmbedded: function(model) {
      return this._embeddedManager.isEmbedded(model);
    },
    removeEmbeddedOrphans: function(models, shadows, session) {
      var orphans = [];
      models.forEach(function(model) {
        if (!this.isEmbedded(model))
          return;
        var root = this.findEmbeddedRoot(model, models);
        if (!root || root.isEqual(model)) {
          orphans.push(model);
        }
      }, this);
      models.removeObjects(orphans);
      shadows.removeObjects(orphans);
    },
    buildDirtySet: function(session) {
      var result = new ModelSet();
      session.dirtyModels.forEach(function(model) {
        var copy = model.copy();
        copy.errors = null;
        result.add(copy);
        this._embeddedManager.eachEmbeddedRelative(model, function(embeddedModel) {
          this._embeddedManager.updateParents(embeddedModel);
          if (result.contains(embeddedModel)) {
            return;
          }
          var copy = embeddedModel.copy();
          copy.errors = null;
          result.add(copy);
        }, this);
      }, this);
      return result;
    },
    findEmbeddedRoot: function(model, models) {
      var parent = model;
      while (parent) {
        model = parent;
        parent = this._embeddedManager.findParent(model);
      }
      return models.getModel(model);
    },
    buildUrlFromContext: function(context, action) {
      var typeKey,
          id;
      if (typeof context === 'string') {
        typeKey = context;
      } else {
        typeKey = context.typeKey;
        id = context.id;
      }
      var url = this.buildUrl(typeKey, id);
      if (action) {
        url = url + '/' + action;
      }
      return url;
    },
    buildUrl: function(typeKey, id) {
      var url = [],
          host = this.host,
          prefix = this.urlPrefix();
      if (typeKey) {
        url.push(this.pathForType(typeKey));
      }
      if (id) {
        url.push(encodeURIComponent(id));
      }
      if (prefix) {
        url.unshift(prefix);
      }
      url = url.join('/');
      if (!host && url) {
        url = '/' + url;
      }
      return url;
    },
    urlPrefix: function(path, parentURL) {
      var host = this.host,
          namespace = this.namespace,
          url = [];
      if (path) {
        if (path.charAt(0) === '/') {
          if (host) {
            path = path.slice(1);
            url.push(host);
          }
        } else if (!/^http(s)?:\/\//.test(path)) {
          url.push(parentURL);
        }
      } else {
        if (host) {
          url.push(host);
        }
        if (namespace) {
          url.push(namespace);
        }
      }
      if (path) {
        url.push(path);
      }
      return url.join('/');
    },
    pathForType: function(type) {
      var camelized = camelize(type);
      return pluralize(camelized);
    },
    ajaxError: function(jqXHR) {
      if (jqXHR && typeof jqXHR === 'object') {
        jqXHR.then = null;
      }
      return jqXHR;
    },
    ajax: function(url, type, hash) {
      var adapter = this;
      return new Coalesce.Promise(function(resolve, reject) {
        hash = adapter.ajaxOptions(url, type, hash);
        hash.success = function(json) {
          Coalesce.run(null, resolve, json);
        };
        hash.error = function(jqXHR, textStatus, errorThrown) {
          Coalesce.run(null, reject, adapter.ajaxError(jqXHR));
        };
        Coalesce.ajax(hash);
      }, "Coalesce: RestAdapter#ajax " + type + " to " + url);
    },
    ajaxOptions: function(url, type, hash) {
      hash = hash || {};
      hash.url = url;
      hash.type = type;
      hash.dataType = 'json';
      hash.context = this;
      if (hash.data && type !== 'GET') {
        hash.contentType = 'application/json; charset=utf-8';
        hash.data = JSON.stringify(hash.data);
      }
      var headers = this.headers;
      if (headers !== undefined) {
        hash.beforeSend = function(xhr) {
          for (var key in headers) {
            if (!headers.hasOwnProperty(key))
              continue;
            xhr.setRequestHeader(key, headers[key]);
          }
        };
      }
      return hash;
    }
  }, {}, Adapter);
  var $__default = RestAdapter;
  RestAdapter.reopen({defaultSerializer: 'payload'});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/rest/serializers/errors", ['../../serializers/base', '../../error', '../../utils/inflector', '../../utils/is_empty'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce/rest/serializers/errors";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Serializer = $__0.default;
  var Error = $__2.default;
  var camelize = $__4.camelize;
  var isEmpty = $__6.default;
  var ErrorsSerializer = function ErrorsSerializer() {
    $traceurRuntime.defaultSuperCall(this, $ErrorsSerializer.prototype, arguments);
  };
  var $ErrorsSerializer = ErrorsSerializer;
  ($traceurRuntime.createClass)(ErrorsSerializer, {
    deserialize: function(serialized, opts) {
      var xhr = opts && opts.xhr;
      if (!xhr && (isEmpty(serialized) || isEmptyObject(serialized)))
        return;
      var Type = this.container.lookupFactory('model:errors');
      var res = Type.create();
      for (var key in serialized) {
        res.set(this.transformPropertyKey(key), serialized[key]);
      }
      if (xhr) {
        res.status = xhr.status;
        res.xhr = xhr;
      }
      return res;
    },
    transformPropertyKey: function(name) {
      return camelize(name);
    },
    serialize: function(id) {
      throw new Error("Errors are not currently serialized down to the server.");
    }
  }, {}, Serializer);
  var $__default = ErrorsSerializer;
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/rest/serializers/payload", ['../../utils/materialize_relationships', '../../serializers/base', '../payload', '../../utils/inflector'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce/rest/serializers/payload";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var materializeRelationships = $__0.default;
  var Serializer = $__2.default;
  var Payload = $__4.default;
  var singularize = $__6.singularize;
  var PayloadSerializer = function PayloadSerializer() {
    $traceurRuntime.defaultSuperCall(this, $PayloadSerializer.prototype, arguments);
  };
  var $PayloadSerializer = PayloadSerializer;
  ($traceurRuntime.createClass)(PayloadSerializer, {
    singularize: function(name) {
      return singularize(name);
    },
    typeKeyFor: function(name) {
      var singular = this.singularize(name),
          aliases = this.aliases,
          alias = aliases[name];
      return alias || singular;
    },
    rootForTypeKey: function(typeKey) {
      return typeKey;
    },
    serialize: function(model) {
      var typeKey = model.typeKey,
          root = this.rootForTypeKey(typeKey),
          res = {},
          serializer = this.serializerFor(typeKey);
      res[root] = serializer.serialize(model);
      return res;
    },
    deserialize: function(hash, opts) {
      opts = opts || {};
      var result = new Payload(),
          metaKey = this.metaKey,
          errorsKey = this.errorsKey,
          context = opts.context,
          xhr = opts.xhr;
      if (context && typeof context === 'string') {
        result.context = [];
      }
      function checkForContext(model) {
        if (context) {
          if (typeof context === 'string' && typeKey === context) {
            result.context.push(model);
          } else if (context.isModel && context.isEqual(model)) {
            result.context = model;
          }
        }
      }
      for (var prop in hash) {
        if (!hash.hasOwnProperty(prop)) {
          continue;
        }
        if (prop === metaKey) {
          result.meta = hash[prop];
          continue;
        }
        var value = hash[prop];
        if (prop === errorsKey) {
          var serializer = this.serializerFor('errors', opts),
              errors = serializer.deserialize(value, opts);
          result.errors = errors;
          continue;
        }
        var typeKey = this.typeKeyFor(prop),
            serializer = this.serializerFor(typeKey);
        console.assert(!!serializer, ("No serializer found for '" + typeKey + "'"));
        if (Array.isArray(value)) {
          for (var i = 0; i < value.length; i++) {
            var model = serializer.deserialize(value[i]);
            checkForContext(model);
            result.add(model);
          }
        } else {
          var model = serializer.deserialize(value);
          checkForContext(model);
          result.add(model);
        }
      }
      if (xhr) {
        var errors = result.errors;
        if (!errors) {
          var serializer = this.serializerFor('errors'),
              errors = serializer.deserialize({}, opts);
          result.errors = errors;
        }
      }
      materializeRelationships(result, this.idManager);
      return result;
    }
  }, {}, Serializer);
  var $__default = PayloadSerializer;
  PayloadSerializer.reopen({
    metaKey: 'meta',
    aliases: {},
    errorsKey: 'errors'
  });
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/base", ['../factories/serializer', '../utils/base_class'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/base";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var SerializerFactory = $__0.default;
  var BaseClass = $__2.default;
  var Base = function Base() {
    this.serializerFactory = new SerializerFactory(this.container);
  };
  ($traceurRuntime.createClass)(Base, {
    serialize: function() {},
    deserialize: function() {},
    serializerFor: function(typeKey) {
      return this.serializerFactory.serializerFor(typeKey);
    }
  }, {}, BaseClass);
  var $__default = Base;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/belongs_to", ['./base'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/serializers/belongs_to";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Serializer = $__0.default;
  var BelongsToSerializer = function BelongsToSerializer() {
    $traceurRuntime.defaultSuperCall(this, $BelongsToSerializer.prototype, arguments);
  };
  var $BelongsToSerializer = BelongsToSerializer;
  ($traceurRuntime.createClass)(BelongsToSerializer, {
    deserialize: function(serialized, opts) {
      if (!serialized) {
        return null;
      }
      if (!opts.embedded) {
        var idSerializer = this.serializerFor('id');
        serialized = {id: idSerializer.deserialize(serialized)};
        opts.reifyClientId = false;
      }
      return this.deserializeModel(serialized, opts);
    },
    deserializeModel: function(serialized, opts) {
      var serializer = this.serializerFor(opts.typeKey);
      return serializer.deserialize(serialized, opts);
    },
    serialize: function(model, opts) {
      if (!model) {
        return null;
      }
      if (opts.embedded) {
        return this.serializeModel(model, opts);
      }
      var idSerializer = this.serializerFor('id');
      return idSerializer.serialize(model.id);
    },
    serializeModel: function(model, opts) {
      var serializer = this.serializerFor(opts.typeKey);
      return serializer.serialize(model);
    }
  }, {}, Serializer);
  var $__default = BelongsToSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/boolean", ['./base'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/serializers/boolean";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Serializer = $__0.default;
  var BooleanSerializer = function BooleanSerializer() {
    $traceurRuntime.defaultSuperCall(this, $BooleanSerializer.prototype, arguments);
  };
  var $BooleanSerializer = BooleanSerializer;
  ($traceurRuntime.createClass)(BooleanSerializer, {
    deserialize: function(serialized) {
      var type = typeof serialized;
      if (type === "boolean") {
        return serialized;
      } else if (type === "string") {
        return serialized.match(/^true$|^t$|^1$/i) !== null;
      } else if (type === "number") {
        return serialized === 1;
      } else {
        return false;
      }
    },
    serialize: function(deserialized) {
      return Boolean(deserialized);
    }
  }, {}, Serializer);
  var $__default = BooleanSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/date", ['./base', '../utils/parse_date'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/date";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Serializer = $__0.default;
  var parseDate = $__2.default;
  var DateSerializer = function DateSerializer() {
    $traceurRuntime.defaultSuperCall(this, $DateSerializer.prototype, arguments);
  };
  var $DateSerializer = DateSerializer;
  ($traceurRuntime.createClass)(DateSerializer, {
    deserialize: function(serialized) {
      var type = typeof serialized;
      if (type === "string") {
        return new Date(parseDate(serialized));
      } else if (type === "number") {
        return new Date(serialized);
      } else if (serialized === null || serialized === undefined) {
        return serialized;
      } else {
        return null;
      }
    },
    serialize: function(date) {
      if (date instanceof Date) {
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var pad = function(num) {
          return num < 10 ? "0" + num : "" + num;
        };
        var utcYear = date.getUTCFullYear(),
            utcMonth = date.getUTCMonth(),
            utcDayOfMonth = date.getUTCDate(),
            utcDay = date.getUTCDay(),
            utcHours = date.getUTCHours(),
            utcMinutes = date.getUTCMinutes(),
            utcSeconds = date.getUTCSeconds();
        var dayOfWeek = days[utcDay];
        var dayOfMonth = pad(utcDayOfMonth);
        var month = months[utcMonth];
        return dayOfWeek + ", " + dayOfMonth + " " + month + " " + utcYear + " " + pad(utcHours) + ":" + pad(utcMinutes) + ":" + pad(utcSeconds) + " GMT";
      } else {
        return null;
      }
    }
  }, {}, Serializer);
  var $__default = DateSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/has_many", ['../utils/is_empty', './base'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/has_many";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var isEmpty = $__0.default;
  var Serializer = $__2.default;
  var HasManySerializer = function HasManySerializer() {
    $traceurRuntime.defaultSuperCall(this, $HasManySerializer.prototype, arguments);
  };
  var $HasManySerializer = HasManySerializer;
  ($traceurRuntime.createClass)(HasManySerializer, {
    deserialize: function(serialized, opts) {
      if (!serialized)
        return [];
      if (!opts.embedded) {
        var idSerializer = this.serializerFor('id');
        serialized = serialized.map(function(id) {
          return {id: id};
        }, this);
        opts.reifyClientId = false;
      }
      return this.deserializeModels(serialized, opts);
    },
    deserializeModels: function(serialized, opts) {
      var serializer = this.serializerFor(opts.typeKey);
      return serialized.map(function(hash) {
        return serializer.deserialize(hash, opts);
      });
    },
    serialize: function(models, opts) {
      if (opts.embedded) {
        return this.serializeModels(models, opts);
      }
      return undefined;
    },
    serializeModels: function(models, opts) {
      var serializer = this.serializerFor(opts.typeKey);
      return models.map(function(model) {
        return serializer.serialize(model);
      });
    }
  }, {}, Serializer);
  var $__default = HasManySerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/id", ['./base'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/serializers/id";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Serializer = $__0.default;
  var IdSerializer = function IdSerializer() {
    $traceurRuntime.defaultSuperCall(this, $IdSerializer.prototype, arguments);
  };
  var $IdSerializer = IdSerializer;
  ($traceurRuntime.createClass)(IdSerializer, {
    deserialize: function(serialized) {
      if (serialized === undefined || serialized === null)
        return;
      return serialized + '';
    },
    serialize: function(id) {
      if (isNaN(id) || id === null) {
        return id;
      }
      return +id;
    }
  }, {}, Serializer);
  var $__default = IdSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/model", ['./base', '../utils/inflector'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/model";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Serializer = $__0.default;
  var $__3 = $__2,
      singularize = $__3.singularize,
      camelize = $__3.camelize,
      underscore = $__3.underscore,
      dasherize = $__3.dasherize;
  var ModelSerializer = function ModelSerializer() {
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    $traceurRuntime.superCall(this, $ModelSerializer.prototype, "constructor", [args]);
    this._keyCache = {};
    this._nameCache = {};
  };
  var $ModelSerializer = ModelSerializer;
  ($traceurRuntime.createClass)(ModelSerializer, {
    nameFor: function(key) {
      var name;
      if (name = this._nameCache[key]) {
        return name;
      }
      var configs = this.properties;
      for (var currentName in configs) {
        var current = configs[name];
        var keyName = current.key;
        if (keyName && key === keyName) {
          name = currentName;
        }
      }
      name = name || camelize(key);
      this._nameCache[key] = name;
      return name;
    },
    configFor: function(name) {
      var properties = this.properties;
      return properties && properties[name] || {};
    },
    keyFor: function(name, type, opts) {
      var key;
      if (key = this._keyCache[name]) {
        return key;
      }
      var config = this.configFor(name);
      key = config.key || this.keyForType(name, type, opts);
      this._keyCache[name] = key;
      return key;
    },
    keyForType: function(name, type, opts) {
      return underscore(name);
    },
    rootForType: function(type) {
      return type.typeKey;
    },
    serialize: function(model) {
      var serialized = {};
      this.addMeta(serialized, model);
      this.addAttributes(serialized, model);
      this.addRelationships(serialized, model);
      return serialized;
    },
    addMeta: function(serialized, model) {
      this.addProperty(serialized, model, 'id', 'id');
      this.addProperty(serialized, model, 'clientId', 'string');
      this.addProperty(serialized, model, 'rev', 'revision');
      this.addProperty(serialized, model, 'clientRev', 'revision');
    },
    addAttributes: function(serialized, model) {
      model.eachLoadedAttribute(function(name, attribute) {
        if (attribute.transient)
          return;
        this.addProperty(serialized, model, name, attribute.type);
      }, this);
    },
    addRelationships: function(serialized, model) {
      model.eachLoadedRelationship(function(name, relationship) {
        var config = this.configFor(name),
            opts = {
              typeKey: relationship.typeKey,
              embedded: config.embedded
            },
            kindKey = dasherize(relationship.kind);
        this.addProperty(serialized, model, name, kindKey, opts);
      }, this);
    },
    addProperty: function(serialized, model, name, type, opts) {
      var key = this.keyFor(name, type, opts),
          value = model[name],
          serializer;
      if (type) {
        serializer = this.serializerFor(type);
      }
      if (serializer) {
        value = serializer.serialize(value, opts);
      }
      if (value !== undefined) {
        serialized[key] = value;
      }
    },
    deserialize: function(hash, opts) {
      var model = this.createModel();
      this.extractMeta(model, hash, opts);
      this.extractAttributes(model, hash);
      this.extractRelationships(model, hash);
      return model;
    },
    extractMeta: function(model, hash, opts) {
      this.extractProperty(model, hash, 'id', 'id');
      this.extractProperty(model, hash, 'clientId', 'string');
      this.extractProperty(model, hash, 'rev', 'revision');
      this.extractProperty(model, hash, 'clientRev', 'revision');
      this.extractProperty(model, hash, 'errors', 'errors');
      if (!opts || opts.reifyClientId !== false) {
        this.idManager.reifyClientId(model);
      }
    },
    extractAttributes: function(model, hash) {
      model.eachAttribute(function(name, attribute) {
        this.extractProperty(model, hash, name, attribute.type);
      }, this);
    },
    extractRelationships: function(model, hash) {
      model.eachRelationship(function(name, relationship) {
        var config = this.configFor(name),
            opts = {
              typeKey: relationship.typeKey,
              embedded: config.embedded
            },
            kindKey = dasherize(relationship.kind);
        this.extractProperty(model, hash, name, kindKey, opts);
      }, this);
    },
    extractProperty: function(model, hash, name, type, opts) {
      var key = this.keyFor(name, type, opts),
          value = hash[key],
          serializer;
      if (typeof value === 'undefined') {
        return;
      }
      if (type) {
        serializer = this.serializerFor(type);
      }
      if (serializer) {
        value = serializer.deserialize(value, opts);
      }
      if (typeof value !== 'undefined') {
        model[name] = value;
      }
    },
    createModel: function() {
      return this.typeFor(this.typeKey).create();
    },
    typeFor: function(typeKey) {
      return this.container.lookupFactory('model:' + typeKey);
    },
    serializerFor: function(typeKey) {
      return this.serializerFactory.serializerFor(typeKey);
    },
    embeddedType: function(type, name) {
      var config = this.configFor(name);
      return config.embedded;
    }
  }, {}, Serializer);
  var $__default = ModelSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/number", ['../utils/is_empty', './base'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/number";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var isEmpty = $__0.default;
  var Serializer = $__2.default;
  var NumberSerializer = function NumberSerializer() {
    $traceurRuntime.defaultSuperCall(this, $NumberSerializer.prototype, arguments);
  };
  var $NumberSerializer = NumberSerializer;
  ($traceurRuntime.createClass)(NumberSerializer, {
    deserialize: function(serialized) {
      return isEmpty(serialized) ? null : Number(serialized);
    },
    serialize: function(deserialized) {
      return isEmpty(deserialized) ? null : Number(deserialized);
    }
  }, {}, Serializer);
  var $__default = NumberSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/revision", ['../utils/is_empty', './base'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/revision";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var isEmpty = $__0.default;
  var Serializer = $__2.default;
  var RevisionSerializer = function RevisionSerializer() {
    $traceurRuntime.defaultSuperCall(this, $RevisionSerializer.prototype, arguments);
  };
  var $RevisionSerializer = RevisionSerializer;
  ($traceurRuntime.createClass)(RevisionSerializer, {
    deserialize: function(serialized) {
      return serialized ? serialized : undefined;
    },
    serialize: function(deserialized) {
      return deserialized ? deserialized : undefined;
    }
  }, {}, Serializer);
  var $__default = RevisionSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/serializers/string", ['../utils/is_none', './base'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/serializers/string";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var isNone = $__0.default;
  var Serializer = $__2.default;
  var StringSerializer = function StringSerializer() {
    $traceurRuntime.defaultSuperCall(this, $StringSerializer.prototype, arguments);
  };
  var $StringSerializer = StringSerializer;
  ($traceurRuntime.createClass)(StringSerializer, {
    deserialize: function(serialized) {
      return isNone(serialized) ? null : String(serialized);
    },
    serialize: function(deserialized) {
      return isNone(deserialized) ? null : String(deserialized);
    }
  }, {}, Serializer);
  var $__default = StringSerializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/session/collection_manager", [], function() {
  "use strict";
  var __moduleName = "coalesce/session/collection_manager";
  var CollectionManager = function CollectionManager() {
    this.modelMap = {};
  };
  ($traceurRuntime.createClass)(CollectionManager, {
    register: function(array, model) {
      var clientId = model.clientId,
          arrays = this.modelMap[clientId];
      if (!arrays) {
        arrays = this.modelMap[clientId] = [];
      }
      if (arrays.indexOf(array) !== -1)
        return;
      arrays.push(array);
    },
    unregister: function(array, model) {
      var clientId = model.clientId,
          arrays = this.modelMap[clientId];
      if (arrays) {
        _.pull(arrays, array);
        if (arrays.length === 0) {
          delete this.modelMap[clientId];
        }
      }
    },
    modelWasDeleted: function(model) {
      var clientId = model.clientId,
          arrays = this.modelMap[clientId];
      if (arrays) {
        _.clone(arrays).forEach(function(array) {
          array.removeObject(model);
        });
      }
    }
  }, {});
  var $__default = CollectionManager;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/session/inverse_manager", ['../collections/model_set', '../utils/copy'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce/session/inverse_manager";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ModelSet = $__0.default;
  var copy = $__2.default;
  var InverseManager = function InverseManager(session) {
    this.session = session;
    this.map = {};
  };
  ($traceurRuntime.createClass)(InverseManager, {
    register: function(model) {
      var session = this.session;
      model.eachLoadedRelationship(function(name, relationship) {
        var existingInverses = this._inversesFor(model, name),
            inversesToClear = existingInverses.copy();
        function checkInverse(inverseModel) {
          session.reifyClientId(inverseModel);
          if (existingInverses.contains(inverseModel)) {} else {
            this.registerRelationship(model, name, inverseModel);
          }
          inversesToClear.remove(inverseModel);
        }
        if (relationship.kind === 'belongsTo') {
          var inverseModel = model[name];
          if (inverseModel) {
            checkInverse.call(this, inverseModel);
          }
        } else if (relationship.kind === 'hasMany') {
          var inverseModels = model[name];
          inverseModels.forEach(function(inverseModel) {
            checkInverse.call(this, inverseModel);
          }, this);
        }
        inversesToClear.forEach(function(inverseModel) {
          this.unregisterRelationship(model, name, inverseModel);
        }, this);
      }, this);
    },
    unregister: function(model) {
      var clientId = model.clientId,
          inverses = this._inverses(model);
      for (var name in inverses) {
        var inverseModels = inverses[name],
            copiedInverseModels = copy(inverseModels);
        copiedInverseModels.forEach(function(inverseModel) {
          this.unregisterRelationship(model, name, inverseModel);
        }, this);
      }
      delete this.map[clientId];
    },
    registerRelationship: function(model, name, inverseModel) {
      var inverse = model.constructor.inverseFor(name);
      this._inversesFor(model, name).addObject(inverseModel);
      if (inverse) {
        this._inversesFor(inverseModel, inverse.name).addObject(model);
        this._addToInverse(inverseModel, inverse, model);
      }
    },
    unregisterRelationship: function(model, name, inverseModel) {
      var inverse = model.constructor.inverseFor(name);
      this._inversesFor(model, name).removeObject(inverseModel);
      if (inverse) {
        this._inversesFor(inverseModel, inverse.name).removeObject(model);
        this._removeFromInverse(inverseModel, inverse, model);
      }
    },
    _inverses: function(model) {
      var clientId = model.clientId,
          inverses = this.map[clientId];
      if (!inverses) {
        inverses = this.map[clientId] = {};
      }
      return inverses;
    },
    _inversesFor: function(model, name) {
      var inverses = this._inverses(model);
      var inversesFor = inverses[name];
      if (!inversesFor) {
        inversesFor = inverses[name] = new ModelSet();
      }
      return inversesFor;
    },
    _addToInverse: function(model, inverse, inverseModel) {
      model = this.session.models.getModel(model);
      if (!model || !model.isFieldLoaded(inverse.name))
        return;
      model.suspendRelationshipObservers(function() {
        if (inverse.kind === 'hasMany') {
          model[inverse.name].addObject(inverseModel);
        } else if (inverse.kind === 'belongsTo') {
          model[inverse.name] = inverseModel;
        }
      }, this);
    },
    _removeFromInverse: function(model, inverse, inverseModel) {
      model = this.session.models.getModel(model);
      if (!model || !model.isFieldLoaded(inverse.name))
        return;
      model.suspendRelationshipObservers(function() {
        if (inverse.kind === 'hasMany') {
          model[inverse.name].removeObject(inverseModel);
        } else if (inverse.kind === 'belongsTo') {
          model[inverse.name] = null;
        }
      }, this);
    }
  }, {});
  var $__default = InverseManager;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/session/model_cache", ['../namespace'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/session/model_cache";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Coalesce = $__0.default;
  var ModelCache = function ModelCache($__3) {
    var session = $__3.session;
    this.session = session;
    this._promises = {};
  };
  ($traceurRuntime.createClass)(ModelCache, {
    add: function(model) {
      var promise = arguments[1] !== (void 0) ? arguments[1] : null;
      if (this.shouldCache(model)) {
        if (!promise) {
          promise = Coalesce.Promise.resolve(model);
        }
      }
      if (promise) {
        this._promises[model.clientId] = promise;
      }
    },
    remove: function(model) {
      delete this._promises[model.clientId];
    },
    getPromise: function(model) {
      console.assert(model.clientId, "Model does not have a client id");
      var cached = this._promises[model.clientId];
      if (cached && this.shouldInvalidate(cached)) {
        this.remove(cached);
        return;
      }
      return cached;
    },
    shouldCache: function(model) {
      return model.isPartiallyLoaded;
    },
    shouldInvalidate: function(model) {
      return false;
    },
    destroy: function() {}
  }, {create: function(props) {
      return new this(props);
    }});
  var $__default = ModelCache;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/session/query", ['../collections/observable_array'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/session/query";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var ObservableArray = $__0.default;
  var Query = function Query(session, type, params) {
    this.session = session;
    this._type = type;
    this._params = params;
    $traceurRuntime.superCall(this, $Query.prototype, "constructor", []);
  };
  var $Query = Query;
  ($traceurRuntime.createClass)(Query, {
    get params() {
      return this._params;
    },
    get type() {
      return this._type;
    },
    invalidate: function() {
      return this.session.invalidateQuery(this);
    },
    refresh: function() {
      return this.session.refreshQuery(this);
    }
  }, {}, ObservableArray);
  var $__default = Query;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/session/query_cache", ['../namespace'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/session/query_cache";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Coalesce = $__0.default;
  var QueryCache = function QueryCache($__3) {
    var session = $__3.session;
    this.session = session;
    this._queries = {};
    this._promises = {};
  };
  ($traceurRuntime.createClass)(QueryCache, {
    add: function(query) {
      var promise = arguments[1] !== (void 0) ? arguments[1] : null;
      var key = this.keyFor(query.type, query.params);
      if (promise && this.shouldCache(query)) {
        this._promises[key] = promise;
      }
      this._queries[key] = query;
    },
    remove: function(query) {
      var key = this.keyFor(query.type, query.params);
      delete this._queries[key];
      delete this._promises[key];
    },
    removeAll: function(type) {
      var queries = this._queries;
      for (var key in queries) {
        if (!queries.hasOwnProperty(key))
          continue;
        var typeKey = key.split('$')[0];
        if (type.typeKey === typeKey) {
          this.remove(queries[key]);
        }
      }
    },
    getQuery: function(type, params) {
      var key = this.keyFor(type, params);
      return this._queries[key];
    },
    getPromise: function(query) {
      var key = this.keyFor(query.type, query.params),
          cached = this._promises[key];
      if (cached && this.shouldInvalidate(cached)) {
        this.remove(cached);
        return;
      }
      return cached;
    },
    keyFor: function(type, params) {
      return type.typeKey + '$' + JSON.stringify(params);
    },
    shouldCache: function(query) {
      return true;
    },
    shouldInvalidate: function(query) {
      return false;
    },
    destroy: function() {}
  }, {create: function(props) {
      return new this(props);
    }});
  var $__default = QueryCache;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/session/session", ['../collections/model_array', '../collections/model_set', './collection_manager', './inverse_manager', '../model/model', './query', '../factories/type', '../factories/merge', '../factories/model_cache', '../factories/query_cache', '../utils/copy', '../error', '../utils/array_from', '../utils/evented'], function($__0,$__2,$__4,$__6,$__8,$__10,$__12,$__14,$__16,$__18,$__20,$__22,$__24,$__26) {
  "use strict";
  var __moduleName = "coalesce/session/session";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  if (!$__16 || !$__16.__esModule)
    $__16 = {default: $__16};
  if (!$__18 || !$__18.__esModule)
    $__18 = {default: $__18};
  if (!$__20 || !$__20.__esModule)
    $__20 = {default: $__20};
  if (!$__22 || !$__22.__esModule)
    $__22 = {default: $__22};
  if (!$__24 || !$__24.__esModule)
    $__24 = {default: $__24};
  if (!$__26 || !$__26.__esModule)
    $__26 = {default: $__26};
  var ModelArray = $__0.default;
  var ModelSet = $__2.default;
  var CollectionManager = $__4.default;
  var InverseManager = $__6.default;
  var Model = $__8.default;
  var Query = $__10.default;
  var TypeFactory = $__12.default;
  var MergeFactory = $__14.default;
  var ModelCacheFactory = $__16.default;
  var QueryCacheFactory = $__18.default;
  var copy = $__20.default;
  var Error = $__22.default;
  var array_from = $__24.default;
  var evented = $__26.default;
  var uuid = 1;
  var Session = function Session($__29) {
    var $__30 = $__29,
        adapter = $__30.adapter,
        idManager = $__30.idManager,
        container = $__30.container,
        parent = $__30.parent;
    this.adapter = adapter;
    this.idManager = idManager;
    this.container = container;
    this.parent = parent;
    this.models = new ModelSet();
    this.collectionManager = new CollectionManager();
    this.inverseManager = new InverseManager(this);
    this.shadows = new ModelSet();
    this.originals = new ModelSet();
    this.newModels = new ModelSet();
    this.typeFactory = new TypeFactory(container);
    this.mergeFactory = new MergeFactory(container);
    this.queryCacheFactory = new QueryCacheFactory(container);
    this.modelCacheFactory = new ModelCacheFactory(container);
    this._dirtyCheckingSuspended = false;
    this.name = "session" + uuid++;
  };
  ($traceurRuntime.createClass)(Session, {
    build: function(type, hash) {
      type = this.typeFor(type);
      var model = type.create(hash || {});
      return model;
    },
    create: function(type, hash) {
      var model = this.build(type, hash);
      return this.add(model);
    },
    adopt: function(model) {
      this.reifyClientId(model);
      console.assert(!model.session || model.session === this, "Models instances cannot be moved between sessions. Use `add` or `update` instead.");
      console.assert(!this.models.getModel(model) || this.models.getModel(model) === model, "An equivalent model already exists in the session!");
      if (model.isNew) {
        this.newModels.add(model);
      }
      if (!model.session) {
        this.models.add(model);
        this.inverseManager.register(model);
        model.session = this;
      }
      return model;
    },
    add: function(model) {
      this.reifyClientId(model);
      var dest = this.getModel(model);
      if (dest)
        return dest;
      if (model.session === this)
        return model;
      if (model.isNew && model.isDetached) {
        dest = model;
      } else if (model.isNew) {
        dest = model.copy();
      } else {
        dest = model.lazyCopy();
      }
      return this.adopt(dest);
    },
    remove: function(model) {
      this.models.remove(model);
      this.shadows.remove(model);
      this.originals.remove(model);
    },
    update: function(model) {
      this.reifyClientId(model);
      var dest = this.getModel(model);
      if (model.isNew && !dest) {
        dest = model.constructor.create();
        dest.clientId = model.clientId;
        this.adopt(dest);
      }
      if (model.isDetached || !dest) {
        return this.add(model);
      }
      if (model.isDeleted) {
        if (!dest.isDeleted) {
          this.deleteModel(dest);
        }
        return dest;
      }
      model.copyAttributes(dest);
      model.copyMeta(dest);
      model.eachLoadedRelationship(function(name, relationship) {
        if (relationship.kind === 'belongsTo') {
          var child = model[name];
          if (child) {
            dest[name] = child;
          }
        } else if (relationship.kind === 'hasMany') {
          var children = model[name];
          var destChildren = dest[name];
          children.copyTo(destChildren);
        }
      }, this);
      return dest;
    },
    deleteModel: function(model) {
      if (model.isNew) {
        var newModels = this.newModels;
        newModels.remove(model);
      } else {
        this.modelWillBecomeDirty(model);
      }
      model.isDeleted = true;
      this.collectionManager.modelWasDeleted(model);
      this.inverseManager.unregister(model);
    },
    fetch: function(type, id) {
      type = this.typeFor(type);
      var typeKey = type.typeKey;
      id = id + '';
      var model = this.getForId(typeKey, id);
      if (!model) {
        model = this.build(typeKey, {id: id});
        this.adopt(model);
      }
      return model;
    },
    load: function(type, id, opts) {
      var model = this.fetch(type, id);
      return this.loadModel(model, opts);
    },
    loadModel: function(model, opts) {
      console.assert(model.id, "Cannot load a model with an id");
      var cache = this.modelCacheFor(model),
          promise = cache.getPromise(model);
      if (promise) {
        promise = promise.then(function() {
          return model;
        });
      } else {
        promise = this.adapter.load(model, opts, this);
        cache.add(model, promise);
      }
      return promise;
    },
    refresh: function(model, opts) {
      var session = this;
      return this.adapter.load(model, opts, this);
    },
    find: function(type, query, opts) {
      if (typeof query === 'object') {
        return this.query(type, query, opts);
      }
      return this.load(type, query, opts);
    },
    buildQuery: function(type, params) {
      type = this.typeFor(type);
      return new Query(this, type, params);
    },
    fetchQuery: function(type, params) {
      type = this.typeFor(type);
      var queryCache = this.queryCacheFor(type),
          query = queryCache.getQuery(type, params);
      if (!query) {
        query = this.buildQuery(type, params);
        queryCache.add(query);
      }
      return query;
    },
    query: function(type, params, opts) {
      var type = this.typeFor(type),
          query = this.fetchQuery(type, params),
          queryCache = this.queryCacheFor(type),
          promise = queryCache.getPromise(query);
      if (!promise) {
        promise = this.refreshQuery(query, opts);
      }
      return promise;
    },
    refreshQuery: function(query, opts) {
      var promise = this.adapter.query(query.type.typeKey, query.params, opts, this).then(function(models) {
        query.meta = models.meta;
        query.replace(0, query.length, models);
        return query;
      });
      var queryCache = this.queryCacheFor(query.type);
      queryCache.add(query, promise);
      return promise;
    },
    flush: function() {
      var session = this,
          dirtyModels = this.dirtyModels,
          newModels = this.newModels,
          shadows = this.shadows;
      dirtyModels.forEach(function(model) {
        model.clientRev += 1;
      }, this);
      this.emit('willFlush', dirtyModels);
      var promise = this.adapter.flush(this);
      dirtyModels.forEach(function(model) {
        var original = this.originals.getModel(model);
        var shadow = this.shadows.getModel(model);
        if (shadow && (!original || original.rev < shadow.rev)) {
          this.originals.add(shadow);
        }
        this.markClean(model);
      }, this);
      newModels.clear();
      return promise;
    },
    getModel: function(model) {
      var res = this.models.getModel(model);
      if (!res && this.parent) {
        res = this.parent.getModel(model);
        if (res) {
          res = this.adopt(res.copy());
          this.updateCache(res);
        }
      }
      return res;
    },
    getForId: function(typeKey, id) {
      var clientId = this.idManager.getClientId(typeKey, id);
      return this.getForClientId(clientId);
    },
    getForClientId: function(clientId) {
      var res = this.models.getForClientId(clientId);
      if (!res && this.parent) {
        res = this.parent.getForClientId(clientId);
        if (res) {
          res = this.adopt(res.copy());
          this.updateCache(res);
        }
      }
      return res;
    },
    reifyClientId: function(model) {
      this.idManager.reifyClientId(model);
    },
    remoteCall: function(context, name, params, opts) {
      var session = this;
      if (opts && opts.deserializationContext && typeof opts.deserializationContext !== 'string') {
        opts.deserializationContext = opts.deserializationContext.typeKey;
      }
      return this.adapter.remoteCall(context, name, params, opts, this);
    },
    modelWillBecomeDirty: function(model) {
      if (this._dirtyCheckingSuspended) {
        return;
      }
      this.touch(model);
    },
    get dirtyModels() {
      var models = new ModelSet(array_from(this.shadows).map(function(model) {
        return this.models.getModel(model);
      }, this));
      this.newModels.forEach(function(model) {
        models.add(model);
      });
      return models;
    },
    suspendDirtyChecking: function(callback, binding) {
      var self = this;
      if (this._dirtyCheckingSuspended) {
        return callback.call(binding || self);
      }
      try {
        this._dirtyCheckingSuspended = true;
        return callback.call(binding || self);
      } finally {
        this._dirtyCheckingSuspended = false;
      }
    },
    newSession: function() {
      var child = this.constructor.create({
        parent: this,
        adapter: this.adapter,
        container: this.container,
        idManager: this.idManager
      });
      return child;
    },
    typeFor: function(key) {
      if (typeof key !== 'string') {
        return key;
      }
      return this.typeFactory.typeFor(key);
    },
    modelCacheFor: function(model) {
      return this.modelCacheFactory.modelCacheFor(model.typeKey);
    },
    queryCacheFor: function(key) {
      if (typeof key !== 'string') {
        key = key.typeKey;
      }
      return this.queryCacheFactory.queryCacheFor(key);
    },
    getShadow: function(model) {
      var shadows = this.shadows;
      var models = this.models;
      return shadows.getModel(model) || models.getModel(model);
    },
    updateCache: function(model) {
      var cache = this.modelCacheFor(model);
      cache.add(model);
    },
    invalidate: function(model) {
      var cache = this.modelCacheFor(model);
      cache.remove(model);
    },
    invalidateQuery: function(query) {
      var queryCache = this.queryCacheFor(query.type);
      queryCache.remove(query);
    },
    invalidateQueries: function(type) {
      var type = this.typeFor(type),
          queryCache = this.queryCacheFor(type);
      queryCache.removeAll(type);
    },
    markClean: function(model) {
      this.shadows.remove(model);
    },
    touch: function(model) {
      if (!model.isNew) {
        var shadow = this.shadows.getModel(model);
        if (!shadow) {
          this.shadows.addObject(model.copy());
        }
      }
    },
    get isDirty() {
      return this.dirtyModels.size > 0;
    },
    mergeData: function(data, typeKey) {
      return this.adapter.mergeData(data, typeKey, this);
    },
    updateParent: function() {
      if (!this.parent) {
        throw new Error("Session does not have a parent");
      }
      var dirty = this.dirtyModels,
          parent = this.parent;
      dirty.forEach(function(model) {
        parent.update(model);
      }, this);
    },
    flushIntoParent: function() {
      if (!this.parent) {
        throw new Error("Session does not have a parent");
      }
      this.updateParent();
      return this.flush();
    },
    merge: function(model, visited) {
      console.assert(model.isModel, (model + " is not a model"));
      if (this.parent) {
        model = this.parent.merge(model, visited);
      }
      this.reifyClientId(model);
      if (!visited)
        visited = new Set();
      if (visited.has(model)) {
        return this.getModel(model);
      }
      visited.add(model);
      var adapter = this.adapter;
      adapter.willMergeModel(model);
      this.emit('willMerge', model);
      this.updateCache(model);
      var detachedChildren = [];
      model.eachChild(function(child) {
        if (child.isDetached) {
          detachedChildren.push(child);
        }
      }, this);
      var merged;
      if (model.hasErrors) {
        merged = this._mergeError(model);
      } else {
        merged = this._mergeSuccess(model);
      }
      if (model.meta) {
        merged.meta = model.meta;
      }
      for (var i = 0; i < detachedChildren.length; i++) {
        var child = detachedChildren[i];
        this.merge(child, visited);
      }
      adapter.didMergeModel(model);
      this.emit('didMerge', model);
      return merged;
    },
    mergeModels: function(models) {
      var merged = new ModelArray();
      merged.session = this;
      merged.addObjects(models);
      merged.meta = models.meta;
      var session = this;
      models.forEach(function(model) {
        merged.pushObject(session.merge(model));
      });
      return merged;
    },
    _mergeSuccess: function(model) {
      var models = this.models,
          shadows = this.shadows,
          newModels = this.newModels,
          originals = this.originals,
          merged,
          ancestor,
          existing = models.getModel(model);
      if (existing && this._containsRev(existing, model)) {
        return existing;
      }
      var hasClientChanges = !existing || this._containsClientRev(model, existing);
      if (hasClientChanges) {
        ancestor = shadows.getModel(model);
      } else {
        ancestor = originals.getModel(model);
      }
      this.suspendDirtyChecking(function() {
        merged = this._mergeModel(existing, ancestor, model);
      }, this);
      if (hasClientChanges) {
        if (merged.isDeleted) {
          this.remove(merged);
        } else {
          if (shadows.contains(model)) {
            shadows.addData(model);
          }
          originals.remove(model);
          if (!merged.isNew) {
            newModels.remove(merged);
          }
        }
      } else {}
      merged.errors = null;
      return merged;
    },
    _mergeError: function(model) {
      var models = this.models,
          shadows = this.shadows,
          newModels = this.newModels,
          originals = this.originals,
          merged,
          ancestor,
          existing = models.getModel(model);
      if (!existing) {
        return model;
      }
      var original = originals.getModel(model);
      var hasClientChanges = this._containsClientRev(model, existing);
      if (hasClientChanges) {
        ancestor = shadows.getModel(model) || existing;
      } else {
        ancestor = original;
      }
      if (ancestor && !this._containsRev(existing, model)) {
        this.suspendDirtyChecking(function() {
          merged = this._mergeModel(existing, ancestor, model);
        }, this);
      } else {
        merged = existing;
      }
      merged.errors = copy(model.errors);
      if (!model.isNew && original) {
        shadows.addData(original);
        shadows.addData(model);
        originals.remove(model);
      } else if (model.isNew) {
        newModels.add(existing);
      }
      return merged;
    },
    _mergeModel: function(dest, ancestor, model) {
      if (!dest) {
        if (model.isDetached) {
          dest = model;
        } else {
          dest = model.copy();
        }
        this.adopt(dest);
        return dest;
      }
      dest.id = model.id;
      dest.clientId = model.clientId;
      dest.rev = model.rev;
      this.adopt(dest);
      if (!ancestor) {
        ancestor = dest;
      }
      model.eachChild(function(child) {
        this.reifyClientId(child);
      }, this);
      var strategy = this.mergeFactory.mergeFor(model.typeKey);
      strategy.merge(dest, ancestor, model);
      return dest;
    },
    _containsRev: function(modelA, modelB) {
      if (!modelA.rev)
        return false;
      if (!modelB.rev)
        return false;
      return modelA.rev >= modelB.rev;
    },
    _containsClientRev: function(modelA, modelB) {
      return modelA.clientRev >= modelB.clientRev;
    },
    toString: function() {
      var res = this.name;
      if (this.parent) {
        res += "(child of " + this.parent.toString() + ")";
      }
      return res;
    },
    destroy: function() {}
  }, {create: function(props) {
      return new this(props);
    }});
  var $__default = Session;
  evented(Session.prototype);
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/array_from", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/array_from";
  var USE_NATIVE = false;
  function from_array(iterable) {
    if (USE_NATIVE || Array.isArray(iterable)) {
      return Array.from.apply(this, arguments);
    }
    var res = [];
    iterable.forEach(function(value) {
      res.push(value);
    });
    return res;
  }
  var $__default = from_array;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/base_class", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/base_class";
  var Base = function Base() {};
  ($traceurRuntime.createClass)(Base, {destroy: function() {}}, {
    create: function(props) {
      return new this(props);
    },
    reopen: function(props) {
      for (var key in props) {
        if (!props.hasOwnProperty(key))
          return;
        this.prototype[key] = props[key];
      }
      return this;
    },
    extend: function(props) {
      var klass = (function($__super) {
        var $__1 = function() {
          $traceurRuntime.defaultSuperCall(this, $__1.prototype, arguments);
        };
        return ($traceurRuntime.createClass)($__1, {}, {}, $__super);
      }(this));
      klass.reopen(props);
      return klass;
    },
    reopenClass: function(props) {
      for (var key in props) {
        if (!props.hasOwnProperty(key))
          return;
        this[key] = props[key];
      }
      return this;
    }
  });
  var $__default = Base;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/copy", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/copy";
  function _copy(obj, deep, seen, copies) {
    var ret,
        loc,
        key;
    if ('object' !== typeof obj || obj === null)
      return obj;
    if (obj.copy && typeof obj.copy === 'function')
      return obj.copy(deep);
    if (deep && (loc = seen.indexOf(obj)) >= 0)
      return copies[loc];
    if (obj instanceof Array) {
      ret = obj.slice();
      if (deep) {
        loc = ret.length;
        while (--loc >= 0)
          ret[loc] = _copy(ret[loc], deep, seen, copies);
      }
    } else if (obj instanceof Date) {
      ret = new Date(obj.getTime());
    } else {
      ret = {};
      for (key in obj) {
        if (!obj.hasOwnProperty(key))
          continue;
        if (key.substring(0, 2) === '__')
          continue;
        ret[key] = deep ? _copy(obj[key], deep, seen, copies) : obj[key];
      }
    }
    if (deep) {
      seen.push(obj);
      copies.push(ret);
    }
    return ret;
  }
  function copy(obj, deep) {
    return _copy(obj, deep, deep ? [] : null, deep ? [] : null);
  }
  var $__default = copy;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/evented", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/evented";
  var $__default = function(target) {
    var events = {};
    target = target || this;
    target.on = function(type, func, ctx) {
      events[type] = events[type] || [];
      events[type].push({
        f: func,
        c: ctx
      });
    };
    target.off = function(type, func) {
      type || (events = {});
      var list = events[type] || [],
          i = list.length = func ? list.length : 0;
      while (i-- > 0)
        func == list[i].f && list.splice(i, 1);
    };
    target.emit = function() {
      var args = Array.apply([], arguments),
          list = events[args.shift()] || [],
          i = 0,
          j;
      for (; j = list[i++]; )
        j.f.apply(j.c, args);
    };
  };
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/inflector", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/inflector";
  var plurals = [];
  var singulars = [];
  var uncountables = [];
  function gsub(word, rule, replacement) {
    var pattern = new RegExp(rule.source || rule, 'gi');
    return pattern.test(word) ? word.replace(pattern, replacement) : null;
  }
  function plural(rule, replacement) {
    plurals.unshift([rule, replacement]);
  }
  function pluralize(word, count, includeNumber) {
    var result;
    if (count !== undefined) {
      count = parseFloat(count);
      result = (count === 1) ? singularize(word) : pluralize(word);
      result = (includeNumber) ? [count, result].join(' ') : result;
    } else {
      if (_(uncountables).include(word)) {
        return word;
      }
      result = word;
      _(plurals).detect(function(rule) {
        var res = gsub(word, rule[0], rule[1]);
        return res ? (result = res) : false;
      }, this);
    }
    return result;
  }
  function singular(rule, replacement) {
    singulars.unshift([rule, replacement]);
  }
  function singularize(word) {
    if (_(uncountables).include(word)) {
      return word;
    }
    var result = word;
    _(singulars).detect(function(rule) {
      var res = gsub(word, rule[0], rule[1]);
      return res ? (result = res) : false;
    }, this);
    return result;
  }
  function irregular(s, p) {
    plural('\\b' + singular + '\\b', p);
    singular('\\b' + plural + '\\b', s);
  }
  function uncountable(word) {
    uncountables.unshift(word);
  }
  function ordinalize(number) {
    if (isNaN(number)) {
      return number;
    }
    number = number.toString();
    var lastDigit = number.slice(-1);
    var lastTwoDigits = number.slice(-2);
    if (lastTwoDigits === '11' || lastTwoDigits === '12' || lastTwoDigits === '13') {
      return number + 'th';
    }
    switch (lastDigit) {
      case '1':
        return number + 'st';
      case '2':
        return number + 'nd';
      case '3':
        return number + 'rd';
      default:
        return number + 'th';
    }
  }
  function titleize(words) {
    if (typeof words !== 'string') {
      return words;
    }
    return words.replace(/\S+/g, function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
  }
  function resetInflections() {
    plurals = [];
    singulars = [];
    uncountables = [];
    plural(/$/, 's');
    plural(/s$/, 's');
    plural(/(ax|test)is$/, '$1es');
    plural(/(octop|vir)us$/, '$1i');
    plural(/(octop|vir)i$/, '$1i');
    plural(/(alias|status)$/, '$1es');
    plural(/(bu)s$/, '$1ses');
    plural(/(buffal|tomat)o$/, '$1oes');
    plural(/([ti])um$/, '$1a');
    plural(/([ti])a$/, '$1a');
    plural(/sis$/, 'ses');
    plural(/(?:([^f])fe|([lr])?f)$/, '$1$2ves');
    plural(/(hive)$/, '$1s');
    plural(/([^aeiouy]|qu)y$/, '$1ies');
    plural(/(x|ch|ss|sh)$/, '$1es');
    plural(/(matr|vert|ind)(?:ix|ex)$/, '$1ices');
    plural(/([m|l])ouse$/, '$1ice');
    plural(/([m|l])ice$/, '$1ice');
    plural(/^(ox)$/, '$1en');
    plural(/^(oxen)$/, '$1');
    plural(/(quiz)$/, '$1zes');
    singular(/s$/, '');
    singular(/(n)ews$/, '$1ews');
    singular(/([ti])a$/, '$1um');
    singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/, '$1$2sis');
    singular(/(^analy)ses$/, '$1sis');
    singular(/([^f])ves$/, '$1fe');
    singular(/(hive)s$/, '$1');
    singular(/(tive)s$/, '$1');
    singular(/([lr])ves$/, '$1f');
    singular(/([^aeiouy]|qu)ies$/, '$1y');
    singular(/(s)eries$/, '$1eries');
    singular(/(m)ovies$/, '$1ovie');
    singular(/(x|ch|ss|sh)es$/, '$1');
    singular(/([m|l])ice$/, '$1ouse');
    singular(/(bus)es$/, '$1');
    singular(/(o)es$/, '$1');
    singular(/(shoe)s$/, '$1');
    singular(/(cris|ax|test)es$/, '$1is');
    singular(/(octop|vir)i$/, '$1us');
    singular(/(alias|status)es$/, '$1');
    singular(/^(ox)en/, '$1');
    singular(/(vert|ind)ices$/, '$1ex');
    singular(/(matr)ices$/, '$1ix');
    singular(/(quiz)zes$/, '$1');
    singular(/(database)s$/, '$1');
    irregular('person', 'people');
    irregular('man', 'men');
    irregular('child', 'children');
    irregular('sex', 'sexes');
    irregular('move', 'moves');
    irregular('cow', 'kine');
    uncountable('equipment');
    uncountable('information');
    uncountable('rice');
    uncountable('money');
    uncountable('species');
    uncountable('series');
    uncountable('fish');
    uncountable('sheep');
    uncountable('jeans');
    return this;
  }
  resetInflections();
  var STRING_DASHERIZE_REGEXP = (/[ _]/g);
  var STRING_DASHERIZE_CACHE = {};
  var STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);
  var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
  var STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
  var STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);
  function decamelize(str) {
    return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
  }
  function dasherize(str) {
    var cache = STRING_DASHERIZE_CACHE,
        hit = cache.hasOwnProperty(str),
        ret;
    if (hit) {
      return cache[str];
    } else {
      ret = decamelize(str).replace(STRING_DASHERIZE_REGEXP, '-');
      cache[str] = ret;
    }
    return ret;
  }
  function camelize(str) {
    return str.replace(STRING_CAMELIZE_REGEXP, function(match, separator, chr) {
      return chr ? chr.toUpperCase() : '';
    }).replace(/^([A-Z])/, function(match, separator, chr) {
      return match.toLowerCase();
    });
  }
  function classify(str) {
    var parts = str.split("."),
        out = [];
    for (var i = 0,
        l = parts.length; i < l; i++) {
      var camelized = camelize(parts[i]);
      out.push(camelized.charAt(0).toUpperCase() + camelized.substr(1));
    }
    return out.join(".");
  }
  function underscore(str) {
    return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
  }
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }
  return {
    get gsub() {
      return gsub;
    },
    get plural() {
      return plural;
    },
    get pluralize() {
      return pluralize;
    },
    get singular() {
      return singular;
    },
    get singularize() {
      return singularize;
    },
    get irregular() {
      return irregular;
    },
    get uncountable() {
      return uncountable;
    },
    get ordinalize() {
      return ordinalize;
    },
    get titleize() {
      return titleize;
    },
    get resetInflections() {
      return resetInflections;
    },
    get decamelize() {
      return decamelize;
    },
    get dasherize() {
      return dasherize;
    },
    get camelize() {
      return camelize;
    },
    get classify() {
      return classify;
    },
    get underscore() {
      return underscore;
    },
    get capitalize() {
      return capitalize;
    },
    __esModule: true
  };
});

define("coalesce/utils/is_empty", ['./is_none'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/utils/is_empty";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var isNone = $__0.default;
  function isEmpty(obj) {
    return isNone(obj) || (obj.length === 0 && typeof obj !== 'function') || (typeof obj === 'object' && obj.size === 0);
  }
  var $__default = isEmpty;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/is_equal", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/is_equal";
  function isEqual(a, b) {
    if (a && 'function' === typeof a.isEqual)
      return a.isEqual(b);
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    return a === b;
  }
  var $__default = isEqual;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/is_none", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/is_none";
  function isNone(obj) {
    return obj === null || obj === undefined;
  }
  var $__default = isNone;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/lazy_copy", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/lazy_copy";
  function _lazyCopy(obj, deep, seen, copies) {
    var ret,
        loc,
        key;
    if ('object' !== typeof obj || obj === null)
      return obj;
    if (obj.lazyCopy && typeof obj.lazyCopy === 'function')
      return obj.lazyCopy(deep);
    if (obj.copy && typeof obj.copy === 'function')
      return obj.copy(deep);
    if (deep && (loc = seen.indexOf(obj)) >= 0)
      return copies[loc];
    if (obj instanceof Array) {
      ret = obj.slice();
      if (deep) {
        loc = ret.length;
        while (--loc >= 0)
          ret[loc] = _lazyCopy(ret[loc], deep, seen, copies);
      }
    } else if (obj instanceof Date) {
      ret = new Date(obj.getTime());
    } else {
      ret = {};
      for (key in obj) {
        if (!obj.hasOwnProperty(key))
          continue;
        if (key.substring(0, 2) === '__')
          continue;
        ret[key] = deep ? _lazyCopy(obj[key], deep, seen, copies) : obj[key];
      }
    }
    if (deep) {
      seen.push(obj);
      copies.push(ret);
    }
    return ret;
  }
  function lazyCopy(obj, deep) {
    return _lazyCopy(obj, deep, deep ? [] : null, deep ? [] : null);
  }
  var $__default = lazyCopy;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/materialize_relationships", ['../collections/model_set'], function($__0) {
  "use strict";
  var __moduleName = "coalesce/utils/materialize_relationships";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var ModelSet = $__0.default;
  function materializeRelationships(models, idManager) {
    if (!(models instanceof ModelSet)) {
      models = new ModelSet(models);
    }
    models.forEach(function(model) {
      model.eachLoadedRelationship(function(name, relationship) {
        if (relationship.kind === 'belongsTo') {
          var child = model[name];
          if (child) {
            if (idManager)
              idManager.reifyClientId(child);
            child = models.getModel(child) || child;
            model[name] = child;
          }
        } else if (relationship.kind === 'hasMany') {
          var children = model[name];
          var lazyChildren = new ModelSet();
          lazyChildren.addObjects(children);
          children.clear();
          lazyChildren.forEach(function(child) {
            if (idManager)
              idManager.reifyClientId(child);
            child = models.getModel(child) || child;
            children.addObject(child);
          });
        }
      }, this);
    }, this);
  }
  var $__default = materializeRelationships;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce/utils/parse_date", [], function() {
  "use strict";
  var __moduleName = "coalesce/utils/parse_date";
  var origParse = Date.parse,
      numericKeys = [1, 4, 5, 6, 7, 10, 11];
  function parseDate(date) {
    var timestamp,
        struct,
        minutesOffset = 0;
    if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
      for (var i = 0,
          k; (k = numericKeys[i]); ++i) {
        struct[k] = +struct[k] || 0;
      }
      struct[2] = (+struct[2] || 1) - 1;
      struct[3] = +struct[3] || 1;
      if (struct[8] !== 'Z' && struct[9] !== undefined) {
        minutesOffset = struct[10] * 60 + struct[11];
        if (struct[9] === '+') {
          minutesOffset = 0 - minutesOffset;
        }
      }
      timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
    } else {
      timestamp = origParse ? origParse(date) : NaN;
    }
    return timestamp;
  }
  var $__default = parseDate;
  ;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});
