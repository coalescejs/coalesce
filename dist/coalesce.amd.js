define('coalesce', ['exports', 'module', 'coalesce/index'], function (exports, module, _coalesceIndex) {
  'use strict';

  var _Coalesce = babelHelpers.interopRequireDefault(_coalesceIndex);

  module.exports = _Coalesce['default'];
});


define('coalesce/active_model/adapter', ['exports', 'module', '../rest/adapter', '../utils/inflector'], function (exports, module, _restAdapter, _utilsInflector) {
  'use strict';

  var _RestAdapter2 = babelHelpers.interopRequireDefault(_restAdapter);

  /**
    The ActiveModelAdapter is a subclass of the RestAdapter designed to integrate
    with a JSON API that uses an underscored naming convention instead of camelcasing.
    It has been designed to work out of the box with the
    [active_model_serializers](http://github.com/rails-api/active_model_serializers)
    Ruby gem.
  
    This adapter extends the Coalesce.RestAdapter by making consistent use of the camelization,
    decamelization and pluralization methods to normalize the serialized JSON into a
    format that is compatible with a conventional Rails backend.
  
    ## JSON Structure
  
    The ActiveModelAdapter expects the JSON returned from your server to follow
    the REST adapter conventions substituting underscored keys for camelcased ones.
  
    ### Conventional Names
  
    Attribute names in your JSON payload should be the underscored versions of
    the attributes in your Coalesce.js models.
  
    For example, if you have a `Person` model:
  
    ```js
    App.FamousPerson = Coalesce.Model.extend({
      firstName: Coalesce.attr('string'),
      lastName: Coalesce.attr('string'),
      occupation: Coalesce.attr('string')
    });
    ```
  
    The JSON returned should look like this:
  
    ```js
    {
      "famous_person": {
        "first_name": "Barack",
        "last_name": "Obama",
        "occupation": "President"
      }
    }
    ```
  
    @class ActiveModelAdapter
    @constructor
    @namespace active_model
    @extends RestAdapter
  **/

  var ActiveModelAdapter = (function (_RestAdapter) {
    babelHelpers.inherits(ActiveModelAdapter, _RestAdapter);

    function ActiveModelAdapter() {
      babelHelpers.classCallCheck(this, ActiveModelAdapter);
      babelHelpers.get(Object.getPrototypeOf(ActiveModelAdapter.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(ActiveModelAdapter, [{
      key: 'pathForType',
      value: function pathForType(type) {
        var decamelized = (0, _utilsInflector.decamelize)(type);
        var underscored = (0, _utilsInflector.underscore)(decamelized);
        return (0, _utilsInflector.pluralize)(underscored);
      }
    }]);
    return ActiveModelAdapter;
  })(_RestAdapter2['default']);

  module.exports = ActiveModelAdapter;
});


define('coalesce/active_model/context', ['exports', 'module', '../rest/context', './adapter', './serializers/model'], function (exports, module, _restContext, _adapter, _serializersModel) {
  'use strict';

  var _Context2 = babelHelpers.interopRequireDefault(_restContext);

  var _ActiveModelAdapter = babelHelpers.interopRequireDefault(_adapter);

  var _ActiveModelSerializer = babelHelpers.interopRequireDefault(_serializersModel);

  var ActiveModelContext = (function (_Context) {
    babelHelpers.inherits(ActiveModelContext, _Context);

    function ActiveModelContext() {
      babelHelpers.classCallCheck(this, ActiveModelContext);
      babelHelpers.get(Object.getPrototypeOf(ActiveModelContext.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(ActiveModelContext, [{
      key: '_setupContainer',
      value: function _setupContainer() {
        babelHelpers.get(Object.getPrototypeOf(ActiveModelContext.prototype), '_setupContainer', this).call(this);
        var container = this.container;
        container.register('adapter:default', container.lookupFactory('adapter:application') || _ActiveModelAdapter['default']);

        container.register('serializer:model', _ActiveModelSerializer['default']);
      }
    }]);
    return ActiveModelContext;
  })(_Context2['default']);

  module.exports = ActiveModelContext;
});


define('coalesce/active_model/serializers/model', ['exports', 'module', '../../serializers/model', '../../utils/inflector'], function (exports, module, _serializersModel, _utilsInflector) {
  'use strict';

  var _ModelSerializer2 = babelHelpers.interopRequireDefault(_serializersModel);

  var ActiveModelSerializer = (function (_ModelSerializer) {
    babelHelpers.inherits(ActiveModelSerializer, _ModelSerializer);

    function ActiveModelSerializer() {
      babelHelpers.classCallCheck(this, ActiveModelSerializer);
      babelHelpers.get(Object.getPrototypeOf(ActiveModelSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(ActiveModelSerializer, [{
      key: 'keyForType',
      value: function keyForType(name, type, opts) {
        var key = babelHelpers.get(Object.getPrototypeOf(ActiveModelSerializer.prototype), 'keyForType', this).call(this, name, type);
        if (!opts || !opts.embedded) {
          if (type === 'belongs-to') {
            return key + '_id';
          } else if (type === 'has-many') {
            return (0, _utilsInflector.singularize)(key) + '_ids';
          }
        }
        return key;
      }
    }]);
    return ActiveModelSerializer;
  })(_ModelSerializer2['default']);

  module.exports = ActiveModelSerializer;
});


define('coalesce/adapter', ['exports', 'module', './error', './utils/base_class', './session/session', './utils/array_from'], function (exports, module, _error, _utilsBase_class, _sessionSession, _utilsArray_from) {
  'use strict';

  var _Error = babelHelpers.interopRequireDefault(_error);

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  var _Session = babelHelpers.interopRequireDefault(_sessionSession);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var Adapter = (function (_BaseClass) {
    babelHelpers.inherits(Adapter, _BaseClass);

    function Adapter() {
      babelHelpers.classCallCheck(this, Adapter);
      babelHelpers.get(Object.getPrototypeOf(Adapter.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(Adapter, [{
      key: 'serialize',
      value: function serialize(model, opts) {
        return this._serializerFor(model).serialize(model, opts);
      }
    }, {
      key: 'deserialize',
      value: function deserialize(typeKey, data, opts) {
        if (!opts.typeKey) return this._serializerFor(typeKey).deserialize(data, opts);
      }
    }, {
      key: 'serializerFor',
      value: function serializerFor(typeKey) {
        return this._serializerFor(typeKey);
      }
    }, {
      key: 'merge',
      value: function merge(model, session) {
        if (!session) {
          session = this.container.lookup('session:main');
        }
        return session.merge(model);
      }
    }, {
      key: 'mergeData',
      value: function mergeData(data, typeKey, session) {
        if (!typeKey) {
          typeKey = this.defaultSerializer;
        }

        var serializer = this._serializerFor(typeKey),
            deserialized = serializer.deserialize(data);

        if (deserialized.isModel) {
          return this.merge(deserialized, session);
        } else {
          return (0, _array_from['default'])(deserialized).map(function (model) {
            return this.merge(model, session);
          }, this);
        }
      }

      // This can be overridden in the adapter sub-classes
    }, {
      key: 'isDirtyFromRelationships',
      value: function isDirtyFromRelationships(model, cached, relDiff) {
        return relDiff.length > 0;
      }
    }, {
      key: 'shouldSave',
      value: function shouldSave(model) {
        return true;
      }
    }, {
      key: 'reifyClientId',
      value: function reifyClientId(model) {
        this.idManager.reifyClientId(model);
      }
    }, {
      key: '_serializerFor',
      value: function _serializerFor(key) {
        return this.context.configFor(key).get('serializer');
      }
    }]);
    return Adapter;
  })(_BaseClass2['default']);

  module.exports = Adapter;
});


define('coalesce/collections/has_many_array', ['exports', 'module', '../collections/model_array'], function (exports, module, _collectionsModel_array) {
  'use strict';

  var _ModelArray2 = babelHelpers.interopRequireDefault(_collectionsModel_array);

  var HasManyArray = (function (_ModelArray) {
    babelHelpers.inherits(HasManyArray, _ModelArray);

    function HasManyArray() {
      babelHelpers.classCallCheck(this, HasManyArray);
      babelHelpers.get(Object.getPrototypeOf(HasManyArray.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(HasManyArray, [{
      key: 'replace',
      value: function replace(idx, amt, objects) {
        if (this.session) {
          objects = objects.map(function (model) {
            return this.session.add(model);
          }, this);
        }
        babelHelpers.get(Object.getPrototypeOf(HasManyArray.prototype), 'replace', this).call(this, idx, amt, objects);
      }
    }, {
      key: 'arrayContentWillChange',
      value: function arrayContentWillChange(index, removed, added) {
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

        return babelHelpers.get(Object.getPrototypeOf(HasManyArray.prototype), 'arrayContentWillChange', this).call(this, index, removed, added);
      }
    }, {
      key: 'arrayContentDidChange',
      value: function arrayContentDidChange(index, removed, added) {
        babelHelpers.get(Object.getPrototypeOf(HasManyArray.prototype), 'arrayContentDidChange', this).call(this, index, removed, added);

        var model = this.owner,
            name = this.name,
            session = this.session;

        for (var i = index; i < index + added; i++) {
          var inverseModel = this.objectAt(i);
          if (session && !model._suspendedRelationships) {
            session.inverseManager.registerRelationship(model, name, inverseModel);
          }

          if (this.embedded) {
            inverseModel._parent = model;
          }
        }
      }
    }, {
      key: 'reify',
      value: function reify() {
        var _this = this;

        replace(this, 0, this.length, this.map(function (model) {
          return _this.session.add(model);
        }));
      }
    }, {
      key: 'session',
      get: function get() {
        return this.owner && this.owner.session;
      }
    }]);
    return HasManyArray;
  })(_ModelArray2['default']);

  module.exports = HasManyArray;

  var splice = Array.prototype.splice;

  function replace(array, idx, amt, objects) {
    var args = [].concat(objects),
        chunk,
        ret = [],

    // https://code.google.com/p/chromium/issues/detail?id=56588
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
});


define('coalesce/collections/model_array', ['exports', 'module', '../namespace', '../utils/is_equal', './model_set', './observable_array'], function (exports, module, _namespace, _utilsIs_equal, _model_set, _observable_array) {
  'use strict';

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  var _ModelSet = babelHelpers.interopRequireDefault(_model_set);

  var _ObservableArray2 = babelHelpers.interopRequireDefault(_observable_array);

  var ModelArray = (function (_ObservableArray) {
    babelHelpers.inherits(ModelArray, _ObservableArray);

    function ModelArray() {
      babelHelpers.classCallCheck(this, ModelArray);
      babelHelpers.get(Object.getPrototypeOf(ModelArray.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(ModelArray, [{
      key: 'arrayContentWillChange',
      value: function arrayContentWillChange(index, removed, added) {
        for (var i = index; i < index + removed; i++) {
          var model = this.objectAt(i);
          var session = this.session;

          if (session) {
            session.collectionManager.unregister(this, model);
          }
        }

        babelHelpers.get(Object.getPrototypeOf(ModelArray.prototype), 'arrayContentWillChange', this).call(this, index, removed, added);
      }
    }, {
      key: 'arrayContentDidChange',
      value: function arrayContentDidChange(index, removed, added) {
        babelHelpers.get(Object.getPrototypeOf(ModelArray.prototype), 'arrayContentDidChange', this).call(this, index, removed, added);

        for (var i = index; i < index + added; i++) {
          var model = this.objectAt(i);
          var session = this.session;

          if (session) {
            session.collectionManager.register(this, model);
          }
        }
      }
    }, {
      key: 'removeObject',
      value: function removeObject(obj) {
        var loc = this.length || 0;
        while (--loc >= 0) {
          var curObject = this.objectAt(loc);
          if ((0, _isEqual['default'])(curObject, obj)) this.removeAt(loc);
        }
        return this;
      }
    }, {
      key: 'contains',
      value: function contains(obj) {
        for (var i = 0; i < this.length; i++) {
          var m = this.objectAt(i);
          if ((0, _isEqual['default'])(obj, m)) return true;
        }
        return false;
      }

      /**
        Ensure that dest has the same content as this array.
         @method copyTo
        @param dest the other model collection to copy to
        @return dest
      */
    }, {
      key: 'copyTo',
      value: function copyTo(dest) {
        var existing = new _ModelSet['default'](dest);

        this.forEach(function (model) {
          if (existing.has(model)) {
            existing['delete'](model);
          } else {
            dest.pushObject(model);
          }
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = existing[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var model = _step.value;

            dest.removeObject(model);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: 'copy',
      value: function copy() {
        return babelHelpers.get(Object.getPrototypeOf(ModelArray.prototype), 'copy', this).call(this, true);
      }
    }, {
      key: 'diff',
      value: function diff(arr) {
        var diff = new this.constructor();

        this.forEach(function (model) {
          if (!arr.contains(model)) {
            diff.push(model);
          }
        }, this);

        arr.forEach(function (model) {
          if (!this.contains(model)) {
            diff.push(model);
          }
        }, this);

        return diff;
      }
    }, {
      key: 'isEqual',
      value: function isEqual(arr) {
        return this.diff(arr).length === 0;
      }
    }, {
      key: 'load',
      value: function load() {
        var array = this;
        return _Coalesce['default'].Promise.all(this.map(function (model) {
          return model.load();
        })).then(function () {
          return array;
        });
      }
    }]);
    return ModelArray;
  })(_ObservableArray2['default']);

  module.exports = ModelArray;
});


define('coalesce/collections/model_set', ['exports', 'module', '../utils/array_from', '../utils/base_class'], function (exports, module, _utilsArray_from, _utilsBase_class) {
  'use strict';

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  /**
    An unordered collection of unique models.
    
    Uniqueness is determined by the `clientId`. If a model is added and an
    equivalent model already exists in the ModelSet, the existing model will be
    overwritten.
  
    @class ModelSet
  */
  function guidFor(model) {
    return model.clientId;
  }

  var ModelSet = (function (_BaseClass) {
    babelHelpers.inherits(ModelSet, _BaseClass);

    function ModelSet(iterable) {
      babelHelpers.classCallCheck(this, ModelSet);

      babelHelpers.get(Object.getPrototypeOf(ModelSet.prototype), 'constructor', this).call(this);
      this._size = 0;
      if (iterable) {
        this.addObjects(iterable);
      }
    }

    babelHelpers.createClass(ModelSet, [{
      key: 'clear',

      /**
        Clears the set. This is useful if you want to reuse an existing set
        without having to recreate it.
         ```javascript
        var models = new ModelSet([post1, post2, post3]);
        models.size;  // 3
        models.clear();
        models.size;  // 0
        ```
         @method clear
        @return {ModelSet} An empty Set
      */
      value: function clear() {
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
      }
    }, {
      key: 'add',
      value: function add(obj) {

        var guid = guidFor(obj),
            idx = this[guid],
            len = this._size;

        if (idx >= 0 && idx < len && (this[idx] && this[idx].isEqual(obj))) {
          // overwrite the existing version
          if (this[idx] !== obj) {
            this[idx] = obj;
          }
          return this; // added
        }

        len = this._size;
        this[guid] = len;
        this[len] = obj;
        this._size = len + 1;

        return this;
      }
    }, {
      key: 'delete',
      value: function _delete(obj) {

        var guid = guidFor(obj),
            idx = this[guid],
            len = this._size,
            isFirst = idx === 0,
            isLast = idx === len - 1,
            last;

        if (idx >= 0 && idx < len && (this[idx] && this[idx].isEqual(obj))) {
          // swap items - basically move the item to the end so it can be removed
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
      }
    }, {
      key: 'has',
      value: function has(obj) {
        return this[guidFor(obj)] >= 0;
      }
    }, {
      key: 'copy',
      value: function copy() {
        var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var C = this.constructor,
            ret = new C(),
            loc = this._size;
        ret._size = loc;
        while (--loc >= 0) {
          ret[loc] = deep ? this[loc].copy() : this[loc];
          ret[guidFor(this[loc])] = loc;
        }
        return ret;
      }
    }, {
      key: 'forEach',
      value: function forEach(callbackFn) {
        var thisArg = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

        for (var i = 0; i < this._size; i++) {
          callbackFn.call(thisArg, this[i], this[i], this);
        }
      }
    }, {
      key: 'toString',
      value: function toString() {
        var len = this.size,
            idx,
            array = [];
        for (idx = 0; idx < len; idx++) {
          array[idx] = this[idx];
        }
        return 'ModelSet<' + array.join(',') + '>';
      }
    }, {
      key: 'get',
      value: function get(model) {
        var idx = this[guidFor(model)];
        if (idx === undefined) return;
        return this[idx];
      }
    }, {
      key: 'getForClientId',
      value: function getForClientId(clientId) {
        var idx = this[clientId];
        if (idx === undefined) return;
        return this[idx];
      }
    }, {
      key: 'values',
      value: regeneratorRuntime.mark(function values() {
        var i;
        return regeneratorRuntime.wrap(function values$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              i = 0;

            case 1:
              if (!(i < this._size)) {
                context$2$0.next = 7;
                break;
              }

              context$2$0.next = 4;
              return this[i];

            case 4:
              i++;
              context$2$0.next = 1;
              break;

            case 7:
            case 'end':
              return context$2$0.stop();
          }
        }, values, this);
      })

      /**
        Adds the model to the set or overwrites the existing
        model.
      */
    }, {
      key: 'addData',
      value: function addData(model) {
        var existing = this.getModel(model);
        var dest;
        if (existing) {
          dest = existing.copy();
          model.copyTo(dest);
        } else {
          // copy since the dest could be the model in the session
          dest = model.copy();
        }
        this.add(dest);
        return dest;
      }

      //
      // Backwards compat. methods
      //
    }, {
      key: 'addObjects',
      value: function addObjects(iterable) {
        if (typeof iterable.forEach === 'function') {
          iterable.forEach(function (item) {
            this.add(item);
          }, this);
        } else {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = iterable[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var item = _step.value;

              this.add(item);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
        return this;
      }
    }, {
      key: 'removeObjects',
      value: function removeObjects(iterable) {
        if (typeof iterable.forEach === 'function') {
          iterable.forEach(function (item) {
            this['delete'](item);
          }, this);
        } else {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = iterable[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var item = _step2.value;

              this['delete'](item);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
        return this;
      }
    }, {
      key: 'toArray',
      value: function toArray() {
        return (0, _array_from['default'])(this);
      }
    }, {
      key: 'size',
      get: function get() {
        return this._size;
      }
    }]);
    return ModelSet;
  })(_BaseClass2['default']);

  module.exports = ModelSet;

  var aliases = {
    'remove': 'delete',
    'contains': 'has',
    'addObject': 'add',
    'removeObject': 'delete',
    'getModel': 'get'
  };

  for (var alias in aliases) {
    if (!aliases.hasOwnProperty(alias)) continue;
    var target = aliases[alias];
    ModelSet.prototype[alias] = ModelSet.prototype[target];
  }

  // Make iterable
  Object.defineProperty(ModelSet.prototype, Symbol.iterator, {
    value: ModelSet.prototype.values,
    configurable: true,
    writable: true
  });
});


define('coalesce/collections/observable_array', ['exports', 'module', '../error', '../utils/copy', '../utils/array_from'], function (exports, module, _error, _utilsCopy, _utilsArray_from) {
  'use strict';

  var _Error = babelHelpers.interopRequireDefault(_error);

  var _copy2 = babelHelpers.interopRequireDefault(_utilsCopy);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var EMPTY = [],
      splice = Array.prototype.splice;

  /**
    Array subclass which implements a variety of mutation methods that
    support `arrayContentDidChange` and `arrayContentWillChange` hooks.
    
    @class ObservableArray
  */

  var ObservableArray = (function (_Array) {
    babelHelpers.inherits(ObservableArray, _Array);

    function ObservableArray() {
      babelHelpers.classCallCheck(this, ObservableArray);
      babelHelpers.get(Object.getPrototypeOf(ObservableArray.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(ObservableArray, [{
      key: 'clear',

      /**
        Remove all elements from the array. This is useful if you
        want to reuse an existing array without having to recreate it.
         ```javascript
        var colors = ["red", "green", "blue"];
        color.length();   //  3
        colors.clear();   //  []
        colors.length();  //  0
        ```
         @method clear
        @return {ObservableArray} An empty Array.
      */
      value: function clear() {
        var len = this.length;
        if (len === 0) return this;
        this.replace(0, len, EMPTY);
        return this;
      }

      /**
        This will use the primitive `replace()` method to insert an object at the
        specified index.
         ```javascript
        var colors = ["red", "green", "blue"];
        colors.insertAt(2, "yellow");  // ["red", "green", "yellow", "blue"]
        colors.insertAt(5, "orange");  // Error: Index out of range
        ```
         @method insertAt
        @param {Number} idx index of insert the object at.
        @param {Object} object object to insert
        @return {ObservableArray} receiver
      */
    }, {
      key: 'insertAt',
      value: function insertAt(idx, object) {
        if (idx > this.length) throw new _Error['default']("Index out of range");
        this.replace(idx, 0, [object]);
        return this;
      }

      /**
        Remove an object at the specified index using the `replace()` primitive
        method. You can pass either a single index, or a start and a length.
         If you pass a start and length that is beyond the
        length this method will throw an `OUT_OF_RANGE_EXCEPTION`.
         ```javascript
        var colors = ["red", "green", "blue", "yellow", "orange"];
        colors.removeAt(0);     // ["green", "blue", "yellow", "orange"]
        colors.removeAt(2, 2);  // ["green", "blue"]
        colors.removeAt(4, 2);  // Error: Index out of range
        ```
         @method removeAt
        @param {Number} start index, start of range
        @param {Number} len length of passing range
        @return {ObservableArray} receiver
      */
    }, {
      key: 'removeAt',
      value: function removeAt(start, len) {
        if ('number' === typeof start) {

          if (start < 0 || start >= this.length) {
            throw new _Error['default']("Index out of range");
          }

          // fast case
          if (len === undefined) len = 1;
          this.replace(start, len, EMPTY);
        }

        return this;
      }

      /**
        Push the object onto the end of the array. Works just like `push()` but it
        is KVO-compliant.
         ```javascript
        var colors = ["red", "green"];
        colors.pushObject("black");     // ["red", "green", "black"]
        colors.pushObject(["yellow"]);  // ["red", "green", ["yellow"]]
        ```
         @method pushObject
        @param {*} obj object to push
        @return object same object passed as a param
      */
    }, {
      key: 'pushObject',
      value: function pushObject(obj) {
        this.insertAt(this.length, obj);
        return obj;
      }

      /**
        Add the objects in the passed numerable to the end of the array. Defers
        notifying observers of the change until all objects are added.
         ```javascript
        var colors = ["red"];
        colors.pushObjects(["yellow", "orange"]);  // ["red", "yellow", "orange"]
        ```
         @method pushObjects
        @param {Array} objects the objects to add
        @return {ObservableArray} receiver
      */
    }, {
      key: 'pushObjects',
      value: function pushObjects(objects) {
        this.replace(this.length, 0, objects);
        return this;
      }

      /**
        Pop object from array or nil if none are left. Works just like `pop()` but
        it is KVO-compliant.
         ```javascript
        var colors = ["red", "green", "blue"];
        colors.popObject();   // "blue"
        console.log(colors);  // ["red", "green"]
        ```
         @method popObject
        @return object
      */
    }, {
      key: 'popObject',
      value: function popObject() {
        var len = this.length;
        if (len === 0) return null;

        var ret = this.objectAt(len - 1);
        this.removeAt(len - 1, 1);
        return ret;
      }

      /**
        Shift an object from start of array or nil if none are left. Works just
        like `shift()` but it is KVO-compliant.
         ```javascript
        var colors = ["red", "green", "blue"];
        colors.shiftObject();  // "red"
        console.log(colors);   // ["green", "blue"]
        ```
         @method shiftObject
        @return object
      */
    }, {
      key: 'shiftObject',
      value: function shiftObject() {
        if (this.length === 0) return null;
        var ret = this.objectAt(0);
        this.removeAt(0);
        return ret;
      }

      /**
        Unshift an object to start of array. Works just like `unshift()` but it is
        KVO-compliant.
         ```javascript
        var colors = ["red"];
        colors.unshiftObject("yellow");    // ["yellow", "red"]
        colors.unshiftObject(["black"]);   // [["black"], "yellow", "red"]
        ```
         @method unshiftObject
        @param {*} obj object to unshift
        @return object same object passed as a param
      */
    }, {
      key: 'unshiftObject',
      value: function unshiftObject(obj) {
        this.insertAt(0, obj);
        return obj;
      }

      /**
        Adds the named objects to the beginning of the array. Defers notifying
        observers until all objects have been added.
         ```javascript
        var colors = ["red"];
        colors.unshiftObjects(["black", "white"]);   // ["black", "white", "red"]
        colors.unshiftObjects("yellow"); // Type Error: 'undefined' is not a function
        ```
         @method unshiftObjects
        @param {Array} objects the objects to add
        @return {ObservableArray} receiver
      */
    }, {
      key: 'unshiftObjects',
      value: function unshiftObjects(objects) {
        this.replace(0, 0, objects);
        return this;
      }

      /**
        Reverse objects in the array. Works just like `reverse()` but it is
        KVO-compliant.
         @method reverseObjects
        @return {ObservableArray} receiver
       */
    }, {
      key: 'reverseObjects',
      value: function reverseObjects() {
        var len = this.length;
        if (len === 0) return this;
        var objects = this.toArray().reverse();
        this.replace(0, len, objects);
        return this;
      }
    }, {
      key: 'toArray',
      value: function toArray() {
        return (0, _array_from['default'])(this);
      }

      /**
        Replace all the the receiver's content with content of the argument.
        If argument is an empty array receiver will be cleared.
         ```javascript
        var colors = ["red", "green", "blue"];
        colors.setObjects(["black", "white"]);  // ["black", "white"]
        colors.setObjects([]);                  // []
        ```
         @method setObjects
        @param {ObservableArray} objects array whose content will be used for replacing
            the content of the receiver
        @return {ObservableArray} receiver with the new content
       */
    }, {
      key: 'setObjects',
      value: function setObjects(objects) {
        if (objects.length === 0) return this.clear();

        var len = this.length;
        this.replace(0, len, objects);
        return this;
      }

      /**
        Remove all occurances of an object in the array.
         ```javascript
        var cities = ["Chicago", "Berlin", "Lima", "Chicago"];
        cities.removeObject("Chicago");  // ["Berlin", "Lima"]
        cities.removeObject("Lima");     // ["Berlin"]
        cities.removeObject("Tokyo")     // ["Berlin"]
        ```
         @method removeObject
        @param {*} obj object to remove
        @return {ObservableArray} receiver
      */
    }, {
      key: 'removeObject',
      value: function removeObject(obj) {
        var loc = this.length || 0;
        while (--loc >= 0) {
          var curObject = this.objectAt(loc);
          if (curObject === obj) this.removeAt(loc);
        }
        return this;
      }

      /**
        Push the object onto the end of the array if it is not already
        present in the array.
         ```javascript
        var cities = ["Chicago", "Berlin"];
        cities.addObject("Lima");    // ["Chicago", "Berlin", "Lima"]
        cities.addObject("Berlin");  // ["Chicago", "Berlin", "Lima"]
        ```
         @method addObject
        @param {*} obj object to add, if not already present
        @return {ObservableArray} receiver
      */
    }, {
      key: 'addObject',
      value: function addObject(obj) {
        if (!this.contains(obj)) this.pushObject(obj);
        return this;
      }
    }, {
      key: 'objectAt',
      value: function objectAt(idx) {
        return this[idx];
      }

      /**
        Adds each object in the passed enumerable to the receiver.
         @method addObjects
        @param {Array} objects the objects to add.
        @return {Object} receiver
      */
    }, {
      key: 'addObjects',
      value: function addObjects(objects) {
        for (var i = objects.length - 1; i >= 0; i--) {
          this.addObject(objects[i]);
        }
        return this;
      }

      /**
        Removes each object in the passed enumerable from the receiver.
         @method removeObjects
        @param {Array} objects the objects to remove
        @return {Object} receiver
      */
    }, {
      key: 'removeObjects',
      value: function removeObjects(objects) {
        for (var i = objects.length - 1; i >= 0; i--) {
          this.removeObject(objects[i]);
        }
        return this;
      }

      // primitive for array support.
    }, {
      key: 'replace',
      value: (function (_replace) {
        function replace(_x, _x2, _x3) {
          return _replace.apply(this, arguments);
        }

        replace.toString = function () {
          return _replace.toString();
        };

        return replace;
      })(function (idx, amt, objects) {
        // if we replaced exactly the same number of items, then pass only the
        // replaced range. Otherwise, pass the full remaining array length
        // since everything has shifted
        var len = objects ? objects.length : 0;
        this.arrayContentWillChange(idx, amt, len);

        if (len === 0) {
          this.splice(idx, amt);
        } else {
          replace(this, idx, amt, objects);
        }

        this.arrayContentDidChange(idx, amt, len);
        return this;
      })

      // If browser did not implement indexOf natively, then override with
      // specialized version
    }, {
      key: 'indexOf',
      value: function indexOf(object, startAt) {
        var idx,
            len = this.length;

        if (startAt === undefined) startAt = 0;else startAt = startAt < 0 ? Math.ceil(startAt) : Math.floor(startAt);
        if (startAt < 0) startAt += len;

        for (idx = startAt; idx < len; idx++) {
          if (this[idx] === object) return idx;
        }
        return -1;
      }
    }, {
      key: 'lastIndexOf',
      value: function lastIndexOf(object, startAt) {
        var idx,
            len = this.length;

        if (startAt === undefined) startAt = len - 1;else startAt = startAt < 0 ? Math.ceil(startAt) : Math.floor(startAt);
        if (startAt < 0) startAt += len;

        for (idx = startAt; idx >= 0; idx--) {
          if (this[idx] === object) return idx;
        }
        return -1;
      }
    }, {
      key: 'copy',
      value: function copy(deep) {
        var arr;
        if (deep) {
          arr = this.map(function (item) {
            return (0, _copy2['default'])(item, true);
          });
        } else {
          arr = this.slice();
        }
        var res = new this.constructor();
        res.addObjects(arr);
        return res;
      }
    }, {
      key: 'contains',
      value: function contains(obj) {
        return this.indexOf(obj) >= 0;
      }
    }, {
      key: 'arrayContentWillChange',
      value: function arrayContentWillChange(index, removed, added) {}
    }, {
      key: 'arrayContentDidChange',
      value: function arrayContentDidChange(index, removed, added) {}
    }, {
      key: 'firstObject',
      get: function get() {
        return this.objectAt(0);
      }
    }, {
      key: 'lastObject',
      get: function get() {
        return this.objectAt(this.length - 1);
      }
    }]);
    return ObservableArray;
  })(Array);

  module.exports = ObservableArray;

  function replace(array, idx, amt, objects) {
    var args = [].concat(objects),
        chunk,
        ret = [],

    // https://code.google.com/p/chromium/issues/detail?id=56588
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
});


define('coalesce/context/base', ['exports', 'module', '../error', './config', './container'], function (exports, module, _error, _config, _container) {
  'use strict';

  var _Error = babelHelpers.interopRequireDefault(_error);

  var _Config = babelHelpers.interopRequireDefault(_config);

  var _Container = babelHelpers.interopRequireDefault(_container);

  var Base = (function () {
    function Base() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var container = arguments.length <= 1 || arguments[1] === undefined ? new _Container['default']() : arguments[1];
      babelHelpers.classCallCheck(this, Base);

      container.register('context:main', this, { instantiate: false });
      this.container = container;
      this._configs = {};
      this._setupContainer();
      if (config) {
        this.configure(config);
      }
    }

    babelHelpers.createClass(Base, [{
      key: 'typeFor',
      value: function typeFor(typeKey) {
        return this.configFor(typeKey).type;
      }
    }, {
      key: 'configFor',
      value: function configFor(typeKey) {
        typeKey = this._normalizeKey(typeKey);
        var config = this._configs[typeKey];
        if (!config) {
          config = this._configs[typeKey] = new _Config['default'](typeKey, this);
          if (config.type) {
            config.type.reify(this, typeKey);
          }
        }
        return config;
      }
    }, {
      key: 'configure',
      value: function configure(config) {
        var typeKey = arguments.length <= 1 || arguments[1] === undefined ? 'default' : arguments[1];

        for (var key in config) {
          if (!config.hasOwnProperty(key)) continue;
          var value = config[key];

          // the `types` config property is special and configures subtypes
          if (key === 'types') {
            this._configureTypes(config.types);
            continue;
          }

          // types are currently registered on the container under the `model`
          // namespace (e.g. model:post)
          if (key === 'class') {
            key = 'model';
          }

          this._register(typeKey, key, value);
        }
      }
    }, {
      key: '_normalizeKey',
      value: function _normalizeKey(key) {
        if (typeof key !== 'string') {
          key = key.typeKey;
        }
        console.assert(key, 'Unknown type \'' + key + '\'');
        return key;
      }
    }, {
      key: '_configureTypes',
      value: function _configureTypes(typesConfig) {
        for (var key in typesConfig) {
          if (!typesConfig.hasOwnProperty(key)) continue;
          var config = typesConfig[key];
          // support shorthand notation of just a class
          if (typeof config === 'function') {
            config = {
              'class': config
            };
          }
          var klass = config['class'];
          if (klass && !klass.typeKey) {
            klass.typeKey = key;
          }
          this.configure(config, key);
        }
      }
    }, {
      key: '_register',
      value: function _register(typeKey, type, value, opts) {
        var key = type + ':' + typeKey;
        return this.container.register(key, value);
      }
    }, {
      key: '_setupContainer',
      value: function _setupContainer() {
        // subclasses override
      }
    }]);
    return Base;
  })();

  module.exports = Base;
});


define("coalesce/context/config", ["exports", "module"], function (exports, module) {
  /**
    Per-type configuration object. Used to access the per-type adapter/serializer/etc.
  */
  "use strict";

  var Config = (function () {
    function Config(typeKey, context) {
      babelHelpers.classCallCheck(this, Config);

      this._typeKey = typeKey;
      this._context = context;
      this._container = context.container;
    }

    babelHelpers.createClass(Config, [{
      key: "get",
      value: function get(key) {
        var containerKey = key + ":" + this._typeKey,
            container = this._container;

        if (!container.has(containerKey)) {
          var defaultKey, Default;

          (function () {
            defaultKey = key + ":default";
            Default = container.lookupFactory(defaultKey);

            console.assert(Default, "No default '" + key + "' found");

            var Factory = (function (_Default) {
              babelHelpers.inherits(Factory, _Default);

              function Factory() {
                babelHelpers.classCallCheck(this, Factory);
                babelHelpers.get(Object.getPrototypeOf(Factory.prototype), "constructor", this).apply(this, arguments);
              }

              return Factory;
            })(Default);

            ;

            container.register(containerKey, Factory);
          })();
        }

        var value = this._container.lookup(containerKey);

        if (!value.typeKey) {
          value.typeKey = this._typeKey;
        }

        return value;
      }
    }, {
      key: "type",
      get: function get() {
        if (this._type !== undefined) {
          return this._type;
        }
        var Type = this._container.lookupFactory("model:" + this._typeKey);
        if (Type) {
          // Ember's container extends by default
          Type = Type.parentType;
        }
        return this._type = Type;
      }
    }]);
    return Config;
  })();

  module.exports = Config;
});


define('coalesce/context/container', ['exports', 'module', './inheriting_dict'], function (exports, module, _inheriting_dict) {
  'use strict';

  var _InheritingDict = babelHelpers.interopRequireDefault(_inheriting_dict);

  // A lightweight container that helps to assemble and decouple components.
  // Public api for the container is still in flux.
  // The public api, specified on the application namespace should be considered the stable api.
  function Container(parent) {
    this.parent = parent;
    this.children = [];

    this.resolver = parent && parent.resolver || function () {};

    this.registry = new _InheritingDict['default'](parent && parent.registry);
    this.cache = new _InheritingDict['default'](parent && parent.cache);
    this.factoryCache = new _InheritingDict['default'](parent && parent.factoryCache);
    this.resolveCache = new _InheritingDict['default'](parent && parent.resolveCache);
    this.typeInjections = new _InheritingDict['default'](parent && parent.typeInjections);
    this.injections = {};

    this.factoryTypeInjections = new _InheritingDict['default'](parent && parent.factoryTypeInjections);
    this.factoryInjections = {};

    this._options = new _InheritingDict['default'](parent && parent._options);
    this._typeOptions = new _InheritingDict['default'](parent && parent._typeOptions);
  }

  Container.prototype = {

    /**
      @property parent
      @type Container
      @default null
    */
    parent: null,

    /**
      @property children
      @type Array
      @default []
    */
    children: null,

    /**
      @property resolver
      @type function
    */
    resolver: null,

    /**
      @property registry
      @type InheritingDict
    */
    registry: null,

    /**
      @property cache
      @type InheritingDict
    */
    cache: null,

    /**
      @property typeInjections
      @type InheritingDict
    */
    typeInjections: null,

    /**
      @property injections
      @type Object
      @default {}
    */
    injections: null,

    /**
      @private
       @property _options
      @type InheritingDict
      @default null
    */
    _options: null,

    /**
      @private
       @property _typeOptions
      @type InheritingDict
    */
    _typeOptions: null,

    /**
      Returns a new child of the current container. These children are configured
      to correctly inherit from the current container.
       @method child
      @return {Container}
    */
    child: function child() {
      var container = new Container(this);
      this.children.push(container);
      return container;
    },

    /**
      Sets a key-value pair on the current container. If a parent container,
      has the same key, once set on a child, the parent and child will diverge
      as expected.
       @method set
      @param {Object} object
      @param {String} key
      @param {any} value
    */
    set: function set(object, key, value) {
      object[key] = value;
    },

    /**
      Registers a factory for later injection.
       Example:
       ```javascript
      var container = new Container();
       container.register('model:user', Person, {singleton: false });
      container.register('fruit:favorite', Orange);
      container.register('communication:main', Email, {singleton: false});
      ```
       @method register
      @param {String} fullName
      @param {Function} factory
      @param {Object} options
    */
    register: function register(fullName, factory, options) {
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

    /**
      Unregister a fullName
       ```javascript
      var container = new Container();
      container.register('model:user', User);
       container.lookup('model:user') instanceof User //=> true
       container.unregister('model:user')
      container.lookup('model:user') === undefined //=> true
      ```
       @method unregister
      @param {String} fullName
     */
    unregister: function unregister(fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');

      var normalizedName = this.normalize(fullName);

      this.registry.remove(normalizedName);
      this.cache.remove(normalizedName);
      this.factoryCache.remove(normalizedName);
      this.resolveCache.remove(normalizedName);
      this._options.remove(normalizedName);
    },

    /**
      Given a fullName return the corresponding factory.
       By default `resolve` will retrieve the factory from
      its container's registry.
       ```javascript
      var container = new Container();
      container.register('api:twitter', Twitter);
       container.resolve('api:twitter') // => Twitter
      ```
       Optionally the container can be provided with a custom resolver.
      If provided, `resolve` will first provide the custom resolver
      the opportunity to resolve the fullName, otherwise it will fallback
      to the registry.
       ```javascript
      var container = new Container();
      container.resolver = function(fullName) {
        // lookup via the module system of choice
      };
       // the twitter factory is added to the module system
      container.resolve('api:twitter') // => Twitter
      ```
       @method resolve
      @param {String} fullName
      @return {Function} fullName's factory
    */
    resolve: (function (_resolve) {
      function resolve(_x) {
        return _resolve.apply(this, arguments);
      }

      resolve.toString = function () {
        return _resolve.toString();
      };

      return resolve;
    })(function (fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return resolve(this, this.normalize(fullName));
    }),

    /**
      A hook that can be used to describe how the resolver will
      attempt to find the factory.
       @method describe
      @param {String} fullName
      @return {string} described fullName
    */
    describe: function describe(fullName) {
      return fullName;
    },

    /**
      A hook to enable custom fullName normalization behaviour
       @method normalize
      @param {String} fullName
      @return {string} normalized fullName
    */
    normalize: function normalize(fullName) {
      return fullName;
    },

    /**
      @method makeToString
       @param {any} factory
      @param {string} fullName
      @return {function} toString function
    */
    makeToString: function makeToString(factory, fullName) {
      return factory.toString();
    },

    /**
      Given a fullName return a corresponding instance.
       The default behaviour is for lookup to return a singleton instance.
      The singleton is scoped to the container, allowing multiple containers
      to all have their own locally scoped singletons.
       ```javascript
      var container = new Container();
      container.register('api:twitter', Twitter);
       var twitter = container.lookup('api:twitter');
       twitter instanceof Twitter; // => true
       // by default the container will return singletons
      var twitter2 = container.lookup('api:twitter');
      twitter2 instanceof Twitter; // => true
       twitter === twitter2; //=> true
      ```
       If singletons are not wanted an optional flag can be provided at lookup.
       ```javascript
      var container = new Container();
      container.register('api:twitter', Twitter);
       var twitter = container.lookup('api:twitter', { singleton: false });
      var twitter2 = container.lookup('api:twitter', { singleton: false });
       twitter === twitter2; //=> false
      ```
       @method lookup
      @param {String} fullName
      @param {Object} options
      @return {any}
    */
    lookup: (function (_lookup) {
      function lookup(_x2, _x3) {
        return _lookup.apply(this, arguments);
      }

      lookup.toString = function () {
        return _lookup.toString();
      };

      return lookup;
    })(function (fullName, options) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return lookup(this, this.normalize(fullName), options);
    }),

    /**
      Given a fullName return the corresponding factory.
       @method lookupFactory
      @param {String} fullName
      @return {any}
    */
    lookupFactory: function lookupFactory(fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return factoryFor(this, this.normalize(fullName));
    },

    /**
      Given a fullName check if the container is aware of its factory
      or singleton instance.
       @method has
      @param {String} fullName
      @return {Boolean}
    */
    has: (function (_has) {
      function has(_x4) {
        return _has.apply(this, arguments);
      }

      has.toString = function () {
        return _has.toString();
      };

      return has;
    })(function (fullName) {
      console.assert(validateFullName(fullName), 'fullName must be a proper full name');
      return has(this, this.normalize(fullName));
    }),

    /**
      Allow registering options for all factories of a type.
       ```javascript
      var container = new Container();
       // if all of type `connection` must not be singletons
      container.optionsForType('connection', { singleton: false });
       container.register('connection:twitter', TwitterConnection);
      container.register('connection:facebook', FacebookConnection);
       var twitter = container.lookup('connection:twitter');
      var twitter2 = container.lookup('connection:twitter');
       twitter === twitter2; // => false
       var facebook = container.lookup('connection:facebook');
      var facebook2 = container.lookup('connection:facebook');
       facebook === facebook2; // => false
      ```
       @method optionsForType
      @param {String} type
      @param {Object} options
    */
    optionsForType: function optionsForType(type, options) {
      if (this.parent) {
        illegalChildOperation('optionsForType');
      }

      this._typeOptions.set(type, options);
    },

    /**
      @method options
      @param {String} type
      @param {Object} options
    */
    options: function options(type, _options) {
      this.optionsForType(type, _options);
    },

    /**
      Used only via `injection`.
       Provides a specialized form of injection, specifically enabling
      all objects of one type to be injected with a reference to another
      object.
       For example, provided each object of type `controller` needed a `router`.
      one would do the following:
       ```javascript
      var container = new Container();
       container.register('router:main', Router);
      container.register('controller:user', UserController);
      container.register('controller:post', PostController);
       container.typeInjection('controller', 'router', 'router:main');
       var user = container.lookup('controller:user');
      var post = container.lookup('controller:post');
       user.router instanceof Router; //=> true
      post.router instanceof Router; //=> true
       // both controllers share the same router
      user.router === post.router; //=> true
      ```
       @private
      @method typeInjection
      @param {String} type
      @param {String} property
      @param {String} fullName
    */
    typeInjection: function typeInjection(type, property, fullName) {
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

    /**
      Defines injection rules.
       These rules are used to inject dependencies onto objects when they
      are instantiated.
       Two forms of injections are possible:
       * Injecting one fullName on another fullName
      * Injecting one fullName on a type
       Example:
       ```javascript
      var container = new Container();
       container.register('source:main', Source);
      container.register('model:user', User);
      container.register('model:post', Post);
       // injecting one fullName on another fullName
      // eg. each user model gets a post model
      container.injection('model:user', 'post', 'model:post');
       // injecting one fullName on another type
      container.injection('model', 'source', 'source:main');
       var user = container.lookup('model:user');
      var post = container.lookup('model:post');
       user.source instanceof Source; //=> true
      post.source instanceof Source; //=> true
       user.post instanceof Post; //=> true
       // and both models share the same source
      user.source === post.source; //=> true
      ```
       @method injection
      @param {String} factoryName
      @param {String} property
      @param {String} injectionName
    */
    injection: function injection(fullName, property, injectionName) {
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

    /**
      Used only via `factoryInjection`.
       Provides a specialized form of injection, specifically enabling
      all factory of one type to be injected with a reference to another
      object.
       For example, provided each factory of type `model` needed a `store`.
      one would do the following:
       ```javascript
      var container = new Container();
       container.register('store:main', SomeStore);
       container.factoryTypeInjection('model', 'store', 'store:main');
       var store = container.lookup('store:main');
      var UserFactory = container.lookupFactory('model:user');
       UserFactory.store instanceof SomeStore; //=> true
      ```
       @private
      @method factoryTypeInjection
      @param {String} type
      @param {String} property
      @param {String} fullName
    */
    factoryTypeInjection: function factoryTypeInjection(type, property, fullName) {
      if (this.parent) {
        illegalChildOperation('factoryTypeInjection');
      }

      addTypeInjection(this.factoryTypeInjections, type, property, this.normalize(fullName));
    },

    /**
      Defines factory injection rules.
       Similar to regular injection rules, but are run against factories, via
      `Container#lookupFactory`.
       These rules are used to inject objects onto factories when they
      are looked up.
       Two forms of injections are possible:
     * Injecting one fullName on another fullName
    * Injecting one fullName on a type
       Example:
       ```javascript
      var container = new Container();
       container.register('store:main', Store);
      container.register('store:secondary', OtherStore);
      container.register('model:user', User);
      container.register('model:post', Post);
       // injecting one fullName on another type
      container.factoryInjection('model', 'store', 'store:main');
       // injecting one fullName on another fullName
      container.factoryInjection('model:post', 'secondaryStore', 'store:secondary');
       var UserFactory = container.lookupFactory('model:user');
      var PostFactory = container.lookupFactory('model:post');
      var store = container.lookup('store:main');
       UserFactory.store instanceof Store; //=> true
      UserFactory.secondaryStore instanceof OtherStore; //=> false
       PostFactory.store instanceof Store; //=> true
      PostFactory.secondaryStore instanceof OtherStore; //=> true
       // and both models share the same source instance
      UserFactory.store === PostFactory.store; //=> true
      ```
       @method factoryInjection
      @param {String} factoryName
      @param {String} property
      @param {String} injectionName
    */
    factoryInjection: function factoryInjection(fullName, property, injectionName) {
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

    /**
      A depth first traversal, destroying the container, its descendant containers and all
      their managed objects.
       @method destroy
    */
    destroy: function destroy() {
      for (var i = 0, length = this.children.length; i < length; i++) {
        this.children[i].destroy();
      }

      this.children = [];

      eachDestroyable(this, function (item) {
        item.destroy();
      });

      this.parent = undefined;
      this.isDestroyed = true;
    },

    /**
      @method reset
    */
    reset: function reset() {
      for (var i = 0, length = this.children.length; i < length; i++) {
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

    var injection, injectable;

    for (var i = 0, length = injections.length; i < length; i++) {
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
      // TODO: think about a 'safe' merge style extension
      // for now just fallback to create time injection
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
        // assume the factory was extendable and is already injected
        return factory.create();
      } else {
        // assume the factory was extendable
        // to create time injections
        // TODO: support new'ing for instantiation and merge injections for pure JS Functions
        return factory.create(injectionsFor(container, fullName));
      }
    }
  }

  function eachDestroyable(container, callback) {
    container.cache.eachLocal(function (key, value) {
      if (option(container, key, 'instantiate') === false) {
        return;
      }
      callback(value);
    });
  }

  function resetCache(container) {
    container.cache.eachLocal(function (key, value) {
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
    injections.push({ property: property, fullName: injectionName });
  }

  module.exports = Container;
});


define('coalesce/context/default', ['exports', 'module', '../id_manager', '../merge/per_field', '../model/errors', '../serializers/belongs_to', '../serializers/boolean', '../serializers/date', '../serializers/has_many', '../serializers/id', '../serializers/model', '../serializers/number', '../serializers/revision', '../serializers/string', '../session/model_cache', '../session/query_cache', '../session/session', './base'], function (exports, module, _id_manager, _mergePer_field, _modelErrors, _serializersBelongs_to, _serializersBoolean, _serializersDate, _serializersHas_many, _serializersId, _serializersModel, _serializersNumber, _serializersRevision, _serializersString, _sessionModel_cache, _sessionQuery_cache, _sessionSession, _base) {
  'use strict';

  var _IdManager = babelHelpers.interopRequireDefault(_id_manager);

  var _PerField = babelHelpers.interopRequireDefault(_mergePer_field);

  var _Errors = babelHelpers.interopRequireDefault(_modelErrors);

  var _BelongsToSerializer = babelHelpers.interopRequireDefault(_serializersBelongs_to);

  var _BooleanSerializer = babelHelpers.interopRequireDefault(_serializersBoolean);

  var _DateSerializer = babelHelpers.interopRequireDefault(_serializersDate);

  var _HasManySerializer = babelHelpers.interopRequireDefault(_serializersHas_many);

  var _IdSerializer = babelHelpers.interopRequireDefault(_serializersId);

  var _ModelSerializer = babelHelpers.interopRequireDefault(_serializersModel);

  var _NumberSerializer = babelHelpers.interopRequireDefault(_serializersNumber);

  var _RevisionSerializer = babelHelpers.interopRequireDefault(_serializersRevision);

  var _StringSerializer = babelHelpers.interopRequireDefault(_serializersString);

  var _ModelCache = babelHelpers.interopRequireDefault(_sessionModel_cache);

  var _QueryCache = babelHelpers.interopRequireDefault(_sessionQuery_cache);

  var _Session = babelHelpers.interopRequireDefault(_sessionSession);

  var _Base2 = babelHelpers.interopRequireDefault(_base);

  /**
    Default context with sensible default configuration
  */

  var Context = (function (_Base) {
    babelHelpers.inherits(Context, _Base);

    function Context() {
      babelHelpers.classCallCheck(this, Context);
      babelHelpers.get(Object.getPrototypeOf(Context.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(Context, [{
      key: 'newSession',
      value: function newSession() {
        return this.container.lookup('session:default');
      }
    }, {
      key: '_setupContainer',
      value: function _setupContainer() {
        babelHelpers.get(Object.getPrototypeOf(Context.prototype), '_setupContainer', this).call(this);
        var container = this.container;
        container.register('model:errors', _Errors['default']);
        this._setupSession(container);
        this._setupInjections(container);
        this._setupSerializers(container);
        this._setupMergeStrategies(container);
        this._setupCaches(container);
      }
    }, {
      key: '_setupSession',
      value: function _setupSession(container) {
        container.register('session:default', container.lookupFactory('session:application') || _Session['default'], { singleton: false });
        container.register('session:main', container.lookupFactory('session:application') || _Session['default']);
        container.register('idManager:default', _IdManager['default']);
      }
    }, {
      key: '_setupInjections',
      value: function _setupInjections(container) {
        container.typeInjection('session', 'context', 'context:main');
        container.typeInjection('serializer', 'context', 'context:main');
        container.typeInjection('adapter', 'context', 'context:main');

        container.typeInjection('serializer', 'idManager', 'idManager:default');
        container.typeInjection('session', 'idManager', 'idManager:default');
        container.typeInjection('adapter', 'idManager', 'idManager:default');
      }
    }, {
      key: '_setupSerializers',
      value: function _setupSerializers(container) {
        container.register('serializer:default', _ModelSerializer['default']);

        container.register('serializer:belongs-to', _BelongsToSerializer['default']);
        container.register('serializer:boolean', _BooleanSerializer['default']);
        container.register('serializer:date', _DateSerializer['default']);
        container.register('serializer:has-many', _HasManySerializer['default']);
        container.register('serializer:id', _IdSerializer['default']);
        container.register('serializer:number', _NumberSerializer['default']);
        container.register('serializer:revision', _RevisionSerializer['default']);
        container.register('serializer:string', _StringSerializer['default']);
      }
    }, {
      key: '_setupMergeStrategies',
      value: function _setupMergeStrategies(container) {
        container.register('mergeStrategy:default', _PerField['default']);
      }
    }, {
      key: '_setupCaches',
      value: function _setupCaches(container) {
        container.register('queryCache:default', _QueryCache['default']);
        container.register('modelCache:default', _ModelCache['default']);
      }
    }, {
      key: 'session',
      get: function get() {
        return this.container.lookup('session:main');
      }
    }]);
    return Context;
  })(_Base2['default']);

  module.exports = Context;
});


define("coalesce/context/inheriting_dict", ["exports", "module"], function (exports, module) {
  // A safe and simple inheriting object.
  "use strict";

  function InheritingDict(parent) {
    this.parent = parent;
    this.dict = {};
  }

  InheritingDict.prototype = {

    /**
      @property parent
      @type InheritingDict
      @default null
    */

    parent: null,

    /**
      Object used to store the current nodes data.
       @property dict
      @type Object
      @default Object
    */
    dict: null,

    /**
      Retrieve the value given a key, if the value is present at the current
      level use it, otherwise walk up the parent hierarchy and try again. If
      no matching key is found, return undefined.
       @method get
      @param {String} key
      @return {any}
    */
    get: function get(key) {
      var dict = this.dict;

      if (dict.hasOwnProperty(key)) {
        return dict[key];
      }

      if (this.parent) {
        return this.parent.get(key);
      }
    },

    /**
      Set the given value for the given key, at the current level.
       @method set
      @param {String} key
      @param {Any} value
    */
    set: function set(key, value) {
      this.dict[key] = value;
    },

    /**
      Delete the given key
       @method remove
      @param {String} key
    */
    remove: function remove(key) {
      delete this.dict[key];
    },

    /**
      Check for the existence of given a key, if the key is present at the current
      level return true, otherwise walk up the parent hierarchy and try again. If
      no matching key is found, return false.
       @method has
      @param {String} key
      @return {Boolean}
    */
    has: function has(key) {
      var dict = this.dict;

      if (dict.hasOwnProperty(key)) {
        return true;
      }

      if (this.parent) {
        return this.parent.has(key);
      }

      return false;
    },

    /**
      Iterate and invoke a callback for each local key-value pair.
       @method eachLocal
      @param {Function} callback
      @param {Object} binding
    */
    eachLocal: function eachLocal(callback, binding) {
      var dict = this.dict;

      for (var prop in dict) {
        if (dict.hasOwnProperty(prop)) {
          callback.call(binding, prop, dict[prop]);
        }
      }
    }
  };

  module.exports = InheritingDict;
});


define('coalesce/error', ['exports', 'module'], function (exports, module) {
  'use strict';

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  /**
    A subclass of the JavaScript Error object for use in Coalesce.
  
    @class Error
    @extends Error
    @constructor
  */
  function CsError() {
    var tmp = Error.apply(this, arguments);

    // Adds a `stack` property to the given error object that will yield the
    // stack trace at the time captureStackTrace was called.
    // When collecting the stack trace all frames above the topmost call
    // to this function, including that call, will be left out of the
    // stack trace.
    // This is useful because we can hide Coalesce implementation details
    // that are not very helpful for the user.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CsError);
    }
    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }
  }

  CsError.prototype = Object.create(Error.prototype);

  module.exports = CsError;
});


define('coalesce/id_manager', ['exports', 'module', './utils/base_class'], function (exports, module, _utilsBase_class) {
  'use strict';

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  var uuid = 1;

  /**
    This class is responsible for maintaining a centralized mapping
    between client-side identifiers (`clientId`) and server-side
    identifiers (`id`).
  
    @class IdManager
  */

  var IdManager = (function (_BaseClass) {
    babelHelpers.inherits(IdManager, _BaseClass);

    function IdManager() {
      babelHelpers.classCallCheck(this, IdManager);

      babelHelpers.get(Object.getPrototypeOf(IdManager.prototype), 'constructor', this).call(this);
      this.idMaps = {};
    }

    /**
      Three possible cases:
       1. The model already has a clientId and an id.
         Make sure the clientId maps to the id.
       2. The model has no id or clientId. The model must be a new
         record. Generate a clientId and set on the model.
       3. The model has and id but no clientId. Generate a new clientId,
         update the mapping, and assign it to the model.
    */
    babelHelpers.createClass(IdManager, [{
      key: 'reifyClientId',
      value: function reifyClientId(model) {
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
        } // else NO-OP, nothing to do if they already have a clientId and no id
        return clientId;
      }
    }, {
      key: 'getClientId',
      value: function getClientId(typeKey, id) {
        var idMap = this.idMaps[typeKey];
        return idMap && idMap[id + ''];
      }
    }, {
      key: '_generateClientId',
      value: function _generateClientId(typeKey) {
        return typeKey + uuid++;
      }
    }]);
    return IdManager;
  })(_BaseClass2['default']);

  module.exports = IdManager;
});


define('coalesce/index', ['exports', 'module', './active_model/adapter', './active_model/context', './active_model/serializers/model', './adapter', './collections/has_many_array', './collections/model_array', './collections/model_set', './context/default', './id_manager', './merge/base', './merge/per_field', './model/diff', './model/errors', './model/model', './namespace', './rest/adapter', './rest/context', './rest/payload', './rest/serializers/errors', './rest/serializers/payload', './serializers/base', './serializers/belongs_to', './serializers/boolean', './serializers/date', './serializers/has_many', './serializers/id', './serializers/model', './serializers/number', './serializers/revision', './serializers/string', './session/collection_manager', './session/inverse_manager', './session/model_cache', './session/query_cache', './session/session', './utils/inflector', './utils/is_equal'], function (exports, module, _active_modelAdapter, _active_modelContext, _active_modelSerializersModel, _adapter, _collectionsHas_many_array, _collectionsModel_array, _collectionsModel_set, _contextDefault, _id_manager, _mergeBase, _mergePer_field, _modelDiff, _modelErrors, _modelModel, _namespace, _restAdapter, _restContext, _restPayload, _restSerializersErrors, _restSerializersPayload, _serializersBase, _serializersBelongs_to, _serializersBoolean, _serializersDate, _serializersHas_many, _serializersId, _serializersModel, _serializersNumber, _serializersRevision, _serializersString, _sessionCollection_manager, _sessionInverse_manager, _sessionModel_cache, _sessionQuery_cache, _sessionSession, _utilsInflector, _utilsIs_equal) {
  'use strict';

  var _ActiveModelAdapter = babelHelpers.interopRequireDefault(_active_modelAdapter);

  var _ActiveModelContext = babelHelpers.interopRequireDefault(_active_modelContext);

  var _ActiveModelSerializer = babelHelpers.interopRequireDefault(_active_modelSerializersModel);

  var _Adapter = babelHelpers.interopRequireDefault(_adapter);

  var _HasManyArray = babelHelpers.interopRequireDefault(_collectionsHas_many_array);

  var _ModelArray = babelHelpers.interopRequireDefault(_collectionsModel_array);

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _Context = babelHelpers.interopRequireDefault(_contextDefault);

  var _IdManager = babelHelpers.interopRequireDefault(_id_manager);

  var _MergeStrategy = babelHelpers.interopRequireDefault(_mergeBase);

  var _PerField = babelHelpers.interopRequireDefault(_mergePer_field);

  var _Errors = babelHelpers.interopRequireDefault(_modelErrors);

  var _Model = babelHelpers.interopRequireDefault(_modelModel);

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _RestAdapter = babelHelpers.interopRequireDefault(_restAdapter);

  var _RestContext = babelHelpers.interopRequireDefault(_restContext);

  var _Payload = babelHelpers.interopRequireDefault(_restPayload);

  var _RestErrorsSerializer = babelHelpers.interopRequireDefault(_restSerializersErrors);

  var _PayloadSerializer = babelHelpers.interopRequireDefault(_restSerializersPayload);

  var _Serializer = babelHelpers.interopRequireDefault(_serializersBase);

  var _BelongsToSerializer = babelHelpers.interopRequireDefault(_serializersBelongs_to);

  var _BooleanSerializer = babelHelpers.interopRequireDefault(_serializersBoolean);

  var _DateSerializer = babelHelpers.interopRequireDefault(_serializersDate);

  var _HasManySerializer = babelHelpers.interopRequireDefault(_serializersHas_many);

  var _IdSerializer = babelHelpers.interopRequireDefault(_serializersId);

  var _ModelSerializer = babelHelpers.interopRequireDefault(_serializersModel);

  var _NumberSerializer = babelHelpers.interopRequireDefault(_serializersNumber);

  var _RevisionSerializer = babelHelpers.interopRequireDefault(_serializersRevision);

  var _StringSerializer = babelHelpers.interopRequireDefault(_serializersString);

  var _CollectionManager = babelHelpers.interopRequireDefault(_sessionCollection_manager);

  var _InverseManager = babelHelpers.interopRequireDefault(_sessionInverse_manager);

  var _ModelCache = babelHelpers.interopRequireDefault(_sessionModel_cache);

  var _QueryCache = babelHelpers.interopRequireDefault(_sessionQuery_cache);

  var _Session = babelHelpers.interopRequireDefault(_sessionSession);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  _Coalesce['default'].Context = _Context['default'];

  _Coalesce['default'].Adapter = _Adapter['default'];
  _Coalesce['default'].IdManager = _IdManager['default'];

  _Coalesce['default'].ModelArray = _ModelArray['default'];
  _Coalesce['default'].ModelSet = _ModelSet['default'];
  _Coalesce['default'].HasManyArray = _HasManyArray['default'];

  _Coalesce['default'].MergeStrategy = _MergeStrategy['default'];
  _Coalesce['default'].PerField = _PerField['default'];

  _Coalesce['default'].Model = _Model['default'];
  _Coalesce['default'].Errors = _Errors['default'];

  _Coalesce['default'].RestContext = _RestContext['default'];
  _Coalesce['default'].RestErrorsSerializer = _RestErrorsSerializer['default'];
  _Coalesce['default'].PayloadSerializer = _PayloadSerializer['default'];
  _Coalesce['default'].Payload = _Payload['default'];
  _Coalesce['default'].RestAdapter = _RestAdapter['default'];

  _Coalesce['default'].ActiveModelContext = _ActiveModelContext['default'];
  _Coalesce['default'].ActiveModelAdapter = _ActiveModelAdapter['default'];
  _Coalesce['default'].ActiveModelSerializer = _ActiveModelSerializer['default'];

  _Coalesce['default'].Serializer = _Serializer['default'];
  _Coalesce['default'].BelongsToSerializer = _BelongsToSerializer['default'];
  _Coalesce['default'].BooleanSerializer = _BooleanSerializer['default'];
  _Coalesce['default'].DateSerializer = _DateSerializer['default'];
  _Coalesce['default'].HasManySerializer = _HasManySerializer['default'];
  _Coalesce['default'].IdSerializer = _IdSerializer['default'];
  _Coalesce['default'].NumberSerializer = _NumberSerializer['default'];
  _Coalesce['default'].ModelSerializer = _ModelSerializer['default'];
  _Coalesce['default'].RevisionSerializer = _RevisionSerializer['default'];
  _Coalesce['default'].StringSerializer = _StringSerializer['default'];

  _Coalesce['default'].CollectionManager = _CollectionManager['default'];
  _Coalesce['default'].InverseManager = _InverseManager['default'];
  _Coalesce['default'].Session = _Session['default'];
  _Coalesce['default'].QueryCache = _QueryCache['default'];
  _Coalesce['default'].ModelCache = _ModelCache['default'];

  _Coalesce['default'].pluralize = _utilsInflector.pluralize;
  _Coalesce['default'].singularize = _utilsInflector.singularize;

  _Coalesce['default'].isEqual = _isEqual['default'];

  module.exports = _Coalesce['default'];
});


define('coalesce/merge/base', ['exports', 'module', '../utils/base_class'], function (exports, module, _utilsBase_class) {
  'use strict';

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  /**
    Abstract base class for a three-way `Model` merge implementation.
  
    @namespace merge
    @class Base
  */

  var Base = (function (_BaseClass) {
    babelHelpers.inherits(Base, _BaseClass);

    function Base() {
      babelHelpers.classCallCheck(this, Base);
      babelHelpers.get(Object.getPrototypeOf(Base.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(Base, [{
      key: 'merge',
      value: function merge(ours, ancestor, theirs) {
        // Not Implemented
      }
    }]);
    return Base;
  })(_BaseClass2['default']);

  module.exports = Base;
});


define('coalesce/merge/per_field', ['exports', 'module', './base', '../collections/model_set', '../utils/is_equal', '../utils/copy'], function (exports, module, _base, _collectionsModel_set, _utilsIs_equal, _utilsCopy) {
  'use strict';

  var _Base2 = babelHelpers.interopRequireDefault(_base);

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  var _copy = babelHelpers.interopRequireDefault(_utilsCopy);

  /**
    Merge strategy that merges on a per-field basis.
  
    Fields which have been editted by both will
    default to "ours".
  
    Fields which do not have an ancestor will default to
    "theirs".
  
    @namespace merge
    @class PerField
  */

  var PerField = (function (_Base) {
    babelHelpers.inherits(PerField, _Base);

    function PerField() {
      babelHelpers.classCallCheck(this, PerField);
      babelHelpers.get(Object.getPrototypeOf(PerField.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(PerField, [{
      key: 'merge',
      value: function merge(ours, ancestor, theirs) {
        this.mergeAttributes(ours, ancestor, theirs);
        this.mergeRelationships(ours, ancestor, theirs);
        return ours;
      }
    }, {
      key: 'mergeAttributes',
      value: function mergeAttributes(ours, ancestor, theirs) {
        ours.eachAttribute(function (name, meta) {
          this.mergeProperty(ours, ancestor, theirs, name);
        }, this);
      }
    }, {
      key: 'mergeRelationships',
      value: function mergeRelationships(ours, ancestor, theirs) {
        var session = this.session;
        ours.eachRelationship(function (name, relationship) {
          if (relationship.kind === 'belongsTo') {
            this.mergeBelongsTo(ours, ancestor, theirs, name);
          } else if (relationship.kind === 'hasMany') {
            this.mergeHasMany(ours, ancestor, theirs, name);
          }
        }, this);
      }
    }, {
      key: 'mergeBelongsTo',
      value: function mergeBelongsTo(ours, ancestor, theirs, name) {
        this.mergeProperty(ours, ancestor, theirs, name);
      }
    }, {
      key: 'mergeHasMany',
      value: function mergeHasMany(ours, ancestor, theirs, name) {
        this.mergeProperty(ours, ancestor, theirs, name);
      }
    }, {
      key: 'mergeProperty',
      value: function mergeProperty(ours, ancestor, theirs, name) {
        var oursValue = ours[name],
            ancestorValue = ancestor[name],
            theirsValue = theirs[name];

        if (!ours.isFieldLoaded(name)) {
          if (theirs.isFieldLoaded(name)) {
            ours[name] = (0, _copy['default'])(theirsValue);
          }
          return;
        }
        if (!theirs.isFieldLoaded(name) || (0, _isEqual['default'])(oursValue, theirsValue)) {
          return;
        }
        // if the ancestor does not have the property loaded we are
        // performing a two-way merge and we just pick theirs
        if (!ancestor.isFieldLoaded(name) || (0, _isEqual['default'])(oursValue, ancestorValue)) {
          ours[name] = (0, _copy['default'])(theirsValue);
        } else {
          // NO-OP
        }
      }
    }]);
    return PerField;
  })(_Base2['default']);

  module.exports = PerField;
});


define('coalesce/model/attribute', ['exports', 'module', './field', '../utils/is_equal'], function (exports, module, _field, _utilsIs_equal) {
  'use strict';

  var _Field2 = babelHelpers.interopRequireDefault(_field);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  var Attribute = (function (_Field) {
    babelHelpers.inherits(Attribute, _Field);

    function Attribute() {
      babelHelpers.classCallCheck(this, Attribute);
      babelHelpers.get(Object.getPrototypeOf(Attribute.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(Attribute, [{
      key: 'defineProperty',
      value: function defineProperty(prototype) {
        var name = this.name;
        Object.defineProperty(prototype, name, {
          enumerable: true,
          configurable: true,
          get: function get() {
            return this._attributes[name];
          },
          set: function set(value) {
            var oldValue = this._attributes[name];
            if ((0, _isEqual['default'])(oldValue, value)) return;
            this.attributeWillChange(name);
            this._attributes[name] = value;
            this.attributeDidChange(name);
            return value;
          }
        });
      }
    }, {
      key: 'kind',
      get: function get() {
        return 'attribute';
      }
    }]);
    return Attribute;
  })(_Field2['default']);

  module.exports = Attribute;
});


define('coalesce/model/belongs_to', ['exports', 'module', './relationship', '../utils/is_equal'], function (exports, module, _relationship, _utilsIs_equal) {
  'use strict';

  var _Relationship2 = babelHelpers.interopRequireDefault(_relationship);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  var BelongsTo = (function (_Relationship) {
    babelHelpers.inherits(BelongsTo, _Relationship);

    function BelongsTo() {
      babelHelpers.classCallCheck(this, BelongsTo);
      babelHelpers.get(Object.getPrototypeOf(BelongsTo.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(BelongsTo, [{
      key: 'defineProperty',
      value: function defineProperty(prototype) {
        var name = this.name,
            embedded = this.embedded;
        Object.defineProperty(prototype, name, {
          enumerable: true,
          configurable: true,
          get: function get() {
            var value = this._relationships[name],
                session = this.session;
            if (session && value && value.session !== session) {
              value = this._relationships[name] = this.session.add(value);
            }
            return value;
          },
          set: function set(value) {
            var oldValue = this._relationships[name];
            if (oldValue === value) return;
            this.belongsToWillChange(name);
            var session = this.session;
            if (session) {
              session.modelWillBecomeDirty(this);
              if (value) {
                value = session.add(value);
              }
            }
            if (value && embedded) {
              value._parent = this;
            }
            this._relationships[name] = value;
            this.belongsToDidChange(name);
            return value;
          }
        });
      }
    }]);
    return BelongsTo;
  })(_Relationship2['default']);

  module.exports = BelongsTo;
});


define('coalesce/model/diff', ['exports', './model', '../collections/model_set'], function (exports, _model, _collectionsModel_set) {
  'use strict';

  var _Model = babelHelpers.interopRequireDefault(_model);

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  _Model['default'].reopen({

    diff: function diff(model) {
      var diffs = [];

      this.eachLoadedAttribute(function (name, meta) {
        var left = this[name];
        var right = model[name];

        if (left && typeof left.diff === 'function' && right && typeof right.diff === 'function') {
          if (left.diff(right).length > 0) {
            diffs.push({ type: 'attr', name: name });
          }
          return;
        }

        if (left && right && typeof left === 'object' && typeof right === 'object') {
          if (JSON.stringify(left) !== JSON.stringify(right)) {
            diffs.push({ type: 'attr', name: name });
          }
          return;
        }

        if (left instanceof Date && right instanceof Date) {
          left = left.getTime();
          right = right.getTime();
        }
        if (left !== right) {
          diffs.push({ type: 'attr', name: name });
        }
      }, this);

      this.eachLoadedRelationship(function (name, relationship) {
        var left = this[name];
        var right = model[name];
        if (relationship.kind === 'belongsTo') {
          if (left && right) {
            if (!left.isEqual(right)) {
              diffs.push({ type: 'belongsTo', name: name, relationship: relationship, oldValue: right });
            }
          } else if (left || right) {
            diffs.push({ type: 'belongsTo', name: name, relationship: relationship, oldValue: right });
          }
        } else if (relationship.kind === 'hasMany') {
          var dirty = false;
          var cache = new _ModelSet['default']();
          left.forEach(function (model) {
            cache.add(model);
          });
          right.forEach(function (model) {
            if (dirty) return;
            if (!cache.contains(model)) {
              dirty = true;
            } else {
              cache.remove(model);
            }
          });
          if (dirty || cache.length > 0) {
            diffs.push({ type: 'hasMany', name: name, relationship: relationship });
          }
        }
      }, this);

      return diffs;
    }

  });
});


define('coalesce/model/errors', ['exports', 'module', '../utils/base_class'], function (exports, module, _utilsBase_class) {
  'use strict';

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  var Errors = (function (_BaseClass) {
    babelHelpers.inherits(Errors, _BaseClass);
    babelHelpers.createClass(Errors, [{
      key: 'set',
      value: function set(name, value) {
        this[name] = value;
      }
    }]);

    function Errors() {
      var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      babelHelpers.classCallCheck(this, Errors);

      babelHelpers.get(Object.getPrototypeOf(Errors.prototype), 'constructor', this).call(this);
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        this[key] = obj[key];
      }
    }

    babelHelpers.createClass(Errors, [{
      key: 'forEach',
      value: function forEach(callback, binding) {
        for (var key in this) {
          if (!this.hasOwnProperty(key)) continue;
          callback.call(binding, this[key], key);
        }
      }
    }, {
      key: 'copy',
      value: function copy() {
        return new this.constructor(this);
      }
    }]);
    return Errors;
  })(_BaseClass2['default']);

  module.exports = Errors;
});


define("coalesce/model/field", ["exports", "module"], function (exports, module) {
  /**
    Abstract base class for attributes and relationships
    @class Field
  */
  "use strict";

  var Field = function Field(name, options) {
    babelHelpers.classCallCheck(this, Field);

    this.name = name;
    for (var key in options) {
      if (!options.hasOwnProperty(key)) continue;
      this[key] = options[key];
    }
  };

  module.exports = Field;
});


define('coalesce/model/has_many', ['exports', 'module', '../collections/has_many_array', '../namespace', '../utils/copy', '../utils/is_equal', './relationship'], function (exports, module, _collectionsHas_many_array, _namespace, _utilsCopy, _utilsIs_equal, _relationship) {
  'use strict';

  var _HasManyArray = babelHelpers.interopRequireDefault(_collectionsHas_many_array);

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _copy = babelHelpers.interopRequireDefault(_utilsCopy);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  var _Relationship2 = babelHelpers.interopRequireDefault(_relationship);

  var defaults = _.defaults;

  var HasMany = (function (_Relationship) {
    babelHelpers.inherits(HasMany, _Relationship);

    function HasMany(name, options) {
      babelHelpers.classCallCheck(this, HasMany);

      defaults(options, { collectionType: _HasManyArray['default'] });
      babelHelpers.get(Object.getPrototypeOf(HasMany.prototype), 'constructor', this).call(this, name, options);
    }

    babelHelpers.createClass(HasMany, [{
      key: 'defineProperty',
      value: function defineProperty(prototype) {
        var name = this.name,
            CollectionType = this.collectionType,
            embedded = this.embedded;
        Object.defineProperty(prototype, name, {
          enumerable: true,
          configurable: true,
          get: function get() {
            var value = this._relationships[name];
            if (this.isNew && !value) {
              var content = value;
              value = this._relationships[name] = new CollectionType();
              value.owner = this;
              value.name = name;
              value.embedded = embedded;
              if (content) {
                value.addObjects(content);
              }
            }
            if (value && value.needsReification && value.reify && this.session) {
              value.reify();
              value.needsReification = false;
            }
            return value;
          },
          set: function set(value) {
            var oldValue = this._relationships[name];
            if (oldValue === value) return;
            if (value && value instanceof CollectionType) {
              // XXX: this logic might not be necessary without Ember
              // need to copy since this content is being listened to
              value = (0, _copy['default'])(value);
            }
            if (oldValue && oldValue instanceof CollectionType) {
              oldValue.clear();
              if (value) {
                oldValue.addObjects(value);
              }
            } else {
              this.hasManyWillChange(name);

              var content = value;
              value = this._relationships[name] = new CollectionType();
              value.owner = this;
              value.name = name;
              value.embedded = embedded;
              if (content) {
                value.addObjects(content);
              }
              this.hasManyDidChange(name);
            }
            return value;
          }
        });
      }
    }]);
    return HasMany;
  })(_Relationship2['default']);

  module.exports = HasMany;
});


define('coalesce/model/model', ['exports', 'module', '../collections/model_set', '../error', '../namespace', '../utils/base_class', '../utils/copy', '../utils/inflector', '../utils/is_equal', '../utils/lazy_copy', './attribute', './belongs_to', './field', './has_many'], function (exports, module, _collectionsModel_set, _error, _namespace, _utilsBase_class, _utilsCopy, _utilsInflector, _utilsIs_equal, _utilsLazy_copy, _attribute, _belongs_to, _field, _has_many) {
  'use strict';

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _Error = babelHelpers.interopRequireDefault(_error);

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  var _copy = babelHelpers.interopRequireDefault(_utilsCopy);

  var _isEqual = babelHelpers.interopRequireDefault(_utilsIs_equal);

  var _lazyCopy = babelHelpers.interopRequireDefault(_utilsLazy_copy);

  var _Attribute = babelHelpers.interopRequireDefault(_attribute);

  var _BelongsTo = babelHelpers.interopRequireDefault(_belongs_to);

  var _Field = babelHelpers.interopRequireDefault(_field);

  var _HasMany = babelHelpers.interopRequireDefault(_has_many);

  var Model = (function (_BaseClass) {
    babelHelpers.inherits(Model, _BaseClass);
    babelHelpers.createClass(Model, [{
      key: 'id',
      get: function get() {
        return getMeta.call(this, 'id');
      },
      set: function set(value) {
        return setMeta.call(this, 'id', value);
      }
    }, {
      key: 'clientId',
      get: function get() {
        return getMeta.call(this, 'clientId');
      },
      set: function set(value) {
        return setMeta.call(this, 'clientId', value);
      }
    }, {
      key: 'rev',
      get: function get() {
        return getMeta.call(this, 'rev');
      },
      set: function set(value) {
        return setMeta.call(this, 'rev', value);
      }
    }, {
      key: 'clientRev',
      get: function get() {
        return getMeta.call(this, 'clientRev');
      },
      set: function set(value) {
        return setMeta.call(this, 'clientRev', value);
      }
    }, {
      key: 'isDeleted',
      get: function get() {
        return getMeta.call(this, 'isDeleted');
      },
      set: function set(value) {
        return setMeta.call(this, 'isDeleted', value);
      }
    }, {
      key: 'errors',
      get: function get() {
        return getMeta.call(this, 'errors');
      },
      set: function set(value) {
        return setMeta.call(this, 'errors', value);
      }
    }, {
      key: 'isModel',
      get: function get() {
        return true;
      }
    }, {
      key: 'session',
      get: function get() {
        return this._session;
      },
      set: function set(value) {
        console.assert(!this._session || this._session === value, "Cannot re-assign a model's session");
        this._session = value;
      }
    }]);

    function Model(fields) {
      babelHelpers.classCallCheck(this, Model);

      babelHelpers.get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this);
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
        if (!fields.hasOwnProperty(name)) continue;
        this[name] = fields[name];
      }
    }

    /**
      The embedded parent of this model.
      @private
    */

    /**
      Increase the client rev number
    */
    babelHelpers.createClass(Model, [{
      key: 'bump',
      value: function bump() {
        return ++this.clientRev;
      }

      /**
        Two models are "equal" when they correspond to the same
        key. This does not mean they necessarily have the same data.
      */
    }, {
      key: 'isEqual',
      value: function isEqual(model) {
        if (!model) return false;
        var clientId = this.clientId;
        var otherClientId = model.clientId;
        if (clientId && otherClientId) {
          return clientId === otherClientId;
        }
        // in most cases clientIds will always be set, however
        // during serialization this might not be the case
        var id = this.id;
        var otherId = model.id;
        return this instanceof model.constructor && id === otherId;
      }
    }, {
      key: 'toString',
      value: function toString() {
        var sessionString = this.session ? this.session.toString() : "(detached)";
        return this.constructor.toString() + "<" + (this.id || '(no id)') + ", " + this.clientId + ", " + sessionString + ">";
      }
    }, {
      key: 'toJSON',
      value: function toJSON() {
        var res = {};
        _.merge(res, this._meta);
        _.merge(res, this._attributes);
        return res;
      }
    }, {
      key: 'lazyCopy',

      /**
        Returns a copy with all properties unloaded except identifiers.
         @method lazyCopy
        @returns {Model}
      */
      value: function lazyCopy() {
        var copy = new this.constructor({
          id: this.id,
          clientId: this.clientId
        });
        return copy;
      }

      // creates a shallow copy with lazy children
      // TODO: we should not lazily copy detached children
    }, {
      key: 'copy',
      value: function copy() {
        var dest = new this.constructor();
        this.copyTo(dest);
        return dest;
      }
    }, {
      key: 'copyTo',
      value: function copyTo(dest) {
        this.copyMeta(dest);
        this.copyAttributes(dest);
        this.copyRelationships(dest);
      }
    }, {
      key: 'copyMeta',
      value: function copyMeta(dest) {
        // TODO _parent should just use clientId
        dest._parent = this._parent;
        dest._meta = (0, _copy['default'])(this._meta);
      }
    }, {
      key: 'copyAttributes',
      value: function copyAttributes(dest) {
        this.loadedAttributes.forEach(function (options, name) {
          dest._attributes[name] = (0, _copy['default'])(this._attributes[name], true);
        }, this);
      }
    }, {
      key: 'copyRelationships',
      value: function copyRelationships(dest) {
        this.eachLoadedRelationship(function (name, relationship) {
          dest[name] = this[name];
        }, this);
      }

      /**
        Copy the model to the target session.
      */
    }, {
      key: 'fork',
      value: function fork(session) {
        var dest = new this.constructor();
        this.copyTo(dest);
        session.adopt(dest);
        // XXX: this is a hack to lazily add the children when the array is accessed
        dest.eachLoadedRelationship(function (name, relationship) {
          dest[name].needsReification = true;
        });
        return dest;
      }

      // XXX: move to ember
    }, {
      key: 'willWatchProperty',
      value: function willWatchProperty(key) {
        // EmberTODO
        if (this.isManaged && this.shouldTriggerLoad(key)) {
          _Coalesce['default'].backburner.run.scheduleOnce('actions', this, this.load);
        }
      }
    }, {
      key: 'shouldTriggerLoad',
      value: function shouldTriggerLoad(key) {
        return this.isField(key) && !this.isFieldLoaded(key);
      }
    }, {
      key: 'isField',
      value: function isField(key) {
        return !!this.fields.get(key);
      }
    }, {
      key: 'isFieldLoaded',
      value: function isFieldLoaded(key) {
        return this.isNew || typeof this[key] !== 'undefined';
      }

      /**
        Returns true if *any* fields are loaded on the model
      */
    }, {
      key: 'metaWillChange',
      value: function metaWillChange(name) {}
    }, {
      key: 'metaDidChange',
      value: function metaDidChange(name) {}
    }, {
      key: 'attributeWillChange',
      value: function attributeWillChange(name) {
        var session = this.session;
        if (session) {
          session.modelWillBecomeDirty(this);
        }
      }
    }, {
      key: 'attributeDidChange',
      value: function attributeDidChange(name) {}
    }, {
      key: 'belongsToWillChange',
      value: function belongsToWillChange(name) {
        if (this._suspendedRelationships) {
          return;
        }
        var inverseModel = this[name],
            session = this.session;
        if (session && inverseModel) {
          session.inverseManager.unregisterRelationship(this, name, inverseModel);
        }
      }
    }, {
      key: 'belongsToDidChange',
      value: function belongsToDidChange(name) {
        if (this._suspendedRelationships) {
          return;
        }
        var inverseModel = this[name],
            session = this.session;
        if (session && inverseModel) {
          session.inverseManager.registerRelationship(this, name, inverseModel);
        }
      }
    }, {
      key: 'hasManyWillChange',
      value: function hasManyWillChange(name) {
        // XXX: unregister all?
      }
    }, {
      key: 'hasManyDidChange',
      value: function hasManyDidChange(name) {}
      // XXX: reregister

      //
      // DEPRECATED back-compat methods below, instead should use es6 iterators
      //

    }, {
      key: 'eachAttribute',
      value: function eachAttribute(callback, binding) {
        this.attributes.forEach(function (options, name) {
          callback.call(binding, name, options);
        });
      }
    }, {
      key: 'eachLoadedAttribute',
      value: function eachLoadedAttribute(callback, binding) {
        this.loadedAttributes.forEach(function (options, name) {
          callback.call(binding, name, options);
        });
      }
    }, {
      key: 'eachRelationship',
      value: function eachRelationship(callback, binding) {
        this.relationships.forEach(function (options, name) {
          callback.call(binding, name, options);
        });
      }
    }, {
      key: 'eachLoadedRelationship',
      value: function eachLoadedRelationship(callback, binding) {
        this.loadedRelationships.forEach(function (options, name) {
          callback.call(binding, name, options);
        });
      }

      /**
        Traverses the object graph rooted at this model, invoking the callback.
      */
    }, {
      key: 'eachRelatedModel',
      value: function eachRelatedModel(callback, binding, cache) {
        if (!cache) cache = new Set();
        if (cache.has(this)) return;
        cache.add(this);
        callback.call(binding || this, this);

        this.eachLoadedRelationship(function (name, relationship) {
          if (relationship.kind === 'belongsTo') {
            var child = this[name];
            if (!child) return;
            this.eachRelatedModel.call(child, callback, binding, cache);
          } else if (relationship.kind === 'hasMany') {
            var children = this[name];
            children.forEach(function (child) {
              this.eachRelatedModel.call(child, callback, binding, cache);
            }, this);
          }
        }, this);
      }

      /**
        Given a callback, iterates over each child (1-level deep relation).
         @param {Function} callback the callback to invoke
        @param {any} binding the value to which the callback's `this` should be bound
      */
    }, {
      key: 'eachChild',
      value: function eachChild(callback, binding) {
        this.eachLoadedRelationship(function (name, relationship) {
          if (relationship.kind === 'belongsTo') {
            var child = this[name];
            if (child) {
              callback.call(binding, child);
            }
          } else if (relationship.kind === 'hasMany') {
            var children = this[name];
            children.forEach(function (child) {
              callback.call(binding, child);
            }, this);
          }
        }, this);
      }

      /**
        @private
         The goal of this method is to temporarily disable specific observers
        that take action in response to application changes.
         This allows the system to make changes (such as materialization and
        rollback) that should not trigger secondary behavior (such as setting an
        inverse relationship or marking records as dirty).
         The specific implementation will likely change as Ember proper provides
        better infrastructure for suspending groups of observers, and if Array
        observation becomes more unified with regular observers.
      */
    }, {
      key: 'suspendRelationshipObservers',
      value: function suspendRelationshipObservers(callback, binding) {
        // could be nested
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
      key: 'typeKey',
      get: function get() {
        return this.constructor.typeKey;
      }
    }, {
      key: 'hasErrors',
      get: function get() {
        return !!this.errors;
      }
    }, {
      key: 'isDetached',
      get: function get() {
        return !this.session;
      }
    }, {
      key: 'isManaged',
      get: function get() {
        return !!this.session;
      }
    }, {
      key: 'isNew',
      get: function get() {
        return !this.id;
      }
    }, {
      key: 'isEmbedded',
      get: function get() {
        return !!this._parent;
      }
    }, {
      key: 'isDirty',
      get: function get() {
        if (this.session) {
          return this.session.dirtyModels.contains(this);
        } else {
          return false;
        }
      }
    }, {
      key: 'isPartiallyLoaded',
      get: function get() {
        var res = false;
        this.fields.forEach(function (options, name) {
          res = res || this.isFieldLoaded(name);
        }, this);
        return res;
      }

      /**
        Returns true if *all* fields (including relationships) are loaded on the model.
      */
    }, {
      key: 'isLoaded',
      get: function get() {
        var res = true;
        this.fields.forEach(function (options, name) {
          res = res && this.isFieldLoaded(name);
        }, this);
        return res;
      }

      /**
        Defines the attributes and relationships on the model.
        
        For example:
        
        ```
        class Post extends Model {}
        Post.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {
              type: 'string'
            },
            body: {
              type: 'string'
            }
          },
          relationships: {
            user: {
              type: 'user',
              kind: 'belongsTo'
            },
            comments: {
              type: 'comment',
              kind: 'hasMany'
            }
          }
        });
        ```
        
        @method defineSchema
        @param {Object} schema
      */
    }, {
      key: 'attributes',
      get: function get() {
        return this.constructor.attributes;
      }
    }, {
      key: 'fields',
      get: function get() {
        return this.constructor.fields;
      }
    }, {
      key: 'loadedAttributes',
      get: function get() {
        var res = new Map();
        this.attributes.forEach(function (options, name) {
          if (this.isFieldLoaded(name)) {
            res.set(name, options);
          }
        }, this);
        return res;
      }
    }, {
      key: 'relationships',
      get: function get() {
        return this.constructor.relationships;
      }
    }, {
      key: 'loadedRelationships',
      get: function get() {
        var res = new Map();
        this.relationships.forEach(function (options, name) {
          if (this.isFieldLoaded(name)) {
            res.set(name, options);
          }
        }, this);
        return res;
      }
    }], [{
      key: 'toString',
      value: function toString() {
        if (this.__toString = this.__toString || this.name || this.typeKey && (0, _utilsInflector.classify)(this.typeKey)) {
          return this.__toString;
        }
        return "[No Type Key]";
      }
    }, {
      key: 'defineSchema',
      value: function defineSchema(schema) {
        if (typeof schema.typeKey !== 'undefined') {
          this.typeKey = schema.typeKey;
        }
        var attributes = schema.attributes || {};
        for (var name in attributes) {
          if (!attributes.hasOwnProperty(name)) continue;
          var field = new _Attribute['default'](name, attributes[name]);
          this.defineField(field);
        }
        var relationships = schema.relationships || {};
        for (var name in relationships) {
          if (!relationships.hasOwnProperty(name)) continue;
          var options = relationships[name];
          console.assert(options.kind, "Relationships must have a 'kind' property specified");
          var field;
          if (options.kind === 'belongsTo') {
            field = new _BelongsTo['default'](name, options);
          } else if (options.kind === 'hasMany') {
            field = new _HasMany['default'](name, options);
          } else {
            console.assert(false, "Unkown relationship kind '" + options.kind + "'. Supported kinds are 'belongsTo' and 'hasMany'");
          }
          this.defineField(field);
        }
      }
    }, {
      key: 'defineField',
      value: function defineField(field) {
        field.defineProperty(this.prototype);
        field.parentType = this;
        this.ownFields.set(field.name, field);
        return field;
      }
    }, {
      key: 'eachRelationship',
      value: function eachRelationship(callback, binding) {
        this.relationships.forEach(function (options, name) {
          callback.call(binding, name, options);
        });
      }
    }, {
      key: 'inverseFor',
      value: function inverseFor(name) {
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
          // Match inverse based on typeKey
          var propertyName = (0, _utilsInflector.camelize)(typeKey);
          var inverse = relationships.get(propertyName) || relationships.get((0, _utilsInflector.pluralize)(propertyName));
          if (inverse) {
            possibleRelationships.push(inverse);
          }

          var parentType = type.parentType;
          if (parentType && parentType.typeKey) {
            // XXX: container extends models and this logic creates duplicates
            // XXX: add test for subclassing and extending the schema
            // findPossibleInverses(parentType, inverseType, possibleRelationships);
          }
          return possibleRelationships;
        }

        return possibleRelationships[0];
      }
    }, {
      key: 'ownFields',
      get: function get() {
        if (!this.hasOwnProperty('_ownFields')) {
          this._ownFields = new Map();
        }
        return this._ownFields;
      }
    }, {
      key: 'fields',
      get: function get() {
        if (this.hasOwnProperty('_fields')) {
          return this._fields;
        }
        var res = new Map(),
            parentClass = this.parentType;

        var maps = [this.ownFields];

        if (parentClass.prototype instanceof Model) {
          var parentFields = parentClass.fields;
          if (parentFields) {
            maps.push(parentClass.fields);
          }
        }

        for (var i = 0; i < maps.length; i++) {
          maps[i].forEach(function (field, name) {
            res.set(name, field);
          });
        }

        return this._fields = res;
      }
    }, {
      key: 'attributes',
      get: function get() {
        if (this.hasOwnProperty('_attributes')) {
          return this._attributes;
        }
        var res = new Map();
        this.fields.forEach(function (options, name) {
          if (options.kind === 'attribute') {
            res.set(name, options);
          }
        });
        return this._attributes = res;
      }
    }, {
      key: 'relationships',
      get: function get() {
        if (this.hasOwnProperty('_relationships')) {
          return this._relationships;
        }
        var res = new Map();
        this.fields.forEach(function (options, name) {
          if (options.kind === 'belongsTo' || options.kind === 'hasMany') {
            res.set(name, options);
          }
        });
        return this._relationships = res;
      }
    }, {
      key: 'parentType',
      get: function get() {
        return Object.getPrototypeOf(this);
      }
    }]);
    return Model;
  })(_BaseClass2['default']);

  module.exports = Model;
  Model.prototype._parent = null;

  function sessionAlias(name) {
    return function () {
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
    if (oldValue === value) return oldValue;
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

  /**
    @private
    
    "reification" happens when the type is looked up on the context. This process
    translates the String typeKeys into their corresponding classes.
  */
  Model._isReified = false;
  Model.reify = function (context) {
    if (this._isReified) return;

    // no need to reify the root class
    if (this === Model) {
      return;
    }

    console.assert(this.typeKey, "Model must have static 'typeKey' property set.");

    if (this.parentType && typeof this.parentType.reify === 'function') {
      this.parentType.reify(context);
    }

    // eagerly set to break loops
    this._isReified = true;

    this.relationships.forEach(function (relationship) {
      if (!relationship.type) {
        relationship.type = context.typeFor(relationship.typeKey);
      }
      if (!relationship.type) {
        throw new _Error['default']("Could not find a type for '" + relationship.name + "' with typeKey '" + relationship.typeKey + "'");
      }
      if (!relationship.type.typeKey) {
        throw new _Error['default']("Relationship '" + relationship.name + "' has no typeKey");
      }
      if (!relationship.typeKey) {
        relationship.typeKey = relationship.type.typeKey;
      }
    });
  };
});


define("coalesce/model/relationship", ["exports", "module", "./field"], function (exports, module, _field) {
  "use strict";

  var _Field2 = babelHelpers.interopRequireDefault(_field);

  var Relationship = (function (_Field) {
    babelHelpers.inherits(Relationship, _Field);

    function Relationship(name, options) {
      babelHelpers.classCallCheck(this, Relationship);

      // make sure typeKey is set
      console.assert(options.type || options.typeKey, "Must specify a `type` or `typeKey` option");
      if (typeof options.type === "string") {
        var typeKey = options.type;
        delete options.type;
        options.typeKey = typeKey;
      } else if (!options.typeKey) {
        options.typeKey = options.type.typeKey;
      }
      babelHelpers.get(Object.getPrototypeOf(Relationship.prototype), "constructor", this).call(this, name, options);
    }

    return Relationship;
  })(_Field2["default"]);

  module.exports = Relationship;
});


define('coalesce/namespace', ['exports', 'module'], function (exports, module) {
  /**
    @module coalesce
  */

  /**
    @class Coalesce
    @static
  */

  //
  // Required global libraries
  //

  'use strict';

  var global = undefined || window;

  var ajax = global.jQuery && global.jQuery.ajax,
      Backburner = global.Backburner;

  var Coalesce = {
    VERSION: '0.4.0+dev.12238b19',
    Promise: Promise,
    ajax: ajax
  };

  if (Backburner) {
    Coalesce.backburner = new Backburner(['actions']);
  }

  module.exports = Coalesce;
});


define('coalesce/rest/adapter', ['exports', 'module', '../adapter', '../collections/model_set', '../namespace', '../utils/array_from', '../utils/inflector'], function (exports, module, _adapter, _collectionsModel_set, _namespace, _utilsArray_from, _utilsInflector) {
  'use strict';

  var _Adapter2 = babelHelpers.interopRequireDefault(_adapter);

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var defaults = _.defaults;

  /**
    The REST adapter allows your store to communicate with an HTTP server by
    transmitting JSON via XHR. Most Coalesce.js apps that consume a JSON API
    should use the REST adapter.
  
    This adapter is designed around the idea that the JSON exchanged with
    the server should be conventional.
  
    ## JSON Structure
  
    The REST adapter expects the JSON returned from your server to follow
    these conventions.
  
    ### Object Root
  
    The JSON payload should be an object that contains the record inside a
    root property. For example, in response to a `GET` request for
    `/posts/1`, the JSON should look like this:
  
    ```js
    {
      "post": {
        "title": "I'm Running to Reform the W3C's Tag",
        "author": "Yehuda Katz"
      }
    }
    ```
  
    ### Conventional Names
  
    Attribute names in your JSON payload should be the camelCased versions of
    the attributes in your Coalesce.js models.
  
    For example, if you have a `Person` model:
  
    ```js
    App.Person = Coalesce.Model.extend({
      firstName: Coalesce.attr('string'),
      lastName: Coalesce.attr('string'),
      occupation: Coalesce.attr('string')
    });
    ```
  
    The JSON returned should look like this:
  
    ```js
    {
      "person": {
        "firstName": "Barack",
        "lastName": "Obama",
        "occupation": "President"
      }
    }
    ```
  
    ## Customization
  
    ### Endpoint path customization
  
    Endpoint paths can be prefixed with a `namespace` by setting the namespace
    property on the adapter:
  
    ```js
    Coalesce.RestAdapter.reopen({
      namespace: 'api/1'
    });
    ```
    Requests for `App.Person` would now target `/api/1/people/1`.
  
    ### Host customization
  
    An adapter can target other hosts by setting the `host` property.
  
    ```js
    Coalesce.RestAdapter.reopen({
      host: 'https://api.example.com'
    });
    ```
  
    ### Headers customization
  
    Some APIs require HTTP headers, e.g. to provide an API key. An array of
    headers can be added to the adapter which are passed with every request:
  
    ```js
     Coalesce.RestAdapter.reopen({
      headers: {
        "API_KEY": "secret key",
        "ANOTHER_HEADER": "Some header value"
      }
    });
    ```
  
    @class RestAdapter
    @constructor
    @namespace rest
    @extends Adapter
  */

  var RestAdapter = (function (_Adapter) {
    babelHelpers.inherits(RestAdapter, _Adapter);

    function RestAdapter() {
      babelHelpers.classCallCheck(this, RestAdapter);

      babelHelpers.get(Object.getPrototypeOf(RestAdapter.prototype), 'constructor', this).apply(this, arguments);
      this._pendingOps = {};
    }

    babelHelpers.createClass(RestAdapter, [{
      key: 'load',
      value: function load(model, opts, session) {
        return this._mergeAndContextualizePromise(this._load(model, opts), session, model, opts);
      }
    }, {
      key: '_load',
      value: function _load(model, opts) {
        opts = opts || {};
        _.defaults(opts, {
          type: 'GET'
        });
        return this._remoteCall(model, null, null, opts);
      }
    }, {
      key: 'update',
      value: function update(model, opts, session) {
        return this._mergeAndContextualizePromise(this._update(model, opts), session, model, opts);
      }
    }, {
      key: '_update',
      value: function _update(model, opts) {
        opts = opts || {};
        _.defaults(opts, {
          type: 'PUT'
        });
        return this._remoteCall(model, null, model, opts);
      }
    }, {
      key: 'create',
      value: function create(model, opts, session) {
        return this._mergeAndContextualizePromise(this._create(model, opts), session, model, opts);
      }
    }, {
      key: '_create',
      value: function _create(model, opts) {
        return this._remoteCall(model, null, model, opts);
      }
    }, {
      key: 'deleteModel',
      value: function deleteModel(model, opts, session) {
        return this._mergeAndContextualizePromise(this._deleteModel(model, opts), session, model, opts);
      }
    }, {
      key: '_deleteModel',
      value: function _deleteModel(model, opts) {
        opts = opts || {};
        _.defaults(opts, {
          type: 'DELETE'
        });
        return this._remoteCall(model, null, null, opts);
      }
    }, {
      key: 'query',
      value: function query(typeKey, _query, opts, session) {
        return this._mergeAndContextualizePromise(this._query(typeKey, _query, opts), session, typeKey, opts);
      }
    }, {
      key: '_query',
      value: function _query(typeKey, query, opts) {
        opts = opts || {};
        _.defaults(opts, {
          type: 'GET',
          serialize: false,
          deserializer: 'payload'
        });
        return this._remoteCall(typeKey, null, query, opts);
      }

      /**
        Calls a custom endpoint on the remote server.
         The following options are available inside the options hash:
         * `type`: The request method. Defaults to `POST`.
        * `serialize`: Whether or not to serialize the passed in data
        * `serializer`: The name of the serializer to use on the passed in data
        * `deserialize`: Whether or not to deserialize the returned data
        * `deserializer`: The name of the serializer to use to deserialize returned data (defaults to `serializer`)
        * `serializerOptions`: Options to be passed to the serializer's `serialize`/`deserialize` methods
        * `params`: Additional raw parameters to be added to the final serialized hash sent to the server
        * `url`: A custom url to use
         @method remoteCall
        @param {any} context the model or type that is used as the context of the call
        @param String name the name of the action to be called
        @param Object [opts] an options hash
        @param Session [session] the session to merge the results into
      */
    }, {
      key: 'remoteCall',
      value: function remoteCall(context, name, data, opts, session) {
        var serialize = data && !!data.isModel;
        opts = opts || {};
        _.defaults(opts, {
          serialize: serialize,
          deserializer: 'payload'
        });
        return this._mergeAndContextualizePromise(this._remoteCall(context, name, data, opts), session, context, opts);
      }
    }, {
      key: '_remoteCall',
      value: function _remoteCall(context, name, data, opts) {
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
            serializer = this._serializerFor(serializer);
            serializerOptions = _.defaults(serializerOptions, { context: context });
            data = serializer.serialize(data, serializerOptions);
          }
        }

        if (opts.params) {
          data = data || {};
          data = _.defaults(data, opts.params);
        }

        return this._deserializePromise(this.ajax(url, method, { data: data }), context, opts);
      }
    }, {
      key: '_normalizeOptions',
      value: function _normalizeOptions(opts) {
        opts = opts || {};
        // make sure that the context is a typeKey instead of a type
        if (opts.serializerOptions && typeof opts.serializerOptions.context === 'function') {
          opts.serializerOptions.context = opts.serializerOptions.context.typeKey;
        }
        return opts;
      }
    }, {
      key: 'serializerForContext',
      value: function serializerForContext(context) {
        return this.defaultSerializer;
      }

      /**
        @private
         Deserialize the contents of a promise.
      */
    }, {
      key: '_deserializePromise',
      value: function _deserializePromise(promise, context, opts) {
        var serializer = opts.deserializer || opts.serializer,
            serializerOptions = opts.serializerOptions || {};

        if (!serializer && context) {
          serializer = this.serializerForContext(context);
        }

        if (serializer) {
          serializer = this._serializerFor(serializer);
          _.defaults(serializerOptions, { context: context });
        }

        var adapter = this;
        return promise.then(function (data) {
          if (opts.deserialize !== false) {
            return serializer.deserialize(data, serializerOptions);
          }

          return data;
        }, function (xhr) {
          if (opts.deserialize !== false) {
            var data;
            if (xhr.responseText) {
              data = JSON.parse(xhr.responseText);
            } else {
              data = {};
            }

            serializerOptions = defaults(serializerOptions, { context: context, xhr: xhr });

            // TODO: handle other errors codes such as 409
            // determine serializer behavior off of xhr response code
            if (xhr.status === 422) {
              // in the event of a 422 response, handle a full payload, possibly with
              // models that have `error` properties, therefore we just use the same
              // serializer that we use in the success case
              throw serializer.deserialize(data, serializerOptions);
            } else {
              // treat other errors generically
              serializer = adapter._serializerFor(opts.errorSerializer || 'errors');
              var errors = serializer.deserialize(data, serializerOptions);
              if (context && context.isModel) {
                // if the context is a model we want to return a model with errors
                // so that it can be merged by the session
                var model = context.lazyCopy();
                model.errors = errors;
                throw model;
              }
              throw errors;
            }
          }
          throw xhr;
        });
      }

      /**
        @private
         Merge the contents of the promise into the session.
      */
    }, {
      key: '_mergePromise',
      value: function _mergePromise(promise, session, opts) {
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

        return promise.then(function (deserialized) {
          return merge(deserialized);
        }, function (deserialized) {
          throw merge(deserialized);
        });
      }

      /**
        @private
         Transform the promise's resolve value to the context
        of the particular operation. E.g. a load operation may
        return a complex payload consisting of many models. In
        this case we want to just return the model that
        corresponds to the load.
      */
    }, {
      key: '_contextualizePromise',
      value: function _contextualizePromise(promise, context, opts) {
        if (opts && opts.deserializationContext !== undefined) {
          context = opts.deserializationContext;
        }

        function contextualize(merged) {
          // payloads detect their context during deserialization
          if (context && merged.isPayload) {
            var result = merged.context;
            // the server might not return any data for the context
            // of the operation (e.g. a delete with an empty response)
            // in this case we just echo back the client's version
            if (!result) {
              result = context;
            }
            result.meta = merged.meta;
            // TODO: we might want to merge errors here
            if (merged.errors && (!result.errors || result === context)) {
              result.errors = merged.errors;
            }
            return result;
          }

          return merged;
        }

        return promise.then(function (merged) {
          return contextualize(merged);
        }, function (merged) {
          throw contextualize(merged);
        });
      }

      /**
        @private
         Composition of `_mergePromise` and `_contextualizePromise`.
      */
    }, {
      key: '_mergeAndContextualizePromise',
      value: function _mergeAndContextualizePromise(promise, session, context, opts) {
        return this._contextualizePromise(this._mergePromise(promise, session, opts), context, opts);
      }

      /**
        Useful for manually merging in payload data.
         @method mergePayload
        @param Object data the raw payload data
        @param {any} [context] the context of the payload. This property will dictate the return value of this method.
        @param Session [session] the session to merge into. Defaults to the main session.
        @returns {any} The result of the merge contextualized to the context. E.g. if 'post' is the context, this will return all posts that are part of the payload.
      */
    }, {
      key: 'mergePayload',
      value: function mergePayload(data, context, session) {
        var payload = this.deserialize('payload', data, { context: context });
        if (!session) {
          session = this.container.lookup('session:main');
        }
        payload.merge(session);
        if (context) {
          return payload.context;
        }
        return payload;
      }

      /**
        Returns whether or not the passed in relationship
        is the "owner" of the relationship. This defaults
        to true for belongsTo and false for hasMany
      */
    }, {
      key: 'isRelationshipOwner',
      value: function isRelationshipOwner(relationship) {
        var owner = relationship.owner;
        // TODO: use lack of an inverse to determine this value as well
        return relationship.kind === 'belongsTo' && owner !== false || relationship.kind === 'hasMany' && owner === true;
      }
    }, {
      key: 'isDirtyFromRelationships',
      value: function isDirtyFromRelationships(model, cached, relDiff) {
        for (var i = 0; i < relDiff.length; i++) {
          var diff = relDiff[i];
          if (this.isRelationshipOwner(diff.relationship) || model.isEmbedded) {
            return true;
          }
        }
        return false;
      }
    }, {
      key: 'shouldSave',
      value: function shouldSave(model) {
        return !model.isEmbedded;
      }

      /**
        Builds a URL from a context. A context can be one of three things:
         1. An instance of a model
        2. A string representing a type (typeKey), e.g. 'post'
        3. A hash containing both a typeKey and an id
         @method buildUrlFromContext
        @param {any} context
        @param {String} action
        @returns {String} url
      */
    }, {
      key: 'buildUrlFromContext',
      value: function buildUrlFromContext(context, action) {
        var typeKey, id;
        if (typeof context === 'string') {
          typeKey = context;
        } else {
          typeKey = context.typeKey;
          id = context.id;
        }
        var url = this.buildUrl(typeKey, id);
        if (action) {
          // TODO: hook to transform action name
          url = url + '/' + action;
        }
        return url;
      }

      /**
        Builds a URL for a given type and optional ID.
         By default, it pluralizes the type's name (for example, 'post'
        becomes 'posts' and 'person' becomes 'people'). To override the
        pluralization see [pathForType](#method_pathForType).
         If an ID is specified, it adds the ID to the path generated
        for the type, separated by a `/`.
         @method buildUrl
        @param {String} type
        @param {String} id
        @returns {String} url
      */
    }, {
      key: 'buildUrl',
      value: function buildUrl(typeKey, id) {
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
      }

      /**
        @method urlPrefix
        @private
        @param {String} path
        @param {String} parentUrl
        @return {String} urlPrefix
      */
    }, {
      key: 'urlPrefix',
      value: function urlPrefix(path, parentURL) {
        var host = this.host,
            namespace = this.namespace,
            url = [];

        if (path) {
          // Absolute path
          if (path.charAt(0) === '/') {
            if (host) {
              path = path.slice(1);
              url.push(host);
            }
            // Relative path
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
      }

      /**
        Determines the pathname for a given type.
         By default, it pluralizes the type's name (for example,
        'post' becomes 'posts' and 'person' becomes 'people').
         ### Pathname customization
         For example if you have an object LineItem with an
        endpoint of "/line_items/".
         ```js
        Coalesce.RESTAdapter.reopen({
          pathForType(type) {
            var decamelized = decamelize(type);
            return pluralize(decamelized);
          };
        });
        ```
         @method pathForType
        @param {String} type
        @returns {String} path
      **/
    }, {
      key: 'pathForType',
      value: function pathForType(type) {
        var camelized = (0, _utilsInflector.camelize)(type);
        return (0, _utilsInflector.pluralize)(camelized);
      }

      /**
        Takes an ajax response, and returns a relevant error.
         Returning a `Coalesce.InvalidError` from this method will cause the
        record to transition into the `invalid` state and make the
        `errors` object available on the record.
         ```javascript
        App.ApplicationAdapter = Coalesce.RESTAdapter.extend({
          ajaxError(jqXHR) {
            var error = this._super(jqXHR);
             if (jqXHR && jqXHR.status === 422) {
              var jsonErrors = jQuery.parseJSON(jqXHR.responseText)["errors"];
               return new Coalesce.InvalidError(jsonErrors);
            } else {
              return error;
            }
          }
        });
        ```
         Note: As a correctness optimization, the default implementation of
        the `ajaxError` method strips out the `then` method from jquery's
        ajax response (jqXHR). This is important because the jqXHR's
        `then` method fulfills the promise with itself resulting in a
        circular "thenable" chain which may cause problems for some
        promise libraries.
         @method ajaxError
        @param  {Object} jqXHR
        @return {Object} jqXHR
      */
    }, {
      key: 'ajaxError',
      value: function ajaxError(jqXHR) {
        if (jqXHR && typeof jqXHR === 'object') {
          jqXHR.then = null;
        }

        return jqXHR;
      }

      /**
        Takes a URL, an HTTP method and a hash of data, and makes an
        HTTP request.
         When the server responds with a payload, Coalesce Data will call into `extractSingle`
        or `extractArray` (depending on whether the original query was for one record or
        many records).
         By default, `ajax` method has the following behavior:
         * It sets the response `dataType` to `"json"`
        * If the HTTP method is not `"GET"`, it sets the `Content-Type` to be
          `application/json; charset=utf-8`
        * If the HTTP method is not `"GET"`, it stringifies the data passed in. The
          data is the serialized record in the case of a save.
        * Registers success and failure handlers.
         @method ajax
        @private
        @param {String} url
        @param {String} type The request type GET, POST, PUT, DELETE etc.
        @param {Object} hash
        @return {Promise} promise
      */
    }, {
      key: 'ajax',
      value: function ajax(url, type, hash) {
        var adapter = this;

        return new _Coalesce['default'].Promise(function (resolve, reject) {
          hash = adapter.ajaxOptions(url, type, hash);

          hash.success = function (json) {
            _Coalesce['default'].backburner.run(null, resolve, json);
          };

          hash.error = function (jqXHR, textStatus, errorThrown) {
            _Coalesce['default'].backburner.run(null, reject, adapter.ajaxError(jqXHR));
          };

          _Coalesce['default'].ajax(hash);
        }, "Coalesce: RestAdapter#ajax " + type + " to " + url);
      }

      /**
        @method ajaxOptions
        @private
        @param {String} url
        @param {String} type The request type GET, POST, PUT, DELETE etc.
        @param {Object} hash
        @return {Object} hash
      */
    }, {
      key: 'ajaxOptions',
      value: function ajaxOptions(url, type, hash) {
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
          hash.beforeSend = function (xhr) {
            for (var key in headers) {
              if (!headers.hasOwnProperty(key)) continue;
              xhr.setRequestHeader(key, headers[key]);
            }
          };
        }

        return hash;
      }
    }, {
      key: 'serializerForContext',
      value: function serializerForContext(context) {
        return 'payload';
      }
    }]);
    return RestAdapter;
  })(_Adapter2['default']);

  module.exports = RestAdapter;

  RestAdapter.reopen({
    defaultSerializer: 'payload'
  });
});


define('coalesce/rest/context', ['exports', 'module', '../context/default', './adapter', './serializers/errors', './serializers/payload'], function (exports, module, _contextDefault, _adapter, _serializersErrors, _serializersPayload) {
  'use strict';

  var _Context2 = babelHelpers.interopRequireDefault(_contextDefault);

  var _RestAdapter = babelHelpers.interopRequireDefault(_adapter);

  var _RestErrorsSerializer = babelHelpers.interopRequireDefault(_serializersErrors);

  var _PayloadSerializer = babelHelpers.interopRequireDefault(_serializersPayload);

  var RestContext = (function (_Context) {
    babelHelpers.inherits(RestContext, _Context);

    function RestContext() {
      babelHelpers.classCallCheck(this, RestContext);
      babelHelpers.get(Object.getPrototypeOf(RestContext.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(RestContext, [{
      key: '_setupContainer',
      value: function _setupContainer() {
        babelHelpers.get(Object.getPrototypeOf(RestContext.prototype), '_setupContainer', this).call(this);
        var container = this.container;

        container.register('adapter:default', container.lookupFactory('adapter:application') || _RestAdapter['default']);

        container.register('serializer:errors', _RestErrorsSerializer['default']);
        container.register('serializer:payload', _PayloadSerializer['default']);
      }
    }]);
    return RestContext;
  })(_Context2['default']);

  module.exports = RestContext;
});


define('coalesce/rest/payload', ['exports', 'module', '../collections/model_set', '../utils/array_from'], function (exports, module, _collectionsModel_set, _utilsArray_from) {
  'use strict';

  var _ModelSet2 = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var isArray = Array.isArray;

  var Payload = (function (_ModelSet) {
    babelHelpers.inherits(Payload, _ModelSet);

    function Payload(iterable) {
      babelHelpers.classCallCheck(this, Payload);

      babelHelpers.get(Object.getPrototypeOf(Payload.prototype), 'constructor', this).call(this, iterable);
      this.isPayload = true;
      this.context = null;
      this.meta = null;
    }

    babelHelpers.createClass(Payload, [{
      key: 'merge',
      value: function merge(session) {
        var merged = (0, _array_from['default'])(this).map(function (model) {
          return session.merge(model);
        }, this);
        var context = this.context;
        if (context && isArray(context)) {
          context = context.map(function (model) {
            return session.getModel(model);
          });
        } else if (context) {
          context = session.getModel(context);
        }
        var result = new Payload(merged);
        result.context = context;
        result.meta = this.meta;
        result.errors = this.errors;
        return result;
      }
    }]);
    return Payload;
  })(_ModelSet2['default']);

  module.exports = Payload;
});


define('coalesce/rest/serializers/errors', ['exports', 'module', '../../serializers/base', '../../error', '../../utils/inflector', '../../utils/is_empty'], function (exports, module, _serializersBase, _error, _utilsInflector, _utilsIs_empty) {
  'use strict';

  var _Serializer2 = babelHelpers.interopRequireDefault(_serializersBase);

  var _Error = babelHelpers.interopRequireDefault(_error);

  var _isEmpty = babelHelpers.interopRequireDefault(_utilsIs_empty);

  var ErrorsSerializer = (function (_Serializer) {
    babelHelpers.inherits(ErrorsSerializer, _Serializer);

    function ErrorsSerializer() {
      babelHelpers.classCallCheck(this, ErrorsSerializer);
      babelHelpers.get(Object.getPrototypeOf(ErrorsSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(ErrorsSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized, opts) {
        var xhr = opts && opts.xhr;

        if (!xhr && ((0, _isEmpty['default'])(serialized) || isEmptyObject(serialized))) return;

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
      }
    }, {
      key: 'transformPropertyKey',
      value: function transformPropertyKey(name) {
        return (0, _utilsInflector.camelize)(name);
      }
    }, {
      key: 'serialize',
      value: function serialize(id) {
        throw new _Error['default']("Errors are not currently serialized down to the server.");
      }
    }]);
    return ErrorsSerializer;
  })(_Serializer2['default']);

  module.exports = ErrorsSerializer;

  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }
});


define('coalesce/rest/serializers/payload', ['exports', 'module', '../../utils/materialize_relationships', '../../serializers/base', '../payload', '../../utils/inflector'], function (exports, module, _utilsMaterialize_relationships, _serializersBase, _payload, _utilsInflector) {
  'use strict';

  var _materializeRelationships = babelHelpers.interopRequireDefault(_utilsMaterialize_relationships);

  var _Serializer2 = babelHelpers.interopRequireDefault(_serializersBase);

  var _Payload = babelHelpers.interopRequireDefault(_payload);

  var PayloadSerializer = (function (_Serializer) {
    babelHelpers.inherits(PayloadSerializer, _Serializer);

    function PayloadSerializer() {
      babelHelpers.classCallCheck(this, PayloadSerializer);
      babelHelpers.get(Object.getPrototypeOf(PayloadSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(PayloadSerializer, [{
      key: 'singularize',
      value: function singularize(name) {
        return (0, _utilsInflector.singularize)(name);
      }
    }, {
      key: 'typeKeyFor',
      value: function typeKeyFor(name) {
        var singular = this.singularize(name),
            aliases = this.aliases,
            alias = aliases[name];
        return alias || singular;
      }
    }, {
      key: 'rootForTypeKey',
      value: function rootForTypeKey(typeKey) {
        return typeKey;
      }

      /**
        Note: we serialize a model, but we deserialize
        to a payload object.
      */
    }, {
      key: 'serialize',
      value: function serialize(model) {
        var typeKey = model.typeKey,
            root = this.rootForTypeKey(typeKey),
            res = {},
            serializer = this.serializerFor(typeKey);
        res[root] = serializer.serialize(model);
        return res;
      }
    }, {
      key: 'deserialize',
      value: function deserialize(hash, opts) {
        opts = opts || {};
        var result = new _Payload['default'](),
            metaKey = this.metaKey,
            errorsKey = this.errorsKey,
            context = opts.context,
            xhr = opts.xhr;

        if (context && typeof context === 'string') {
          result.context = [];
        }

        /**
          If a context for the payload has been specified
          we need to check each model to see if it is/belongs in
          the context
        */
        function checkForContext(model) {
          if (context) {
            if (typeof context === 'string' && typeKey === context) {
              // context is a typeKey (e.g. for a query)
              result.context.push(model);
            } else if (context.isModel && context.isEqual(model)) {
              // context is a model
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
          console.assert(!!serializer, 'No serializer found for \'' + typeKey + '\'');
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

        // Ensure that an errors object exists if the request
        // failed. Right now we just check the existence of an
        // xhr object (which is only set on error).
        if (xhr) {
          var errors = result.errors;
          if (!errors) {
            var serializer = this.serializerFor('errors'),
                errors = serializer.deserialize({}, opts);
            result.errors = errors;
          }
        }

        (0, _materializeRelationships['default'])(result, this.idManager);

        return result;
      }
    }]);
    return PayloadSerializer;
  })(_Serializer2['default']);

  module.exports = PayloadSerializer;

  PayloadSerializer.reopen({
    metaKey: 'meta',
    aliases: {},
    errorsKey: 'errors'
  });
});


define('coalesce/serializers/base', ['exports', 'module', '../utils/base_class'], function (exports, module, _utilsBase_class) {
  'use strict';

  var _BaseClass2 = babelHelpers.interopRequireDefault(_utilsBase_class);

  /**
    Base class for serialization/deserialization
  
    @namespace serializers
    @class Base
  */

  var Base = (function (_BaseClass) {
    babelHelpers.inherits(Base, _BaseClass);

    function Base() {
      babelHelpers.classCallCheck(this, Base);
      babelHelpers.get(Object.getPrototypeOf(Base.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(Base, [{
      key: 'serialize',
      value: function serialize() {}
    }, {
      key: 'deserialize',
      value: function deserialize() {}
    }, {
      key: 'serializerFor',
      value: function serializerFor(typeKey) {
        return this.context.configFor(typeKey).get('serializer');
      }
    }]);
    return Base;
  })(_BaseClass2['default']);

  module.exports = Base;
});


define('coalesce/serializers/belongs_to', ['exports', 'module', './base'], function (exports, module, _base) {
  'use strict';

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class BelongsToSerializer
  */

  var BelongsToSerializer = (function (_Serializer) {
    babelHelpers.inherits(BelongsToSerializer, _Serializer);

    function BelongsToSerializer() {
      babelHelpers.classCallCheck(this, BelongsToSerializer);
      babelHelpers.get(Object.getPrototypeOf(BelongsToSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(BelongsToSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized, opts) {
        if (!serialized) {
          return null;
        }
        if (!opts.embedded) {
          var idSerializer = this.serializerFor('id');
          serialized = {
            id: idSerializer.deserialize(serialized)
          };
          opts.reifyClientId = false;
        }
        return this.deserializeModel(serialized, opts);
      }
    }, {
      key: 'deserializeModel',
      value: function deserializeModel(serialized, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return serializer.deserialize(serialized, opts);
      }
    }, {
      key: 'serialize',
      value: function serialize(model, opts) {
        if (!model) {
          return null;
        }
        if (opts.embedded) {
          return this.serializeModel(model, opts);
        }
        var idSerializer = this.serializerFor('id');
        return idSerializer.serialize(model.id);
      }
    }, {
      key: 'serializeModel',
      value: function serializeModel(model, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return serializer.serialize(model);
      }
    }]);
    return BelongsToSerializer;
  })(_Serializer2['default']);

  module.exports = BelongsToSerializer;
});


define("coalesce/serializers/boolean", ["exports", "module", "./base"], function (exports, module, _base) {
  "use strict";

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class BooleanSerializer
  */

  var BooleanSerializer = (function (_Serializer) {
    babelHelpers.inherits(BooleanSerializer, _Serializer);

    function BooleanSerializer() {
      babelHelpers.classCallCheck(this, BooleanSerializer);
      babelHelpers.get(Object.getPrototypeOf(BooleanSerializer.prototype), "constructor", this).apply(this, arguments);
    }

    babelHelpers.createClass(BooleanSerializer, [{
      key: "deserialize",
      value: function deserialize(serialized) {
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
      }
    }, {
      key: "serialize",
      value: function serialize(deserialized) {
        return Boolean(deserialized);
      }
    }]);
    return BooleanSerializer;
  })(_Serializer2["default"]);

  module.exports = BooleanSerializer;
});


define('coalesce/serializers/date', ['exports', 'module', './base', '../utils/parse_date'], function (exports, module, _base, _utilsParse_date) {
  'use strict';

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  var _parseDate = babelHelpers.interopRequireDefault(_utilsParse_date);

  /**
    @namespace serializers
    @class DateSerializer
  */

  var DateSerializer = (function (_Serializer) {
    babelHelpers.inherits(DateSerializer, _Serializer);

    function DateSerializer() {
      babelHelpers.classCallCheck(this, DateSerializer);
      babelHelpers.get(Object.getPrototypeOf(DateSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(DateSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized) {
        var type = typeof serialized;

        if (type === "string") {
          return new Date((0, _parseDate['default'])(serialized));
        } else if (type === "number") {
          return new Date(serialized);
        } else if (serialized === null || serialized === undefined) {
          // if the value is not present in the data,
          // return undefined, not null.
          return serialized;
        } else {
          return null;
        }
      }
    }, {
      key: 'serialize',
      value: function serialize(date) {
        if (date instanceof Date) {
          var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

          var pad = function pad(num) {
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
    }]);
    return DateSerializer;
  })(_Serializer2['default']);

  module.exports = DateSerializer;
});


define('coalesce/serializers/has_many', ['exports', 'module', '../utils/is_empty', './base'], function (exports, module, _utilsIs_empty, _base) {
  'use strict';

  var _isEmpty = babelHelpers.interopRequireDefault(_utilsIs_empty);

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class HasManySerializer
  */

  var HasManySerializer = (function (_Serializer) {
    babelHelpers.inherits(HasManySerializer, _Serializer);

    function HasManySerializer() {
      babelHelpers.classCallCheck(this, HasManySerializer);
      babelHelpers.get(Object.getPrototypeOf(HasManySerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(HasManySerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized, opts) {
        if (!serialized) return [];
        if (!opts.embedded) {
          var idSerializer = this.serializerFor('id');
          serialized = serialized.map(function (id) {
            return {
              id: id
            };
          }, this);
          opts.reifyClientId = false;
        }
        return this.deserializeModels(serialized, opts);
      }
    }, {
      key: 'deserializeModels',
      value: function deserializeModels(serialized, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return serialized.map(function (hash) {
          return serializer.deserialize(hash, opts);
        });
      }
    }, {
      key: 'serialize',
      value: function serialize(models, opts) {
        if (opts.embedded) {
          return this.serializeModels(models, opts);
        }
        return undefined;
      }
    }, {
      key: 'serializeModels',
      value: function serializeModels(models, opts) {
        var serializer = this.serializerFor(opts.typeKey);
        return models.map(function (model) {
          return serializer.serialize(model);
        });
      }
    }]);
    return HasManySerializer;
  })(_Serializer2['default']);

  module.exports = HasManySerializer;
});


define('coalesce/serializers/id', ['exports', 'module', './base'], function (exports, module, _base) {
  'use strict';

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class IdSerializer
  */

  var IdSerializer = (function (_Serializer) {
    babelHelpers.inherits(IdSerializer, _Serializer);

    function IdSerializer() {
      babelHelpers.classCallCheck(this, IdSerializer);
      babelHelpers.get(Object.getPrototypeOf(IdSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(IdSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized) {
        if (serialized === undefined || serialized === null) return;
        return serialized + '';
      }
    }, {
      key: 'serialize',
      value: function serialize(id) {
        if (isNaN(id) || id === null) {
          return id;
        }
        return +id;
      }
    }]);
    return IdSerializer;
  })(_Serializer2['default']);

  module.exports = IdSerializer;
});


define('coalesce/serializers/model', ['exports', 'module', '../utils/inflector', './base'], function (exports, module, _utilsInflector, _base) {
  'use strict';

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class ModelSerializer
  */

  var ModelSerializer = (function (_Serializer) {
    babelHelpers.inherits(ModelSerializer, _Serializer);

    function ModelSerializer() {
      babelHelpers.classCallCheck(this, ModelSerializer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      babelHelpers.get(Object.getPrototypeOf(ModelSerializer.prototype), 'constructor', this).apply(this, args);
      this._keyCache = {};
    }

    babelHelpers.createClass(ModelSerializer, [{
      key: 'keyFor',
      value: function keyFor(name, type, opts) {
        var key;
        if (key = this._keyCache[name]) {
          return key;
        }

        key = opts && opts.key || this.keyForType(name, type, opts);
        this._keyCache[name] = key;
        return key;
      }
    }, {
      key: 'keyForType',
      value: function keyForType(name, type, opts) {
        return (0, _utilsInflector.underscore)(name);
      }

      /**
        @private
         Determines the singular root name for a particular type.
         This is an underscored, lowercase version of the model name.
        For example, the type `App.UserGroup` will have the root
        `user_group`.
         @param {Coalesce.Model subclass} type
        @returns {String} name of the root element
      */
    }, {
      key: 'rootForType',
      value: function rootForType(type) {
        return type.typeKey;
      }
    }, {
      key: 'serialize',
      value: function serialize(model) {
        var serialized = {};

        this.addMeta(serialized, model);
        this.addAttributes(serialized, model);
        this.addRelationships(serialized, model);

        return serialized;
      }
    }, {
      key: 'addMeta',
      value: function addMeta(serialized, model) {
        this.addField(serialized, model, 'id', 'id');
        this.addField(serialized, model, 'clientId', 'string');
        this.addField(serialized, model, 'rev', 'revision');
        this.addField(serialized, model, 'clientRev', 'revision');
      }
    }, {
      key: 'addAttributes',
      value: function addAttributes(serialized, model) {
        model.eachLoadedAttribute(function (name, attribute) {
          // do not include transient properties
          if (attribute.transient) return;
          this.addField(serialized, model, name, attribute.type, attribute);
        }, this);
      }
    }, {
      key: 'addRelationships',
      value: function addRelationships(serialized, model) {
        model.eachLoadedRelationship(function (name, relationship) {
          // we dasherize the kind for lookups for consistency
          var kindKey = (0, _utilsInflector.dasherize)(relationship.kind);
          this.addField(serialized, model, name, kindKey, relationship);
        }, this);
      }
    }, {
      key: 'addField',
      value: function addField(serialized, model, name, type, opts) {
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
      }
    }, {
      key: 'deserialize',
      value: function deserialize(hash, opts) {
        var model = this.createModel();

        this.extractMeta(model, hash, opts);
        this.extractAttributes(model, hash);
        this.extractRelationships(model, hash);

        return model;
      }
    }, {
      key: 'extractMeta',
      value: function extractMeta(model, hash, opts) {
        this.extractField(model, hash, 'id', 'id');
        this.extractField(model, hash, 'clientId', 'string');
        this.extractField(model, hash, 'rev', 'revision');
        this.extractField(model, hash, 'clientRev', 'revision');
        this.extractField(model, hash, 'errors', 'errors');
        if (!opts || opts.reifyClientId !== false) {
          this.idManager.reifyClientId(model);
        }
      }
    }, {
      key: 'extractAttributes',
      value: function extractAttributes(model, hash) {
        model.eachAttribute(function (name, attribute) {
          this.extractField(model, hash, name, attribute.type, attribute);
        }, this);
      }
    }, {
      key: 'extractRelationships',
      value: function extractRelationships(model, hash) {
        model.eachRelationship(function (name, relationship) {
          // we dasherize the kind for lookups for consistency
          var kindKey = (0, _utilsInflector.dasherize)(relationship.kind);
          this.extractField(model, hash, name, kindKey, relationship);
        }, this);
      }
    }, {
      key: 'extractField',
      value: function extractField(model, hash, name, type, opts) {
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
      }
    }, {
      key: 'createModel',
      value: function createModel() {
        return this.typeFor(this.typeKey).create();
      }
    }, {
      key: 'typeFor',
      value: function typeFor(typeKey) {
        return this.context.typeFor(typeKey);
      }
    }]);
    return ModelSerializer;
  })(_Serializer2['default']);

  module.exports = ModelSerializer;
});


define('coalesce/serializers/number', ['exports', 'module', '../utils/is_empty', './base'], function (exports, module, _utilsIs_empty, _base) {
  'use strict';

  var _isEmpty = babelHelpers.interopRequireDefault(_utilsIs_empty);

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class NumberSerializer
  */

  var NumberSerializer = (function (_Serializer) {
    babelHelpers.inherits(NumberSerializer, _Serializer);

    function NumberSerializer() {
      babelHelpers.classCallCheck(this, NumberSerializer);
      babelHelpers.get(Object.getPrototypeOf(NumberSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(NumberSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized) {
        return (0, _isEmpty['default'])(serialized) ? null : Number(serialized);
      }
    }, {
      key: 'serialize',
      value: function serialize(deserialized) {
        return (0, _isEmpty['default'])(deserialized) ? null : Number(deserialized);
      }
    }]);
    return NumberSerializer;
  })(_Serializer2['default']);

  module.exports = NumberSerializer;
});


define('coalesce/serializers/revision', ['exports', 'module', '../utils/is_empty', './base'], function (exports, module, _utilsIs_empty, _base) {
  'use strict';

  var _isEmpty = babelHelpers.interopRequireDefault(_utilsIs_empty);

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class RevisionSerializer
  */

  var RevisionSerializer = (function (_Serializer) {
    babelHelpers.inherits(RevisionSerializer, _Serializer);

    function RevisionSerializer() {
      babelHelpers.classCallCheck(this, RevisionSerializer);
      babelHelpers.get(Object.getPrototypeOf(RevisionSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(RevisionSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized) {
        return serialized ? serialized : undefined;
      }
    }, {
      key: 'serialize',
      value: function serialize(deserialized) {
        return deserialized ? deserialized : undefined;
      }
    }]);
    return RevisionSerializer;
  })(_Serializer2['default']);

  module.exports = RevisionSerializer;
});


define('coalesce/serializers/string', ['exports', 'module', '../utils/is_none', './base'], function (exports, module, _utilsIs_none, _base) {
  'use strict';

  var _isNone = babelHelpers.interopRequireDefault(_utilsIs_none);

  var _Serializer2 = babelHelpers.interopRequireDefault(_base);

  /**
    @namespace serializers
    @class StringSerializer
  */

  var StringSerializer = (function (_Serializer) {
    babelHelpers.inherits(StringSerializer, _Serializer);

    function StringSerializer() {
      babelHelpers.classCallCheck(this, StringSerializer);
      babelHelpers.get(Object.getPrototypeOf(StringSerializer.prototype), 'constructor', this).apply(this, arguments);
    }

    babelHelpers.createClass(StringSerializer, [{
      key: 'deserialize',
      value: function deserialize(serialized) {
        return (0, _isNone['default'])(serialized) ? null : String(serialized);
      }
    }, {
      key: 'serialize',
      value: function serialize(deserialized) {
        return (0, _isNone['default'])(deserialized) ? null : String(deserialized);
      }
    }]);
    return StringSerializer;
  })(_Serializer2['default']);

  module.exports = StringSerializer;
});


define("coalesce/session/collection_manager", ["exports", "module"], function (exports, module) {
  /**
    Handles tracking deleted models and removing from collections.
  
    @class CollectionManager
  */
  "use strict";

  var CollectionManager = (function () {
    function CollectionManager() {
      babelHelpers.classCallCheck(this, CollectionManager);

      this.modelMap = {};
    }

    babelHelpers.createClass(CollectionManager, [{
      key: "register",
      value: function register(array, model) {
        var clientId = model.clientId,
            arrays = this.modelMap[clientId];
        if (!arrays) {
          arrays = this.modelMap[clientId] = [];
        }
        if (arrays.indexOf(array) !== -1) return;
        arrays.push(array);
      }
    }, {
      key: "unregister",
      value: function unregister(array, model) {
        var clientId = model.clientId,
            arrays = this.modelMap[clientId];
        if (arrays) {
          _.pull(arrays, array);
          if (arrays.length === 0) {
            delete this.modelMap[clientId];
          }
        }
      }
    }, {
      key: "modelWasDeleted",
      value: function modelWasDeleted(model) {
        var clientId = model.clientId,
            arrays = this.modelMap[clientId];

        if (arrays) {
          // clone this operation could mutate this array
          _.clone(arrays).forEach(function (array) {
            array.removeObject(model);
          });
        }
      }
    }]);
    return CollectionManager;
  })();

  module.exports = CollectionManager;
});


define('coalesce/session/flush', ['exports', 'module', '../collections/model_set', '../namespace', '../utils/array_from', '../utils/materialize_relationships', './operation'], function (exports, module, _collectionsModel_set, _namespace, _utilsArray_from, _utilsMaterialize_relationships, _operation) {
  'use strict';

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var _materializeRelationships = babelHelpers.interopRequireDefault(_utilsMaterialize_relationships);

  var _Operation = babelHelpers.interopRequireDefault(_operation);

  var remove = _.remove;

  var Flush = (function () {
    function Flush(session, models) {
      babelHelpers.classCallCheck(this, Flush);

      this.session = session;
      this.models = this.buildDirtySet(models);
      this.shadows = new _ModelSet['default']((0, _array_from['default'])(this.models).map(function (model) {
        // shadows are already frozen copies so no need to re-copy
        return session.shadows.getModel(model) || model.copy();
      }));
      this.results = [];
      this.pending = [];
      this.ops = new Map();
      this.build();
    }

    babelHelpers.createClass(Flush, [{
      key: 'build',
      value: function build() {
        var models = this.models,
            shadows = this.shadows,
            ops = this.ops,
            session = this.session;

        this.removeEmbeddedOrphans(models, shadows, session);

        // for embedded serialization purposes we need to materialize
        // all the lazy relationships in the set
        // (all of the copies have lazy models in their relationships)
        (0, _materializeRelationships['default'])(models);

        models.forEach(function (model) {

          var shadow = shadows.getModel(model);

          console.assert(shadow || model.isNew, "Shadow does not exist for non-new model");

          var op = this.getOp(model);
          op.shadow = shadow;

          var rels = op.dirtyRelationships;
          for (var i = 0; i < rels.length; i++) {
            var d = rels[i];
            var name = d.name;
            var parentModel = model[name] || d.oldValue && shadows.getModel(d.oldValue);
            // embedded children should not be dependencies
            var isEmbeddedRel = this.embeddedType(model.constructor, name);

            // TODO: handle hasMany's depending on adapter configuration
            if (parentModel && !isEmbeddedRel) {
              var parentOp = this.getOp(parentModel);
              parentOp.addChild(op);
            }
          }

          var isEmbedded = model.isEmbedded;

          if (op.isDirty && isEmbedded) {
            // walk up the embedded tree and mark root as dirty
            var rootModel = this.findEmbeddedRoot(model, models);
            var rootOp = this.getOp(rootModel);
            rootOp.force = true;

            // ensure the embedded parent is a parent of the operation
            var parentModel = model._parent;
            var parentOp = this.getOp(parentModel);

            // if the child already has some parents, they need to become
            // the parents of the embedded root as well
            op.parents.forEach(function (parent) {
              if (parent === rootOp) return;
              if (this.findEmbeddedRoot(parent.model, models) === rootModel) return;
              parent.addChild(rootOp);
            }, this);

            parentOp.addChild(op);
          }
        }, this);
      }

      /**
        @private
        Iterate over the models and remove embedded records
        that are missing their embedded parents.
      */
    }, {
      key: 'removeEmbeddedOrphans',
      value: function removeEmbeddedOrphans(models, shadows, session) {
        var orphans = [];
        models.forEach(function (model) {
          if (!model.isEmbedded) return;
          var root = this.findEmbeddedRoot(model, models);
          if (!root || root.isEqual(model)) {
            orphans.push(model);
          }
        }, this);
        models.removeObjects(orphans);
        shadows.removeObjects(orphans);
      }
    }, {
      key: 'findEmbeddedRoot',
      value: function findEmbeddedRoot(model, models) {
        var parent = model;
        while (parent) {
          model = parent;
          parent = model._parent;
        }
        // we want the version in the current session
        return models.getModel(model);
      }
    }, {
      key: 'embeddedType',
      value: function embeddedType(type, name) {
        return type.fields.get(name).embedded;
      }

      /**
        @private
        
        Build the set of dirty models that are part of the flush.
      */
    }, {
      key: 'buildDirtySet',
      value: function buildDirtySet(models) {
        var result = new _ModelSet['default']();
        models.forEach(function (model) {
          var copy = model.copy();
          copy.errors = null;
          result.add(copy);
        }, this);
        return result;
      }

      /**
        This callback is intendended to resolve the request ordering issue
        for parent models. For instance, when we have a Post -> Comments
        relationship, the parent post will be saved first. The request will
        return and it is likely that the returned JSON will have no comments.
        
        In this callback we re-evaluate the relationships after the children
        have been saved, effectively undoing the erroneous relationship results
        of the parent request.
        
        TODO: this should utilize the "owner" of the relationship
        TODO: move this to OperationGraph
      */
    }, {
      key: 'rebuildRelationships',
      value: function rebuildRelationships(children, parent) {
        parent.suspendRelationshipObservers(function () {
          // TODO: figure out a way to preserve ordering (or screw ordering and use sets)
          for (var i = 0; i < children.length; i++) {
            var child = children[i];

            child.eachLoadedRelationship(function (name, relationship) {
              // TODO: handle hasMany's for non-relational databases...
              if (relationship.kind === 'belongsTo') {
                var value = child[name],
                    inverse = child.constructor.inverseFor(name);

                if (inverse) {
                  if (!(parent instanceof inverse.parentType)) {
                    return;
                  }
                  // if embedded then we are certain the parent has the correct data
                  if (this.embeddedType(inverse.parentType, inverse.name)) {
                    return;
                  }

                  if (inverse.kind === 'hasMany' && parent.isFieldLoaded(inverse.name)) {
                    var parentCollection = parent[inverse.name];
                    if (child.isDeleted) {
                      parentCollection.removeObject(child);
                    } else if (value && value.isEqual(parent)) {
                      // TODO: make sure it doesn't already exists (or change model arrays to sets)
                      // TODO: think about 1-1 relationships
                      parentCollection.addObject(child);
                    }
                  }
                }
              }
            }, this);
          }
        }, this);
      }
    }, {
      key: 'perform',
      value: function perform() {
        var results = this.results,
            pending = this.pending,
            session = this.session;

        this.ops.forEach(function (op, model) {
          op.perform();
          this.trackOperation(op);
        }, this);

        return _Coalesce['default'].Promise.all(this.pending).then(function () {
          return results.map(function (model) {
            return session.merge(model);
          });
        }, function (err) {
          // all the promises that haven't finished, we need still merge them into
          // the session
          var failures = pending.map(function (op) {
            return op.fail();
          });
          results = results.concat(failures);
          throw results.map(function (model) {
            return session.merge(model);
          });
        });
      }
    }, {
      key: 'trackOperation',
      value: function trackOperation(op) {
        var results = this.results,
            pending = this.pending;
        pending.push(op);
        op.then(function (model) {
          results.push(model);
          remove(pending, op);
          return model;
        }, function (model) {
          results.push(model);
          remove(pending, op);
          throw model;
        });
      }
    }, {
      key: 'getOp',
      value: function getOp(model) {
        // ops is is a normal Ember.Map and doesn't use client
        // ids so we need to make sure that we are looking up
        // with the correct model instance
        var models = this.models,
            materializedModel = models.getModel(model);
        // TODO: we do this check since it is possible that some
        // lazy models are not part of `models`, a more robust
        // solution needs to be figured out for dealing with operations
        // on lazy models
        if (materializedModel) model = materializedModel;
        var op = this.ops.get(model);
        if (!op) {
          op = new _Operation['default'](this, model, this.shadows.getModel(model));
          this.ops.set(model, op);
        }
        return op;
      }
    }]);
    return Flush;
  })();

  module.exports = Flush;
});


define('coalesce/session/inverse_manager', ['exports', 'module', '../collections/model_set', '../utils/copy'], function (exports, module, _collectionsModel_set, _utilsCopy) {
  'use strict';

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _copy = babelHelpers.interopRequireDefault(_utilsCopy);

  /**
    Manages updating inverses within a session.
  
    @class InverseManager
  */

  var InverseManager = (function () {
    function InverseManager(session) {
      babelHelpers.classCallCheck(this, InverseManager);

      this.session = session;
      this.map = {};
    }

    babelHelpers.createClass(InverseManager, [{
      key: 'register',
      value: function register(model) {
        var session = this.session;

        model.eachLoadedRelationship(function (name, relationship) {
          // this is a copy that we mutate
          var existingInverses = this._inversesFor(model, name),
              inversesToClear = existingInverses.copy();

          function checkInverse(inverseModel) {
            session.reifyClientId(inverseModel);
            if (existingInverses.contains(inverseModel)) {
              // nothing to do, already registered
            } else {
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
            inverseModels.forEach(function (inverseModel) {
              checkInverse.call(this, inverseModel);
            }, this);
          }

          inversesToClear.forEach(function (inverseModel) {
            this.unregisterRelationship(model, name, inverseModel);
          }, this);
        }, this);
      }
    }, {
      key: 'unregister',
      value: function unregister(model) {
        var clientId = model.clientId,
            inverses = this._inverses(model);
        for (var name in inverses) {
          var inverseModels = inverses[name],
              copiedInverseModels = (0, _copy['default'])(inverseModels);

          copiedInverseModels.forEach(function (inverseModel) {
            this.unregisterRelationship(model, name, inverseModel);
          }, this);
        }
        delete this.map[clientId];
      }
    }, {
      key: 'registerRelationship',
      value: function registerRelationship(model, name, inverseModel) {
        var inverse = model.constructor.inverseFor(name);

        this._inversesFor(model, name).addObject(inverseModel);
        if (inverse) {
          this._inversesFor(inverseModel, inverse.name).addObject(model);
          this._addToInverse(inverseModel, inverse, model);
        }
      }
    }, {
      key: 'unregisterRelationship',
      value: function unregisterRelationship(model, name, inverseModel) {
        var inverse = model.constructor.inverseFor(name);

        this._inversesFor(model, name).removeObject(inverseModel);
        if (inverse) {
          this._inversesFor(inverseModel, inverse.name).removeObject(model);
          this._removeFromInverse(inverseModel, inverse, model);
        }
      }
    }, {
      key: '_inverses',
      value: function _inverses(model) {
        var clientId = model.clientId,
            inverses = this.map[clientId];

        if (!inverses) {
          inverses = this.map[clientId] = {};
        }

        return inverses;
      }
    }, {
      key: '_inversesFor',
      value: function _inversesFor(model, name) {
        var inverses = this._inverses(model);

        var inversesFor = inverses[name];
        if (!inversesFor) {
          inversesFor = inverses[name] = new _ModelSet['default']();
        }

        return inversesFor;
      }
    }, {
      key: '_addToInverse',
      value: function _addToInverse(model, inverse, inverseModel) {
        model = this.session.models.getModel(model);
        // make sure the inverse is loaded
        if (!model || !model.isFieldLoaded(inverse.name)) return;
        model.suspendRelationshipObservers(function () {
          if (inverse.kind === 'hasMany') {
            model[inverse.name].addObject(inverseModel);
          } else if (inverse.kind === 'belongsTo') {
            model[inverse.name] = inverseModel;
          }
        }, this);
      }
    }, {
      key: '_removeFromInverse',
      value: function _removeFromInverse(model, inverse, inverseModel) {
        model = this.session.models.getModel(model);
        // make sure the inverse is loaded
        if (!model || !model.isFieldLoaded(inverse.name)) return;
        model.suspendRelationshipObservers(function () {
          if (inverse.kind === 'hasMany') {
            model[inverse.name].removeObject(inverseModel);
          } else if (inverse.kind === 'belongsTo') {
            model[inverse.name] = null;
          }
        }, this);
      }
    }]);
    return InverseManager;
  })();

  module.exports = InverseManager;
});


define("coalesce/session/model_cache", ["exports", "module", "../namespace"], function (exports, module, _namespace) {
  "use strict";

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  /**
    Maintains a cache of model-related promises
  
    @class ModelCache
  */

  var ModelCache = (function () {
    function ModelCache() {
      babelHelpers.classCallCheck(this, ModelCache);

      this._promises = {};
    }

    babelHelpers.createClass(ModelCache, [{
      key: "add",
      value: function add(model) {
        var promise = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        if (this.shouldCache(model)) {
          if (!promise) {
            promise = _Coalesce["default"].Promise.resolve(model);
          }
        }

        if (promise) {
          this._promises[model.clientId] = promise;
        }

        // unlike query cache, we get the "entry" from the session directly
      }
    }, {
      key: "remove",
      value: function remove(model) {
        delete this._promises[model.clientId];
      }
    }, {
      key: "getPromise",
      value: function getPromise(model) {
        console.assert(model.clientId, "Model does not have a client id");

        var cached = this._promises[model.clientId];
        if (cached && this.shouldInvalidate(cached)) {
          this.remove(cached);
          return;
        }
        return cached;
      }

      // for now we only add the model if some attributes are loaded,
      // eventually this will be on a per-attribute basis
    }, {
      key: "shouldCache",
      value: function shouldCache(model) {
        return model.isPartiallyLoaded;
      }
    }, {
      key: "shouldInvalidate",
      value: function shouldInvalidate(model) {
        return false;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        // NOOP: needed for Ember's container
      }
    }], [{
      key: "create",
      value: function create(props) {
        return new this(props);
      }
    }]);
    return ModelCache;
  })();

  module.exports = ModelCache;
});


define('coalesce/session/operation', ['exports', 'module', '../namespace', '../utils/array_from'], function (exports, module, _namespace, _utilsArray_from) {
  'use strict';

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  /**
  @private
  An operation that is part of a flush
  
  @namespace rest
  @class Operation
  */

  var Operation = (function () {
    function Operation(flush, model, shadow) {
      var _this = this;

      babelHelpers.classCallCheck(this, Operation);

      this.model = model;
      this.shadow = shadow;
      this.flush = flush;
      this.adapter = this.flush.session.context.configFor(model).get('adapter');
      this.session = this.flush.session;
      // forces the operation to be performed
      this.force = false;
      this.children = new Set();
      this.parents = new Set();
      this.promise = new _Coalesce['default'].Promise(function (resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
      });
    }

    babelHelpers.createClass(Operation, [{
      key: 'then',
      value: function then() {
        var promise = this.promise;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return promise.then.apply(promise, args);
      }
    }, {
      key: 'addChild',
      value: function addChild(child) {
        this.children.add(child);
        child.parents.add(this);
      }

      // determine which relationships are affected by this operation
      // TODO: we should unify this with dirty checking
    }, {
      key: 'perform',
      value: function perform() {
        var _this2 = this;

        var promise,
            adapter = this.adapter,
            flush = this.flush;

        // perform after all parents have performed
        if (this.parents.size > 0) {
          promise = _Coalesce['default'].Promise.all((0, _array_from['default'])(this.parents)).then(function () {
            return _this2._perform();
          });
        } else {
          promise = this._perform();
        }

        if (this.children.size > 0) {
          promise = promise.then(function (model) {
            return _Coalesce['default'].Promise.all((0, _array_from['default'])(_this2.children)).then(function (models) {
              flush.rebuildRelationships(models, model);
              return model;
            }, function (models) {
              // XXX: should we still rebuild relationships since this request succeeded?
              throw model;
            });
          });
        }

        return promise;
      }
    }, {
      key: '_perform',
      value: function _perform() {
        var flush = this.flush,
            adapter = this.adapter,
            session = this.session,
            dirtyType = this.dirtyType,
            model = this.model,
            shadow = this.shadow,
            promise;

        if (!dirtyType || !adapter.shouldSave(model)) {
          if (model.isEmbedded) {
            // if embedded we want to extract the model from the result
            // of the parent operation
            promise = this._promiseFromEmbeddedParent();
          } else {
            // return an "identity" promise if we don't want to do anything
            promise = _Coalesce['default'].Promise.resolve();
          }
        } else if (dirtyType === "created") {
          promise = adapter._contextualizePromise(adapter._create(model), model);
        } else if (dirtyType === "updated") {
          promise = adapter._contextualizePromise(adapter._update(model), model);
        } else if (dirtyType === "deleted") {
          promise = adapter._contextualizePromise(adapter._deleteModel(model), model);
        }

        promise = promise.then(function (serverModel) {
          // in the case of new records we need to assign the id
          // of the model so dependent operations can use it
          // serverModel could be null (e.g. an embedded record removed from its parent)
          if (serverModel && !model.id) {
            model.id = serverModel.id;
          }
          if (!serverModel) {
            // if no data returned, assume that the server data
            // is the same as the model
            serverModel = model;
          } else {
            if (serverModel.meta && Object.keys(serverModel).length == 1) {
              model.meta = serverModel.meta;
              serverModel = model;
            }
            if (!serverModel.clientRev) {
              // ensure the clientRev is set on the returned model
              // 0 is the default value
              serverModel.clientRev = model.clientRev;
            }
          }
          return serverModel;
        }, function (serverModel) {
          // if the adapter returns errors we replace the
          // model with the shadow if no other model returned
          // TODO: could be more intuitive to move this logic
          // into adapter._contextualizePromise

          // there won't be a shadow if the model is new
          if (shadow && serverModel === model) {
            shadow.errors = serverModel.errors;
            throw shadow;
          }
          throw serverModel;
        });
        this.resolve(promise);
        return this;
      }

      // Fail this operation. This is called externally when this operation's
      // dependencies fail
    }, {
      key: 'fail',
      value: function fail() {
        var errors = this.adapter.serializerFactory.serializerFor('errors');
        // TODO: for now just set a status code, need to think through differentiating
        // types of errors, especially ones that are not field-specific
        errors.status = 0;
        this.model.errors = errors;
        return this.model;
      }
    }, {
      key: '_promiseFromEmbeddedParent',
      value: function _promiseFromEmbeddedParent() {
        var model = this.model,
            adapter = this.adapter;

        function findInParent(parentModel) {
          var res = null;
          parentModel.eachRelatedModel(function (child, embeddedType) {
            if (res) return;
            if (child.isEqual(model)) res = child;
          });
          return res;
        }

        return this._embeddedParent.then(function (parent) {
          return findInParent(parent);
        }, function (parent) {
          throw findInParent(parent);
        });
      }
    }, {
      key: 'diff',
      get: function get() {
        return this.model.diff(this.shadow);
      }
    }, {
      key: 'dirtyRelationships',
      get: function get() {
        var adapter = this.adapter,
            model = this.model,
            rels = [],
            shadow = this.shadow;

        if (model.isNew) {
          // if the model is new, all relationships are considered dirty
          model.eachRelationship(function (name, relationship) {
            if (adapter.isRelationshipOwner(relationship)) {
              rels.push({ name: name, type: relationship.kind, relationship: relationship, oldValue: null });
            }
          }, this);
        } else {
          // otherwise we check the diff to see if the relationship has changed,
          // in the case of a delete this won't really matter since it will
          // definitely be dirty
          var diff = this.diff;
          for (var i = 0; i < diff.length; i++) {
            var d = diff[i];
            if (d.relationship && adapter.isRelationshipOwner(d.relationship)) {
              rels.push(d);
            }
          }
        }

        return rels;
      }
    }, {
      key: 'isDirty',
      get: function get() {
        return !!this.dirtyType;
      }
    }, {
      key: 'isDirtyFromUpdates',
      get: function get() {
        var model = this.model,
            shadow = this.shadow,
            adapter = this.adapter;

        // this case could happen via a dirty relationship where the other side does
        // not have an inverse (in which case the model will not be dirty and hence no shadow)
        if (!shadow) return false;

        var diff = this.diff;
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
      }
    }, {
      key: 'dirtyType',
      get: function get() {
        var model = this.model;
        if (model.isNew) {
          return "created";
        } else if (model.isDeleted) {
          return "deleted";
        } else if (this.isDirtyFromUpdates || this.force) {
          return "updated";
        }
      }
    }, {
      key: '_embeddedParent',
      get: function get() {
        var model = this.model,
            parentModel = model._parent,
            flush = this.flush;

        console.assert(parentModel, "Embedded parent does not exist!");

        return flush.getOp(parentModel);
      }
    }]);
    return Operation;
  })();

  module.exports = Operation;
});


define('coalesce/session/query', ['exports', 'module', '../collections/observable_array'], function (exports, module, _collectionsObservable_array) {
  'use strict';

  var _ObservableArray2 = babelHelpers.interopRequireDefault(_collectionsObservable_array);

  var Query = (function (_ObservableArray) {
    babelHelpers.inherits(Query, _ObservableArray);

    function Query(session, type, params) {
      babelHelpers.classCallCheck(this, Query);

      babelHelpers.get(Object.getPrototypeOf(Query.prototype), 'constructor', this).call(this);
      this.session = session;
      this._type = type;
      this._params = params;
    }

    babelHelpers.createClass(Query, [{
      key: 'invalidate',
      value: function invalidate() {
        return this.session.invalidateQuery(this);
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        return this.session.refreshQuery(this);
      }
    }, {
      key: 'params',
      get: function get() {
        return this._params;
      }
    }, {
      key: 'type',
      get: function get() {
        return this._type;
      }
    }]);
    return Query;
  })(_ObservableArray2['default']);

  module.exports = Query;
});


define('coalesce/session/query_cache', ['exports', 'module', '../namespace'], function (exports, module, _namespace) {
  'use strict';

  var _Coalesce = babelHelpers.interopRequireDefault(_namespace);

  /**
    Maintains a cache of query-related promises
  
    @class QueryCache
  */

  var QueryCache = (function () {
    function QueryCache() {
      babelHelpers.classCallCheck(this, QueryCache);

      this._queries = {};
      this._promises = {};
    }

    babelHelpers.createClass(QueryCache, [{
      key: 'add',
      value: function add(query) {
        var promise = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var key = this.keyFor(query.type, query.params);

        if (promise && this.shouldCache(query)) {
          this._promises[key] = promise;
        }

        this._queries[key] = query;
      }
    }, {
      key: 'remove',
      value: function remove(query) {
        var key = this.keyFor(query.type, query.params);
        delete this._queries[key];
        delete this._promises[key];
      }
    }, {
      key: 'removeAll',
      value: function removeAll(type) {
        var queries = this._queries;
        for (var key in queries) {
          if (!queries.hasOwnProperty(key)) continue;
          var typeKey = key.split('$')[0];
          if (type.typeKey === typeKey) {
            this.remove(queries[key]);
          }
        }
      }
    }, {
      key: 'getQuery',
      value: function getQuery(type, params) {
        var key = this.keyFor(type, params);
        return this._queries[key];
      }
    }, {
      key: 'getPromise',
      value: function getPromise(query) {
        var key = this.keyFor(query.type, query.params),
            cached = this._promises[key];
        if (cached && this.shouldInvalidate(cached)) {
          this.remove(cached);
          return;
        }
        return cached;
      }
    }, {
      key: 'keyFor',
      value: function keyFor(type, params) {
        return type.typeKey + '$' + JSON.stringify(params);
      }
    }, {
      key: 'shouldCache',
      value: function shouldCache(query) {
        return true;
      }
    }, {
      key: 'shouldInvalidate',
      value: function shouldInvalidate(query) {
        return false;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        // NOOP: needed for Ember's container
      }
    }], [{
      key: 'create',
      value: function create(props) {
        return new this(props);
      }
    }]);
    return QueryCache;
  })();

  module.exports = QueryCache;
});


define('coalesce/session/session', ['exports', 'module', '../collections/model_array', '../collections/model_set', '../error', '../model/model', '../utils/array_from', '../utils/copy', '../utils/evented', './collection_manager', './flush', './inverse_manager', './query'], function (exports, module, _collectionsModel_array, _collectionsModel_set, _error, _modelModel, _utilsArray_from, _utilsCopy, _utilsEvented, _collection_manager, _flush, _inverse_manager, _query) {
  'use strict';

  var _ModelArray = babelHelpers.interopRequireDefault(_collectionsModel_array);

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  var _Error = babelHelpers.interopRequireDefault(_error);

  var _Model = babelHelpers.interopRequireDefault(_modelModel);

  var _array_from = babelHelpers.interopRequireDefault(_utilsArray_from);

  var _copy = babelHelpers.interopRequireDefault(_utilsCopy);

  var _evented = babelHelpers.interopRequireDefault(_utilsEvented);

  var _CollectionManager = babelHelpers.interopRequireDefault(_collection_manager);

  var _Flush = babelHelpers.interopRequireDefault(_flush);

  var _InverseManager = babelHelpers.interopRequireDefault(_inverse_manager);

  var _Query = babelHelpers.interopRequireDefault(_query);

  var uuid = 1;

  var Session = (function () {
    function Session(_ref) {
      var context = _ref.context;
      var idManager = _ref.idManager;
      var parent = _ref.parent;
      babelHelpers.classCallCheck(this, Session);

      this.context = context;
      this.idManager = idManager;
      this.parent = parent;
      this.models = new _ModelSet['default']();
      this.collectionManager = new _CollectionManager['default']();
      this.inverseManager = new _InverseManager['default'](this);
      this.shadows = new _ModelSet['default']();
      this.originals = new _ModelSet['default']();
      this.newModels = new _ModelSet['default']();
      this._dirtyCheckingSuspended = false;
      this.name = "session" + uuid++;
    }

    /**
      Instantiates a model but does *not* add it to the session. This is equivalent
      to calling `create` on the model's class itself.
      
      @method create
      @param {String} type the typeKey of the model
      @param {Object} hash the initial attributes of the model
      @return {Model} the instantiated model
    */
    babelHelpers.createClass(Session, [{
      key: 'build',
      value: function build(type, hash) {
        type = this._typeFor(type);
        var model = type.create(hash || {});
        return model;
      }

      /**
        Creates a model within the session.
        
        @method create
        @param {String} type the typeKey of the model
        @param {Object} hash the initial attributes of the model
        @return {Model} the created model
      */
    }, {
      key: 'create',
      value: function create(type, hash) {
        var model = this.build(type, hash);
        return this.add(model);
      }
    }, {
      key: 'adopt',
      value: function adopt(model) {
        this.reifyClientId(model);
        console.assert(!model.session || model.session === this, "Models instances cannot be moved between sessions. Use `add` or `update` instead.");
        console.assert(!this.models.getModel(model) || this.models.getModel(model) === model, "An equivalent model already exists in the session!");

        if (model.isNew) {
          this.newModels.add(model);
        }
        // Only loaded models are stored on the session
        if (!model.session) {
          this.models.add(model);
          // Need to register with the inverse manager before being added to the
          // session. Otherwise, in a child session, the entire graph will be
          // materialized.
          this.inverseManager.register(model);
          model.session = this;
        }
        return model;
      }

      /**
        Adds a model to this session. Some cases below:
         If the model is detached (meaning not currently associated with a session),
        then the model will be re-used in this session. The entire graph of detached
        objects will be traversed and added to the session.
         If the model is already associated with this session in *loaded form* (not necessarily
        the same instance that is passed in), this method is a NO-OP.
         If the model is already associated with a *different* session then the model
        will be copied to this session. In order to prevent large graphs from being
        copied, all relations will be copied in lazily.
         TODO: when adding *non-new* models we should think through the semantics.
        For now we assume this only works with new models or models from a parent session.
         @method add
        @param {Coalesce.Model} model The model to add to the session
      */
    }, {
      key: 'add',
      value: function add(model) {
        this.reifyClientId(model);

        var dest = this.getModel(model);
        if (dest) return dest;

        if (model.session === this) return model;

        // If new and detached we can re-use. If the model is
        // detached but *not* new we have undefined semantics
        // so for the time being we just create a lazy copy.
        if (model.isNew && model.isDetached) {
          dest = model;
        } else if (model.isNew) {
          dest = model.copy();
          // TODO: we need to recurse here for new children, otherwise
          // they will become lazy
        } else {
            // TODO: model copy creates lazy copies for the
            // relationships. How do we update the inverse here?
            dest = model.lazyCopy();
          }
        return this.adopt(dest);
      }

      /**
        Removes the model from the session.
         This does not mean that the model has been necessarily deleted,
        just that the session should no longer keep track of it.
         @method remove
        @param {Coalesce.Model} model The model to remove from the session
      */
    }, {
      key: 'remove',
      value: function remove(model) {
        // TODO: think through relationships that still reference the model
        this.models.remove(model);
        this.shadows.remove(model);
        this.originals.remove(model);
      }

      /**
        Updates a model in this session using the passed in model as a reference.
         If the passed in model is not already associated with this session, this
        is equivalent to adding the model to the session.
         If the model already is associated with this session, then the existing
        model will be updated.
         @method update
        @param {Coalesce.Model} model A model containing updated properties
      */
    }, {
      key: 'update',
      value: function update(model) {
        this.reifyClientId(model);
        var dest = this.getModel(model);

        if (model.isNew && !dest) {
          dest = model.constructor.create();
          // need to set the clientId for adoption
          dest.clientId = model.clientId;
          this.adopt(dest);
        }

        // if the model is detached or does not exist
        // in the target session, updating is semantically
        // equivalent to adding
        if (model.isDetached || !dest) {
          return this.add(model);
        }

        // handle deletion
        if (model.isDeleted) {
          // no-op if already deleted
          if (!dest.isDeleted) {
            this.deleteModel(dest);
          }
          return dest;
        }

        model.copyAttributes(dest);
        model.copyMeta(dest);

        model.eachLoadedRelationship(function (name, relationship) {
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
      }
    }, {
      key: 'deleteModel',
      value: function deleteModel(model) {
        // if the model is new, deleting should essentially just
        // remove the object from the session
        if (model.isNew) {
          var newModels = this.newModels;
          newModels.remove(model);
        } else {
          this.modelWillBecomeDirty(model);
        }
        model.isDeleted = true;
        this.collectionManager.modelWasDeleted(model);
        this.inverseManager.unregister(model);
      }

      /**
        Returns the model corresponding to the given typeKey and id
        or instantiates a new model if one does not exist.
         @returns {Model}
      */
    }, {
      key: 'fetch',
      value: function fetch(type, id) {
        type = this._typeFor(type);
        var typeKey = type.typeKey;
        // Always coerce to string
        id = id + '';

        var model = this.getForId(typeKey, id);
        if (!model) {
          model = this.build(typeKey, { id: id });
          this.adopt(model);
        }

        return model;
      }

      /**
        Loads the model corresponding to the given typeKey and id.
         @returns {Promise}
      */
    }, {
      key: 'load',
      value: function load(type, id, opts) {
        var model = this.fetch(type, id);
        return this.loadModel(model, opts);
      }

      /**
        Ensures data is loaded for a model.
         @returns {Promise}
      */
    }, {
      key: 'loadModel',
      value: function loadModel(model, opts) {
        console.assert(model.id, "Cannot load a model with an id");
        // TODO: this should be done on a per-attribute bases
        var cache = this._modelCacheFor(model),
            promise = cache.getPromise(model),
            adapter = this._adapterFor(model);

        if (promise) {
          // the cache's promise is not guaranteed to return anything
          promise = promise.then(function () {
            return model;
          });
        } else {
          promise = adapter.load(model, opts, this);
          cache.add(model, promise);
        }

        return promise;
      }

      /**
        Similar to `loadModel`, but guarntees a trip to the server and skips the
        session level model cache.
        
        @params {Model} model the model to refresh
        @return {Promise}
      */
    }, {
      key: 'refresh',
      value: function refresh(model, opts) {
        var session = this,
            adapter = this._adapterFor(model);
        return adapter.load(model, opts, this);
      }

      /**
        @deprecated
        
        Delegates to either `query` or `load` based on the parameter types
        
        @returns {Promise}
      */
    }, {
      key: 'find',
      value: function find(type, query, opts) {
        if (typeof query === 'object') {
          return this.query(type, query, opts);
        }
        return this.load(type, query, opts);
      }

      /**
        @private
        
        Build a query instance
      */
    }, {
      key: 'buildQuery',
      value: function buildQuery(type, params) {
        type = this._typeFor(type);
        return new _Query['default'](this, type, params);
      }

      /**
        Similar to `fetch`, this method returns a cached local result of the query
        without a trip to the server.
        
        @param {Type} type the type to query against
        @param {object} params the query parameters
        @return {Query}
      */
    }, {
      key: 'fetchQuery',
      value: function fetchQuery(type, params) {
        type = this._typeFor(type);
        var queryCache = this._queryCacheFor(type),
            query = queryCache.getQuery(type, params);

        if (!query) {
          query = this.buildQuery(type, params);
          queryCache.add(query);
        }

        return query;
      }

      /**
        Queries the server.
        
        @param {Type} type Type to query against
        @param {object} params Query parameters
        @param {object} opts Additional options
        @return {Promise}
      */
    }, {
      key: 'query',
      value: function query(type, params, opts) {
        var type = this._typeFor(type),
            query = this.fetchQuery(type, params),
            queryCache = this._queryCacheFor(type),
            promise = queryCache.getPromise(query);

        if (!promise) {
          promise = this.refreshQuery(query, opts);
        }

        return promise;
      }

      /**
        Queries the server and bypasses the cache.
        
        @param {Type} type Type to query against
        @param {object} params Query parameters
        @param {object} opts Additional options
        @return {Promise}
      */
    }, {
      key: 'refreshQuery',
      value: function refreshQuery(query, opts) {
        // TODO: for now we populate the query in the session, eventually this
        // should be done in the adapter layer a la models
        var adapter = this._adapterFor(query.type),
            promise = adapter.query(query.type.typeKey, query.params, opts, this).then(function (models) {
          query.meta = models.meta;
          query.replace(0, query.length, models);
          return query;
        });
        var queryCache = this._queryCacheFor(query.type);
        queryCache.add(query, promise);

        return promise;
      }

      /**
        Sends all local changes down to the server
        
        @return {Promise}
      */
    }, {
      key: 'flush',
      value: function flush() {
        var session = this,
            dirtyModels = this.dirtyModels,
            newModels = this.newModels,
            shadows = this.shadows;

        this.emit('willFlush', dirtyModels);

        var flush = new _Flush['default'](this, dirtyModels),
            promise = flush.perform();

        // Optimistically assume updates will be
        // successful. Copy shadow models into
        // originals and remove the shadow.
        dirtyModels.forEach(function (model) {
          // track original to merge against new data that
          // hasn't seen client updates
          var original = this.originals.getModel(model);
          var shadow = this.shadows.getModel(model);
          if (shadow && (!original || original.rev < shadow.rev)) {
            this.originals.add(shadow);
          }
          this.markClean(model);
        }, this);
        newModels.clear();

        return promise;
      }
    }, {
      key: 'getModel',
      value: function getModel(model) {
        var res = this.models.getModel(model);
        if (!res && this.parent) {
          res = this.parent.getModel(model);
          if (res) {
            res = res.fork(this);
            // TODO: is there a better place for this?
            this.updateCache(res);
          }
        }
        return res;
      }
    }, {
      key: 'getForId',
      value: function getForId(typeKey, id) {
        var clientId = this.idManager.getClientId(typeKey, id);
        return this.getForClientId(clientId);
      }
    }, {
      key: 'getForClientId',
      value: function getForClientId(clientId) {
        var res = this.models.getForClientId(clientId);
        if (!res && this.parent) {
          res = this.parent.getForClientId(clientId);
          if (res) {
            res = this.adopt(res.copy());
            // TODO: is there a better place for this?
            this.updateCache(res);
          }
        }
        return res;
      }
    }, {
      key: 'reifyClientId',
      value: function reifyClientId(model) {
        this.idManager.reifyClientId(model);
      }
    }, {
      key: 'remoteCall',
      value: function remoteCall(context, name, params, opts) {
        var session = this,
            adapter = this._adapterFor(context);

        if (opts && opts.deserializationContext && typeof opts.deserializationContext !== 'string') {
          opts.deserializationContext = opts.deserializationContext.typeKey;
        }

        return adapter.remoteCall(context, name, params, opts, this);
      }
    }, {
      key: 'modelWillBecomeDirty',
      value: function modelWillBecomeDirty(model) {
        if (this._dirtyCheckingSuspended) {
          return;
        }
        // Embedded models dirty their parents as well
        if (model._parent) {
          this.modelWillBecomeDirty(model._parent);
        }
        this.touch(model);
      }
    }, {
      key: 'suspendDirtyChecking',
      value: function suspendDirtyChecking(callback, binding) {
        var self = this;

        // could be nested
        if (this._dirtyCheckingSuspended) {
          return callback.call(binding || self);
        }

        try {
          this._dirtyCheckingSuspended = true;
          return callback.call(binding || self);
        } finally {
          this._dirtyCheckingSuspended = false;
        }
      }
    }, {
      key: 'newSession',
      value: function newSession() {
        var child = this.constructor.create({
          parent: this,
          context: this.context,
          idManager: this.idManager
        });
        return child;
      }
    }, {
      key: 'getShadow',
      value: function getShadow(model) {
        var shadows = this.shadows;
        var models = this.models;
        // shadows are only created when the model is dirtied,
        // if no model exists in the `shadows` property then
        // it is safe to assume the model has not been modified
        return shadows.getModel(model) || models.getModel(model);
      }

      /**
        @private
         Updates the promise cache
      */
    }, {
      key: 'updateCache',
      value: function updateCache(model) {
        var cache = this._modelCacheFor(model);
        cache.add(model);
      }

      /**
        Invalidate the cache for a particular model. This has the
        effect of making the next `load` call hit the server.
         @method invalidate
        @param {Model} model
      */
    }, {
      key: 'invalidate',
      value: function invalidate(model) {
        var cache = this._modelCacheFor(model);
        cache.remove(model);
      }

      /**
        Invalidate the cache for a particular query.
         @method invalidateQuery
        @param {Query} query
      */
    }, {
      key: 'invalidateQuery',
      value: function invalidateQuery(query) {
        var queryCache = this._queryCacheFor(query.type);
        queryCache.remove(query);
      }

      /**
        Invalidate the cache for all queries corresponding to a particular Type.
         @method invalidateQueries
        @param {Type} type Type to invalidate
      */
    }, {
      key: 'invalidateQueries',
      value: function invalidateQueries(type) {
        var type = this._typeFor(type),
            queryCache = this._queryCacheFor(type);
        queryCache.removeAll(type);
      }

      /**
        Mark a model as clean. This will prevent future
        `flush` calls from persisting this model's state to
        the server until the model is marked dirty again.
         @method markClean
        @param {Coalesce.Model} model
      */
    }, {
      key: 'markClean',
      value: function markClean(model) {
        // as an optimization, model's without shadows
        // are assumed to be clean
        this.shadows.remove(model);
      }

      /**
        Mark a model as dirty. This will cause this model
        to be sent to the adapter during a flush.
         @method touch
        @param {Coalesce.Model} model
      */
    }, {
      key: 'touch',
      value: function touch(model) {
        if (!model.isNew) {
          var shadow = this.shadows.getModel(model);
          if (!shadow) {
            this.shadows.addObject(model.copy());
          }
        }
        model.bump();
      }

      /**
        Whether or not the session is dirty.
         @property isDirty
      */
    }, {
      key: 'mergeData',

      /**
        Merge in raw serialized data into this session
        for the corresponding type.
         @method mergeData
        @param {Object} data the raw unserialized data
        @param String [typeKey] the name of the type that the data corresponds to
        @returns {any} the deserialized models that were merged in
      */
      value: function mergeData(data, typeKey) {
        return this._adapterFor(typeKey).mergeData(data, typeKey, this);
      }

      /**
        Update the parent session with all changes local
        to this child session.
         @method updateParent
      */
    }, {
      key: 'updateParent',
      value: function updateParent() {
        if (!this.parent) {
          throw new _Error['default']("Session does not have a parent");
        }
        // flush all local updates to the parent session
        var dirty = this.dirtyModels,
            parent = this.parent;

        dirty.forEach(function (model) {
          // XXX: we want to do this, but we need to think about
          // revision numbers. The parent's clientRev needs to tbe
          // the childs normal rev.

          // "rebase" against parent version
          // var parentModel = parent.getModel(model);
          // if(parentModel) {
          //   this.merge(parentModel);
          // }

          // update the values of a corresponding model in the parent session
          // if a corresponding model doesn't exist, its added to the parent session
          parent.update(model);
        }, this);
      }

      /**
        Similar to `flush()` with the additional effect that the models will
        be immediately updated in the parent session. This is useful when
        you want to optimistically assume success.
         @method flushIntoParent
      */
    }, {
      key: 'flushIntoParent',
      value: function flushIntoParent() {
        if (!this.parent) {
          throw new _Error['default']("Session does not have a parent");
        }
        this.updateParent();
        return this.flush();
      }

      /**
        Merges new data for a model into this session.
         If the corresponding model inside the session is "dirty"
        and has not been successfully flushed, the local changes
        will be merged against these changes.
         By default, if no server versioning information is specified,
        this data is assumed to be more current than what is in
        the session. If no client versioning information is specified,
        this data is assumed to have not seen the latest client changes.
         @method merge
        @param {Coalesce.Model} model The model to merge
        @param {Set} [visited] Cache used to break recursion. This is required for non-version-aware backends.
      */
    }, {
      key: 'merge',
      value: function merge(model, visited) {
        console.assert(model.isModel, model + ' is not a model');
        if (this.parent) {
          model = this.parent.merge(model, visited);
        }

        this.reifyClientId(model);

        if (!visited) visited = new Set();

        if (visited.has(model)) {
          return this.getModel(model);
        }
        visited.add(model);

        this.emit('willMerge', model);

        this.updateCache(model);

        var detachedChildren = [];
        // Since we re-use objects during merge if they are detached,
        // we need to precompute all detached children
        model.eachChild(function (child) {
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

        this.emit('didMerge', model);
        return merged;
      }
    }, {
      key: 'mergeModels',
      value: function mergeModels(models) {
        var merged = new _ModelArray['default']();
        merged.session = this;
        merged.addObjects(models);
        merged.meta = models.meta;
        var session = this;
        models.forEach(function (model) {
          merged.pushObject(session.merge(model));
        });
        return merged;
      }
    }, {
      key: '_mergeSuccess',
      value: function _mergeSuccess(model) {
        var models = this.models,
            shadows = this.shadows,
            newModels = this.newModels,
            originals = this.originals,
            merged,
            ancestor,
            existing = models.getModel(model),
            shadow = shadows.getModel(model);

        if (existing && this._containsRev(existing, model)) {
          return existing;
        }

        var hasClientChanges = !shadow || this._containsClientRev(model, shadow);

        if (hasClientChanges) {
          // If has latest client rev, merge against the shadow
          ancestor = shadow;
        } else {
          // If doesn't have the latest client rev, merge against original
          ancestor = originals.getModel(model);
        }

        this.suspendDirtyChecking(function () {
          merged = this._mergeModel(existing, ancestor, model);
        }, this);

        if (hasClientChanges) {
          // after merging, if the record is deleted, we remove
          // it entirely from the session
          if (merged.isDeleted) {
            this.remove(merged);
          } else {
            // After a successful merge we update the shadow to the
            // last known value from the server. As an optimization,
            // we only create shadows if the model has been dirtied.
            if (shadows.contains(model)) {
              // TODO: should remove unless client has unflushed changes
              shadows.addData(model);
            }

            // Once the server has seen our local changes, the original
            // is no longer needed
            originals.remove(model);

            if (!merged.isNew) {
              newModels.remove(merged);
            }
          }
        } else {}
        // TODO: what should we do with the shadow if the merging ancestor
        // is the original? In order to update, it would require knowledge
        // of how the server handles merging (if at all)

        // clear the errors on the merged model
        // TODO: we need to do a proper merge here
        merged.errors = null;

        return merged;
      }
    }, {
      key: '_mergeError',
      value: function _mergeError(model) {
        var models = this.models,
            shadows = this.shadows,
            newModels = this.newModels,
            originals = this.originals,
            merged,
            ancestor,
            existing = models.getModel(model),

        // If a shadow does not exist this could be an error during
        // a create operation. In this case, if the server has seen
        // the client's changes we should merge using the new model
        // as the ancestor. This case could happen if the server manipulates
        // the response to return valid values without saving.
        shadow = shadows.getModel(model) || existing;

        if (!existing) {
          // This case could happen on error during create inside child session
          return model;
        }

        var original = originals.getModel(model);

        var hasClientChanges = this._containsClientRev(model, shadow);
        if (hasClientChanges) {
          // If has latest client rev, merge against the shadow.
          ancestor = shadow;
        } else {
          // If doesn't have the latest client rev, merge against original
          ancestor = original;
        }

        // TODO: load errors are merged here, harmless since no loaded data, but
        // need to rethink
        // only merge if we haven't already seen this version
        if (ancestor && !this._containsRev(existing, model)) {
          this.suspendDirtyChecking(function () {
            merged = this._mergeModel(existing, ancestor, model);
          }, this);
        } else {
          merged = existing;
        }

        // set the errors on the merged model
        // TODO: we need to do a proper merge here
        merged.errors = (0, _copy['default'])(model.errors);

        if (!model.isNew && original) {
          // "rollback" shadow to the original
          shadows.addData(original);
          // add any new loaded data from the server
          // TODO: rethink case above here where "the server returns valid values without saving"
          // we should not update the model in this case
          shadows.addData(model);

          // the shadow is now the server version, so no reason to
          // keep the original around
          originals.remove(model);
        } else if (model.isNew) {
          // re-track the model as a new model
          newModels.add(existing);
        }

        return merged;
      }
    }, {
      key: '_mergeModel',
      value: function _mergeModel(dest, ancestor, model) {
        // if the model does not exist, no "merging"
        // is required
        if (!dest) {
          if (model.isDetached) {
            dest = model;
          } else {
            dest = model.copy();
          }

          this.adopt(dest);
          return dest;
        }

        // set id for new records
        dest.id = model.id;
        dest.clientId = model.clientId;
        // copy the server revision
        dest.rev = model.rev;

        // TODO: move merging isDeleted into merge strategy
        // dest.isDeleted = model.isDeleted;

        //XXX: why do we need this? at this point shouldn't the dest always be in
        // the session?
        this.adopt(dest);

        // as an optimization we might not have created a shadow
        if (!ancestor) {
          ancestor = dest;
        }

        // Reify child client ids before merging. This isn't semantically
        // required, but many data structures that might be used in the merging
        // process use client ids.
        model.eachChild(function (child) {
          this.reifyClientId(child);
        }, this);

        var strategy = this._mergeStrategyFor(model.typeKey);
        strategy.merge(dest, ancestor, model);

        return dest;
      }
    }, {
      key: '_containsRev',
      value: function _containsRev(modelA, modelB) {
        if (!modelA.rev) return false;
        if (!modelB.rev) return false;
        return modelA.rev >= modelB.rev;
      }
    }, {
      key: '_containsClientRev',
      value: function _containsClientRev(modelA, modelB) {
        return modelA.clientRev >= modelB.clientRev;
      }
    }, {
      key: '_typeFor',
      value: function _typeFor(key) {
        return this.context.typeFor(key);
      }
    }, {
      key: '_adapterFor',
      value: function _adapterFor(key) {
        return this.context.configFor(key).get('adapter');
      }
    }, {
      key: '_modelCacheFor',
      value: function _modelCacheFor(key) {
        return this.context.configFor(key).get('modelCache');
      }
    }, {
      key: '_queryCacheFor',
      value: function _queryCacheFor(key) {
        return this.context.configFor(key).get('queryCache');
      }
    }, {
      key: '_mergeStrategyFor',
      value: function _mergeStrategyFor(key) {
        return this.context.configFor(key).get('mergeStrategy');
      }
    }, {
      key: 'toString',
      value: function toString() {
        var res = this.name;
        if (this.parent) {
          res += "(child of " + this.parent.toString() + ")";
        }
        return res;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        // NOOP: needed for Ember's container
      }
    }, {
      key: 'dirtyModels',
      get: function get() {
        var models = new _ModelSet['default']((0, _array_from['default'])(this.shadows).map(function (model) {
          return this.models.getModel(model);
        }, this));

        this.newModels.forEach(function (model) {
          models.add(model);
        });

        return models;
      }
    }, {
      key: 'isDirty',
      get: function get() {
        return this.dirtyModels.size > 0;
      }
    }], [{
      key: 'create',
      value: function create(props) {
        return new this(props);
      }
    }]);
    return Session;
  })();

  module.exports = Session;

  (0, _evented['default'])(Session.prototype);
});


define("coalesce/utils/array_from", ["exports", "module"], function (exports, module) {
  // When using firefox, we cannot use Array.from since it apparently does not
  // support custom iterables
  // XXX: always use forEach until we get to the bottom of firefox issues
  "use strict";

  module.exports = from_array;
  var USE_NATIVE = false; // typeof Set.prototype[Symbol.iterator] !== 'undefined';

  function from_array(iterable) {

    if (USE_NATIVE || Array.isArray(iterable)) {
      return Array.from.apply(this, arguments);
    }

    var res = [];
    iterable.forEach(function (value) {
      res.push(value);
    });
    return res;
  }
});


define("coalesce/utils/base_class", ["exports", "module"], function (exports, module) {
  /**
    @private
  
    All classes extend this class. Provides additonal object model helper
    methods.
  
    @namespace utils
    @class Base
  */
  "use strict";

  var Base = (function () {
    function Base() {
      babelHelpers.classCallCheck(this, Base);
    }

    babelHelpers.createClass(Base, [{
      key: "destroy",
      value: function destroy() {
        // NOOP: Needed for Ember's container
      }
    }], [{
      key: "create",

      // Legacy Ember.js Object Model methods
      value: function create(props) {
        return new this(props);
      }
    }, {
      key: "reopen",
      value: function reopen(props) {
        for (var key in props) {
          if (!props.hasOwnProperty(key)) return;
          this.prototype[key] = props[key];
        }
        return this;
      }
    }, {
      key: "extend",
      value: function extend(props) {
        var klass = (function (_ref) {
          babelHelpers.inherits(klass, _ref);

          function klass() {
            babelHelpers.classCallCheck(this, klass);
            babelHelpers.get(Object.getPrototypeOf(klass.prototype), "constructor", this).apply(this, arguments);
          }

          return klass;
        })(this);
        klass.reopen(props);
        return klass;
      }
    }, {
      key: "reopenClass",
      value: function reopenClass(props) {
        for (var key in props) {
          if (!props.hasOwnProperty(key)) return;
          this[key] = props[key];
        }
        return this;
      }
    }]);
    return Base;
  })();

  module.exports = Base;
});


define('coalesce/utils/copy', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = copy;
  function _copy(obj, deep, seen, copies) {
    var ret, loc, key;

    // primitive data types are immutable, just return them.
    if ('object' !== typeof obj || obj === null) return obj;
    if (obj.copy && typeof obj.copy === 'function') return obj.copy(deep);

    // avoid cyclical loops
    if (deep && (loc = seen.indexOf(obj)) >= 0) return copies[loc];

    if (obj instanceof Array) {
      ret = obj.slice();
      if (deep) {
        loc = ret.length;
        while (--loc >= 0) ret[loc] = _copy(ret[loc], deep, seen, copies);
      }
    } else if (obj instanceof Date) {
      ret = new Date(obj.getTime());
    } else {
      ret = {};
      for (key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        // Prevents browsers that don't respect non-enumerability from
        // copying internal Ember properties
        if (key.substring(0, 2) === '__') continue;

        ret[key] = deep ? _copy(obj[key], deep, seen, copies) : obj[key];
      }
    }

    if (deep) {
      seen.push(obj);
      copies.push(ret);
    }

    return ret;
  }

  /**
    Creates a clone of the passed object. This function can take just about
    any type of object and create a clone of it, including primitive values
    (which are not actually cloned because they are immutable).
  
    If the passed object implements the `clone()` method, then this function
    will simply call that method and return the result.
  
    @method copy
    @param {Object} obj The object to clone
    @param {Boolean} deep If true, a deep copy of the object is made
    @return {Object} The cloned object
  */

  function copy(obj, deep) {
    return _copy(obj, deep, deep ? [] : null, deep ? [] : null);
  }
});


define("coalesce/utils/evented", ["exports", "module"], function (exports, module) {
  // dead simple event implementation based on https://github.com/allouis/minivents/blob/master/minivents.js

  "use strict";

  module.exports = function (target) {
    var events = {};
    target = target || this;
    /**
     *  On: listen to events
     */
    target.on = function (type, func, ctx) {
      events[type] = events[type] || [];
      events[type].push({ f: func, c: ctx });
    };
    /**
     *  Off: stop listening to event / specific callback
     */
    target.off = function (type, func) {
      type || (events = {});
      var list = events[type] || [],
          i = list.length = func ? list.length : 0;
      while (i-- > 0) func == list[i].f && list.splice(i, 1);
    };
    /** 
     * Emit: send event, callbacks will be triggered
     */
    target.emit = function () {
      var args = Array.apply([], arguments),
          list = events[args.shift()] || [],
          i = 0,
          j;
      for (; j = list[i++];) j.f.apply(j.c, args);
    };
  };
});


define('coalesce/utils/inflector', ['exports'], function (exports) {
  //
  // Largely taken from https://github.com/jeremyruppel/underscore.inflection and Ember.js
  //

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.gsub = gsub;
  exports.plural = plural;
  exports.pluralize = pluralize;
  exports.singular = singular;
  exports.singularize = singularize;
  exports.irregular = irregular;
  exports.uncountable = uncountable;
  exports.ordinalize = ordinalize;
  exports.titleize = titleize;
  exports.resetInflections = resetInflections;
  exports.decamelize = decamelize;
  exports.dasherize = dasherize;
  exports.camelize = camelize;
  exports.classify = classify;
  exports.underscore = underscore;
  exports.capitalize = capitalize;
  var plurals = [];
  var singulars = [];
  var uncountables = [];

  /**
   * `gsub` is a method that is just slightly different than our
   * standard `String#replace`. The main differences are that it
   * matches globally every time, and if no substitution is made
   * it returns `null`. It accepts a string for `word` and
   * `replacement`, and `rule` can be either a string or a regex.
   */

  function gsub(word, rule, replacement) {
    var pattern = new RegExp(rule.source || rule, 'gi');

    return pattern.test(word) ? word.replace(pattern, replacement) : null;
  }

  /**
   * `plural` creates a new pluralization rule for the inflector.
   * `rule` can be either a string or a regex.
   */

  function plural(rule, replacement) {
    plurals.unshift([rule, replacement]);
  }

  /**
   * Pluralizes the string passed to it. It also can accept a
   * number as the second parameter. If a number is provided,
   * it will pluralize the word to match the number. Optionally,
   * you can pass `true` as a third parameter. If found, this
   * will include the count with the output.
   */

  function pluralize(word, count, includeNumber) {
    var result;

    if (count !== undefined) {
      count = parseFloat(count);
      result = count === 1 ? singularize(word) : pluralize(word);
      result = includeNumber ? [count, result].join(' ') : result;
    } else {
      if (_(uncountables).include(word)) {
        return word;
      }

      result = word;

      _(plurals).detect(function (rule) {
        var res = gsub(word, rule[0], rule[1]);

        return res ? result = res : false;
      }, this);
    }

    return result;
  }

  /**
   * `singular` creates a new singularization rule for the
   * inflector. `rule` can be either a string or a regex.
   */

  function singular(rule, replacement) {
    singulars.unshift([rule, replacement]);
  }

  /**
   * `singularize` returns the singular version of the plural
   * passed to it.
   */

  function singularize(word) {
    if (_(uncountables).include(word)) {
      return word;
    }

    var result = word;

    _(singulars).detect(function (rule) {
      var res = gsub(word, rule[0], rule[1]);

      return res ? result = res : false;
    }, this);

    return result;
  }

  /**
   * `irregular` is a shortcut method to create both a
   * pluralization and singularization rule for the word at
   * the same time. You must supply both the singular form
   * and the plural form as explicit strings.
   */

  function irregular(s, p) {
    plural('\\b' + singular + '\\b', p);
    singular('\\b' + plural + '\\b', s);
  }

  /**
   * `uncountable` creates a new uncountable rule for `word`.
   * Uncountable words do not get pluralized or singularized.
   */

  function uncountable(word) {
    uncountables.unshift(word);
  }

  /**
   * `ordinalize` adds an ordinal suffix to `number`.
   */

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

  /**
   * `titleize` capitalizes the first letter of each word in
   * the string `words`. It preserves the existing whitespace.
   */

  function titleize(words) {
    if (typeof words !== 'string') {
      return words;
    }

    return words.replace(/\S+/g, function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
  }

  /**
   * Resets the inflector's rules to their initial state,
   * clearing out any custom rules that have been added.
   */

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

  var STRING_DASHERIZE_REGEXP = /[ _]/g;
  var STRING_DASHERIZE_CACHE = {};
  var STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
  var STRING_CAMELIZE_REGEXP = /(\-|_|\.|\s)+(.)?/g;
  var STRING_UNDERSCORE_REGEXP_1 = /([a-z\d])([A-Z]+)/g;
  var STRING_UNDERSCORE_REGEXP_2 = /\-|\s+/g;

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
    return str.replace(STRING_CAMELIZE_REGEXP, function (match, separator, chr) {
      return chr ? chr.toUpperCase() : '';
    }).replace(/^([A-Z])/, function (match, separator, chr) {
      return match.toLowerCase();
    });
  }

  function classify(str) {
    var parts = str.split("."),
        out = [];

    for (var i = 0, l = parts.length; i < l; i++) {
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
});


define('coalesce/utils/is_empty', ['exports', 'module', './is_none'], function (exports, module, _is_none) {
  'use strict';

  module.exports = isEmpty;

  var _isNone = babelHelpers.interopRequireDefault(_is_none);

  function isEmpty(obj) {
    return (0, _isNone['default'])(obj) || obj.length === 0 && typeof obj !== 'function' || typeof obj === 'object' && obj.size === 0;
  }
});


define('coalesce/utils/is_equal', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = isEqual;

  function isEqual(a, b) {
    if (a && 'function' === typeof a.isEqual) return a.isEqual(b);
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    return a === b;
  }
});


define("coalesce/utils/is_none", ["exports", "module"], function (exports, module) {
  "use strict";

  module.exports = isNone;

  function isNone(obj) {
    return obj === null || obj === undefined;
  }
});


define('coalesce/utils/lazy_copy', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = lazyCopy;
  function _lazyCopy(obj, deep, seen, copies) {
    var ret, loc, key;

    // primitive data types are immutable, just return them.
    if ('object' !== typeof obj || obj === null) return obj;
    if (obj.lazyCopy && typeof obj.lazyCopy === 'function') return obj.lazyCopy(deep);
    if (obj.copy && typeof obj.copy === 'function') return obj.copy(deep);

    // avoid cyclical loops
    if (deep && (loc = seen.indexOf(obj)) >= 0) return copies[loc];

    if (obj instanceof Array) {
      ret = obj.slice();
      if (deep) {
        loc = ret.length;
        while (--loc >= 0) ret[loc] = _lazyCopy(ret[loc], deep, seen, copies);
      }
    } else if (obj instanceof Date) {
      ret = new Date(obj.getTime());
    } else {
      ret = {};
      for (key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        // Prevents browsers that don't respect non-enumerability from
        // copying internal Ember properties
        if (key.substring(0, 2) === '__') continue;

        ret[key] = deep ? _lazyCopy(obj[key], deep, seen, copies) : obj[key];
      }
    }

    if (deep) {
      seen.push(obj);
      copies.push(ret);
    }

    return ret;
  }

  /**
    Similar to `copy` but checks for a `lazyCopy` method first.
  
    @method lazyCopy
    @param {Object} obj The object to clone
    @param {Boolean} deep If true, a deep copy of the object is made
    @return {Object} The cloned object
  */

  function lazyCopy(obj, deep) {
    return _lazyCopy(obj, deep, deep ? [] : null, deep ? [] : null);
  }
});


define('coalesce/utils/materialize_relationships', ['exports', 'module', '../collections/model_set'], function (exports, module, _collectionsModel_set) {
  'use strict';

  module.exports = materializeRelationships;

  var _ModelSet = babelHelpers.interopRequireDefault(_collectionsModel_set);

  /**
    Given a collection of models, make sure all lazy
    models/relations are replaced with their materialized counterparts
    if they exist within the collection.
  */

  function materializeRelationships(models, idManager) {

    if (!(models instanceof _ModelSet['default'])) {
      models = new _ModelSet['default'](models);
    }

    models.forEach(function (model) {

      if (model._parent) {
        model._parent = models.getModel(model._parent);
      }

      // TODO: does this overwrite non-lazy embedded children?
      model.eachLoadedRelationship(function (name, relationship) {
        if (relationship.kind === 'belongsTo') {
          var child = model[name];
          if (child) {
            if (idManager) idManager.reifyClientId(child);
            child = models.getModel(child) || child;
            model[name] = child;
          }
        } else if (relationship.kind === 'hasMany') {
          // TODO: merge could be per item
          var children = model[name];
          var lazyChildren = new _ModelSet['default']();
          lazyChildren.addObjects(children);
          children.clear();
          lazyChildren.forEach(function (child) {
            if (idManager) idManager.reifyClientId(child);
            child = models.getModel(child) || child;
            children.addObject(child);
          });
        }
      }, this);
    }, this);
  }
});


define('coalesce/utils/parse_date', ['exports', 'module'], function (exports, module) {
    /**
     * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
     * © 2011 Colin Snover <http://zetafleet.com>
     * Released under MIT license.
     */
    'use strict';

    module.exports = parseDate;
    var origParse = Date.parse,
        numericKeys = [1, 4, 5, 6, 7, 10, 11];

    function parseDate(date) {
        var timestamp,
            struct,
            minutesOffset = 0;

        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster
        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
        if (struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date)) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; k = numericKeys[i]; ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
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

    ;
});

//# sourceMappingURL=coalesce.amd.map