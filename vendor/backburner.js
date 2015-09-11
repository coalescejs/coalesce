/*!
 * @overview Backburner - A rewrite of the Ember.js run loop as a generic microlibrary

 * @copyright Copyright (c) 2014 Erik Bryn and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/ebryn/backburner.js/master/LICENSE
 * @version   0.2.2+pre.d31679ec03
 */

(function() {
    "use strict";
    var backburner$utils$$NUMBER = /\d+/;

    function backburner$utils$$each(collection, callback) {
      for (var i = 0; i < collection.length; i++) {
        callback(collection[i]);
      }
    }

    var backburner$utils$$now = Date.now || function() { return new Date().getTime(); };

    function backburner$utils$$isString(suspect) {
      return typeof suspect === 'string';
    }

    function backburner$utils$$isFunction(suspect) {
      return typeof suspect === 'function';
    }

    function backburner$utils$$isNumber(suspect) {
      return typeof suspect === 'number';
    }

    function backburner$utils$$isCoercableNumber(number) {
      return backburner$utils$$isNumber(number) || backburner$utils$$NUMBER.test(number);
    }

    function backburner$utils$$wrapInTryCatch(func) {
      return function () {
        try {
          return func.apply(this, arguments);
        } catch (e) {
          throw e;
        }
      };
    }


    var backburner$platform$$needsIETryCatchFix = (function(e,x){
      try{ x(); }
      catch(e) { } // jshint ignore:line
      return !!e;
    })();
    function backburner$binary$search$$binarySearch(time, timers) {
      var start = 0;
      var end = timers.length - 2;
      var middle, l;

      while (start < end) {
        // since timers is an array of pairs 'l' will always
        // be an integer
        l = (end - start) / 2;

        // compensate for the index in case even number
        // of pairs inside timers
        middle = start + l - (l % 2);

        if (time >= timers[middle]) {
          start = middle + 2;
        } else {
          end = middle;
        }
      }

      return (time >= timers[start]) ? start + 2 : start;
    }
    var backburner$binary$search$$default = backburner$binary$search$$binarySearch;

    function $$queue$$Queue(name, options, globalOptions) {
      this.name = name;
      this.globalOptions = globalOptions || {};
      this.options = options;
      this._queue = [];
      this.targetQueues = Object.create(null);
      this._queueBeingFlushed = undefined;
    }

    $$queue$$Queue.prototype = {
      push: function(target, method, args, stack) {
        var queue = this._queue;
        queue.push(target, method, args, stack);

        return {
          queue: this,
          target: target,
          method: method
        };
      },

      pushUniqueWithoutGuid: function(target, method, args, stack) {
        var queue = this._queue;

        for (var i = 0, l = queue.length; i < l; i += 4) {
          var currentTarget = queue[i];
          var currentMethod = queue[i+1];

          if (currentTarget === target && currentMethod === method) {
            queue[i+2] = args;  // replace args
            queue[i+3] = stack; // replace stack
            return;
          }
        }

        queue.push(target, method, args, stack);
      },

      targetQueue: function(targetQueue, target, method, args, stack) {
        var queue = this._queue;

        for (var i = 0, l = targetQueue.length; i < l; i += 2) {
          var currentMethod = targetQueue[i];
          var currentIndex  = targetQueue[i + 1];

          if (currentMethod === method) {
            queue[currentIndex + 2] = args;  // replace args
            queue[currentIndex + 3] = stack; // replace stack
            return;
          }
        }

        targetQueue.push(
          method,
          queue.push(target, method, args, stack) - 4
        );
      },

      pushUniqueWithGuid: function(guid, target, method, args, stack) {
        var hasLocalQueue = this.targetQueues[guid];

        if (hasLocalQueue) {
          this.targetQueue(hasLocalQueue, target, method, args, stack);
        } else {
          this.targetQueues[guid] = [
            method,
            this._queue.push(target, method, args, stack) - 4
          ];
        }

        return {
          queue: this,
          target: target,
          method: method
        };
      },

      pushUnique: function(target, method, args, stack) {
        var queue = this._queue, currentTarget, currentMethod, i, l;
        var KEY = this.globalOptions.GUID_KEY;

        if (target && KEY) {
          var guid = target[KEY];
          if (guid) {
            return this.pushUniqueWithGuid(guid, target, method, args, stack);
          }
        }

        this.pushUniqueWithoutGuid(target, method, args, stack);

        return {
          queue: this,
          target: target,
          method: method
        };
      },

      invoke: function(target, method, args, _, _errorRecordedForStack) {
        if (args && args.length > 0) {
          method.apply(target, args);
        } else {
          method.call(target);
        }
      },

      invokeWithOnError: function(target, method, args, onError, errorRecordedForStack) {
        try {
          if (args && args.length > 0) {
            method.apply(target, args);
          } else {
            method.call(target);
          }
        } catch(error) {
          onError(error, errorRecordedForStack);
        }
      },

      flush: function(sync) {
        var queue = this._queue;
        var length = queue.length;

        if (length === 0) {
          return;
        }

        var globalOptions = this.globalOptions;
        var options = this.options;
        var before = options && options.before;
        var after = options && options.after;
        var onError = globalOptions.onError || (globalOptions.onErrorTarget &&
                                                globalOptions.onErrorTarget[globalOptions.onErrorMethod]);
        var target, method, args, errorRecordedForStack;
        var invoke = onError ? this.invokeWithOnError : this.invoke;

        this.targetQueues = Object.create(null);
        var queueItems = this._queueBeingFlushed = this._queue.slice();
        this._queue = [];

        if (before) {
          before();
        }

        for (var i = 0; i < length; i += 4) {
          target                = queueItems[i];
          method                = queueItems[i+1];
          args                  = queueItems[i+2];
          errorRecordedForStack = queueItems[i+3]; // Debugging assistance

          if (backburner$utils$$isString(method)) {
            method = target[method];
          }

          // method could have been nullified / canceled during flush
          if (method) {
            //
            //    ** Attention intrepid developer **
            //
            //    To find out the stack of this task when it was scheduled onto
            //    the run loop, add the following to your app.js:
            //
            //    Ember.run.backburner.DEBUG = true; // NOTE: This slows your app, don't leave it on in production.
            //
            //    Once that is in place, when you are at a breakpoint and navigate
            //    here in the stack explorer, you can look at `errorRecordedForStack.stack`,
            //    which will be the captured stack when this job was scheduled.
            //
            invoke(target, method, args, onError, errorRecordedForStack);
          }
        }

        if (after) {
          after();
        }

        this._queueBeingFlushed = undefined;

        if (sync !== false &&
            this._queue.length > 0) {
          // check if new items have been added
          this.flush(true);
        }
      },

      cancel: function(actionToCancel) {
        var queue = this._queue, currentTarget, currentMethod, i, l;
        var target = actionToCancel.target;
        var method = actionToCancel.method;
        var GUID_KEY = this.globalOptions.GUID_KEY;

        if (GUID_KEY && this.targetQueues && target) {
          var targetQueue = this.targetQueues[target[GUID_KEY]];

          if (targetQueue) {
            for (i = 0, l = targetQueue.length; i < l; i++) {
              if (targetQueue[i] === method) {
                targetQueue.splice(i, 1);
              }
            }
          }
        }

        for (i = 0, l = queue.length; i < l; i += 4) {
          currentTarget = queue[i];
          currentMethod = queue[i+1];

          if (currentTarget === target &&
              currentMethod === method) {
            queue.splice(i, 4);
            return true;
          }
        }

        // if not found in current queue
        // could be in the queue that is being flushed
        queue = this._queueBeingFlushed;

        if (!queue) {
          return;
        }

        for (i = 0, l = queue.length; i < l; i += 4) {
          currentTarget = queue[i];
          currentMethod = queue[i+1];

          if (currentTarget === target &&
              currentMethod === method) {
            // don't mess with array during flush
            // just nullify the method
            queue[i+1] = null;
            return true;
          }
        }
      }
    };

    var $$queue$$default = $$queue$$Queue;

    function backburner$deferred$action$queues$$DeferredActionQueues(queueNames, options) {
      var queues = this.queues = Object.create(null);
      this.queueNames = queueNames = queueNames || [];

      this.options = options;

      backburner$utils$$each(queueNames, function(queueName) {
        queues[queueName] = new $$queue$$default(queueName, options[queueName], options);
      });
    }

    function backburner$deferred$action$queues$$noSuchQueue(name) {
      throw new Error("You attempted to schedule an action in a queue (" + name + ") that doesn't exist");
    }

    backburner$deferred$action$queues$$DeferredActionQueues.prototype = {
      schedule: function(name, target, method, args, onceFlag, stack) {
        var queues = this.queues;
        var queue = queues[name];

        if (!queue) {
          backburner$deferred$action$queues$$noSuchQueue(name);
        }

        if (onceFlag) {
          return queue.pushUnique(target, method, args, stack);
        } else {
          return queue.push(target, method, args, stack);
        }
      },

      flush: function() {
        var queues = this.queues;
        var queueNames = this.queueNames;
        var queueName, queue, queueItems, priorQueueNameIndex;
        var queueNameIndex = 0;
        var numberOfQueues = queueNames.length;
        var options = this.options;

        while (queueNameIndex < numberOfQueues) {
          queueName = queueNames[queueNameIndex];
          queue = queues[queueName];

          var numberOfQueueItems = queue._queue.length;

          if (numberOfQueueItems === 0) {
            queueNameIndex++;
          } else {
            queue.flush(false /* async */);
            queueNameIndex = 0;
          }
        }
      }
    };

    var backburner$deferred$action$queues$$default = backburner$deferred$action$queues$$DeferredActionQueues;

    var $$backburner$$pop = [].pop;
    var $$backburner$$global = this;

    function $$backburner$$Backburner(queueNames, options) {
      this.queueNames = queueNames;
      this.options = options || {};
      if (!this.options.defaultQueue) {
        this.options.defaultQueue = queueNames[0];
      }
      this.instanceStack = [];
      this._debouncees = [];
      this._throttlers = [];
      this._timers = [];
    }

    $$backburner$$Backburner.prototype = {
      begin: function() {
        var options = this.options;
        var onBegin = options && options.onBegin;
        var previousInstance = this.currentInstance;

        if (previousInstance) {
          this.instanceStack.push(previousInstance);
        }

        this.currentInstance = new backburner$deferred$action$queues$$default(this.queueNames, options);
        if (onBegin) {
          onBegin(this.currentInstance, previousInstance);
        }
      },

      end: function() {
        var options = this.options;
        var onEnd = options && options.onEnd;
        var currentInstance = this.currentInstance;
        var nextInstance = null;

        // Prevent double-finally bug in Safari 6.0.2 and iOS 6
        // This bug appears to be resolved in Safari 6.0.5 and iOS 7
        var finallyAlreadyCalled = false;
        try {
          currentInstance.flush();
        } finally {
          if (!finallyAlreadyCalled) {
            finallyAlreadyCalled = true;

            this.currentInstance = null;

            if (this.instanceStack.length) {
              nextInstance = this.instanceStack.pop();
              this.currentInstance = nextInstance;
            }

            if (onEnd) {
              onEnd(currentInstance, nextInstance);
            }
          }
        }
      },

      run: function(/* target, method, args */) {
        var length = arguments.length;
        var method, target, args;

        if (length === 1) {
          method = arguments[0];
          target = null;
        } else {
          target = arguments[0];
          method = arguments[1];
        }

        if (backburner$utils$$isString(method)) {
          method = target[method];
        }

        if (length > 2) {
          args = new Array(length - 2);
          for (var i = 0, l = length - 2; i < l; i++) {
            args[i] = arguments[i + 2];
          }
        } else {
          args = [];
        }

        var onError = $$backburner$$getOnError(this.options);

        this.begin();

        // guard against Safari 6's double-finally bug
        var didFinally = false;

        if (onError) {
          try {
            return method.apply(target, args);
          } catch(error) {
            onError(error);
          } finally {
            if (!didFinally) {
              didFinally = true;
              this.end();
            }
          }
        } else {
          try {
            return method.apply(target, args);
          } finally {
            if (!didFinally) {
              didFinally = true;
              this.end();
            }
          }
        }
      },

      join: function(/* target, method, args */) {
        if (this.currentInstance) {
          var length = arguments.length;
          var method, target;

          if (length === 1) {
            method = arguments[0];
            target = null;
          } else {
            target = arguments[0];
            method = arguments[1];
          }

          if (backburner$utils$$isString(method)) {
            method = target[method];
          }

          if (length === 1) {
            return method();
          } else if (length === 2) {
            return method.call(target);
          } else {
            var args = new Array(length - 2);
            for (var i = 0, l = length - 2; i < l; i++) {
              args[i] = arguments[i + 2];
            }
            return method.apply(target, args);
          }
        } else {
          return this.run.apply(this, arguments);
        }
      },

      defer: function(queueName /* , target, method, args */) {
        var length = arguments.length;
        var method, target, args;

        if (length === 2) {
          method = arguments[1];
          target = null;
        } else {
          target = arguments[1];
          method = arguments[2];
        }

        if (backburner$utils$$isString(method)) {
          method = target[method];
        }

        var stack = this.DEBUG ? new Error() : undefined;

        if (length > 3) {
          args = new Array(length - 3);
          for (var i = 3; i < length; i++) {
            args[i-3] = arguments[i];
          }
        } else {
          args = undefined;
        }

        if (!this.currentInstance) { $$backburner$$createAutorun(this); }
        return this.currentInstance.schedule(queueName, target, method, args, false, stack);
      },

      deferOnce: function(queueName /* , target, method, args */) {
        var length = arguments.length;
        var method, target, args;

        if (length === 2) {
          method = arguments[1];
          target = null;
        } else {
          target = arguments[1];
          method = arguments[2];
        }

        if (backburner$utils$$isString(method)) {
          method = target[method];
        }

        var stack = this.DEBUG ? new Error() : undefined;

        if (length > 3) {
          args = new Array(length - 3);
          for (var i = 3; i < length; i++) {
            args[i-3] = arguments[i];
          }
        } else {
          args = undefined;
        }

        if (!this.currentInstance) {
          $$backburner$$createAutorun(this);
        }
        return this.currentInstance.schedule(queueName, target, method, args, true, stack);
      },

      setTimeout: function() {
        var l = arguments.length;
        var args = new Array(l);

        for (var x = 0; x < l; x++) {
          args[x] = arguments[x];
        }

        var length = args.length,
            method, wait, target,
            methodOrTarget, methodOrWait, methodOrArgs;

        if (length === 0) {
          return;
        } else if (length === 1) {
          method = args.shift();
          wait = 0;
        } else if (length === 2) {
          methodOrTarget = args[0];
          methodOrWait = args[1];

          if (backburner$utils$$isFunction(methodOrWait) || backburner$utils$$isFunction(methodOrTarget[methodOrWait])) {
            target = args.shift();
            method = args.shift();
            wait = 0;
          } else if (backburner$utils$$isCoercableNumber(methodOrWait)) {
            method = args.shift();
            wait = args.shift();
          } else {
            method = args.shift();
            wait =  0;
          }
        } else {
          var last = args[args.length - 1];

          if (backburner$utils$$isCoercableNumber(last)) {
            wait = args.pop();
          } else {
            wait = 0;
          }

          methodOrTarget = args[0];
          methodOrArgs = args[1];

          if (backburner$utils$$isFunction(methodOrArgs) || (backburner$utils$$isString(methodOrArgs) &&
                                          methodOrTarget !== null &&
                                          methodOrArgs in methodOrTarget)) {
            target = args.shift();
            method = args.shift();
          } else {
            method = args.shift();
          }
        }

        var executeAt = backburner$utils$$now() + parseInt(wait, 10);

        if (backburner$utils$$isString(method)) {
          method = target[method];
        }

        var onError = $$backburner$$getOnError(this.options);

        function fn() {
          if (onError) {
            try {
              method.apply(target, args);
            } catch (e) {
              onError(e);
            }
          } else {
            method.apply(target, args);
          }
        }

        // find position to insert
        var i = backburner$binary$search$$default(executeAt, this._timers);

        this._timers.splice(i, 0, executeAt, fn);

        $$backburner$$updateLaterTimer(this, executeAt, wait);

        return fn;
      },

      throttle: function(target, method /* , args, wait, [immediate] */) {
        var backburner = this;
        var args = arguments;
        var immediate = $$backburner$$pop.call(args);
        var wait, throttler, index, timer;

        if (backburner$utils$$isNumber(immediate) || backburner$utils$$isString(immediate)) {
          wait = immediate;
          immediate = true;
        } else {
          wait = $$backburner$$pop.call(args);
        }

        wait = parseInt(wait, 10);

        index = $$backburner$$findThrottler(target, method, this._throttlers);
        if (index > -1) { return this._throttlers[index]; } // throttled

        timer = $$backburner$$global.setTimeout(function() {
          if (!immediate) {
            backburner.run.apply(backburner, args);
          }
          var index = $$backburner$$findThrottler(target, method, backburner._throttlers);
          if (index > -1) {
            backburner._throttlers.splice(index, 1);
          }
        }, wait);

        if (immediate) {
          this.run.apply(this, args);
        }

        throttler = [target, method, timer];

        this._throttlers.push(throttler);

        return throttler;
      },

      debounce: function(target, method /* , args, wait, [immediate] */) {
        var backburner = this;
        var args = arguments;
        var immediate = $$backburner$$pop.call(args);
        var wait, index, debouncee, timer;

        if (backburner$utils$$isNumber(immediate) || backburner$utils$$isString(immediate)) {
          wait = immediate;
          immediate = false;
        } else {
          wait = $$backburner$$pop.call(args);
        }

        wait = parseInt(wait, 10);
        // Remove debouncee
        index = $$backburner$$findDebouncee(target, method, this._debouncees);

        if (index > -1) {
          debouncee = this._debouncees[index];
          this._debouncees.splice(index, 1);
          clearTimeout(debouncee[2]);
        }

        timer = $$backburner$$global.setTimeout(function() {
          if (!immediate) {
            backburner.run.apply(backburner, args);
          }
          var index = $$backburner$$findDebouncee(target, method, backburner._debouncees);
          if (index > -1) {
            backburner._debouncees.splice(index, 1);
          }
        }, wait);

        if (immediate && index === -1) {
          backburner.run.apply(backburner, args);
        }

        debouncee = [
          target,
          method,
          timer
        ];

        backburner._debouncees.push(debouncee);

        return debouncee;
      },

      cancelTimers: function() {
        var clearItems = function(item) {
          clearTimeout(item[2]);
        };

        backburner$utils$$each(this._throttlers, clearItems);
        this._throttlers = [];

        backburner$utils$$each(this._debouncees, clearItems);
        this._debouncees = [];

        if (this._laterTimer) {
          clearTimeout(this._laterTimer);
          this._laterTimer = null;
        }
        this._timers = [];

        if (this._autorun) {
          clearTimeout(this._autorun);
          this._autorun = null;
        }
      },

      hasTimers: function() {
        return !!this._timers.length || !!this._debouncees.length || !!this._throttlers.length || this._autorun;
      },

      cancel: function(timer) {
        var timerType = typeof timer;

        if (timer && timerType === 'object' && timer.queue && timer.method) { // we're cancelling a deferOnce
          return timer.queue.cancel(timer);
        } else if (timerType === 'function') { // we're cancelling a setTimeout
          for (var i = 0, l = this._timers.length; i < l; i += 2) {
            if (this._timers[i + 1] === timer) {
              this._timers.splice(i, 2); // remove the two elements
              if (i === 0) {
                if (this._laterTimer) { // Active timer? Then clear timer and reset for future timer
                  clearTimeout(this._laterTimer);
                  this._laterTimer = null;
                }
                if (this._timers.length > 0) { // Update to next available timer when available
                  $$backburner$$updateLaterTimer(this, this._timers[0], this._timers[0] - backburner$utils$$now());
                }
              }
              return true;
            }
          }
        } else if (Object.prototype.toString.call(timer) === "[object Array]"){ // we're cancelling a throttle or debounce
          return this._cancelItem($$backburner$$findThrottler, this._throttlers, timer) ||
                   this._cancelItem($$backburner$$findDebouncee, this._debouncees, timer);
        } else {
          return; // timer was null or not a timer
        }
      },

      _cancelItem: function(findMethod, array, timer){
        var item, index;

        if (timer.length < 3) { return false; }

        index = findMethod(timer[0], timer[1], array);

        if (index > -1) {

          item = array[index];

          if (item[2] === timer[2]) {
            array.splice(index, 1);
            clearTimeout(timer[2]);
            return true;
          }
        }

        return false;
      }
    };

    $$backburner$$Backburner.prototype.schedule = $$backburner$$Backburner.prototype.defer;
    $$backburner$$Backburner.prototype.scheduleOnce = $$backburner$$Backburner.prototype.deferOnce;
    $$backburner$$Backburner.prototype.later = $$backburner$$Backburner.prototype.setTimeout;

    if (backburner$platform$$needsIETryCatchFix) {
      var $$backburner$$originalRun = $$backburner$$Backburner.prototype.run;
      $$backburner$$Backburner.prototype.run = backburner$utils$$wrapInTryCatch($$backburner$$originalRun);

      var $$backburner$$originalEnd = $$backburner$$Backburner.prototype.end;
      $$backburner$$Backburner.prototype.end = backburner$utils$$wrapInTryCatch($$backburner$$originalEnd);
    }

    function $$backburner$$getOnError(options) {
      return options.onError || (options.onErrorTarget && options.onErrorTarget[options.onErrorMethod]);
    }

    function $$backburner$$createAutorun(backburner) {
      backburner.begin();
      backburner._autorun = $$backburner$$global.setTimeout(function() {
        backburner._autorun = null;
        backburner.end();
      });
    }

    function $$backburner$$updateLaterTimer(backburner, executeAt, wait) {
      var n = backburner$utils$$now();
      if (!backburner._laterTimer || executeAt < backburner._laterTimerExpiresAt || backburner._laterTimerExpiresAt < n) {

        if (backburner._laterTimer) {
          // Clear when:
          // - Already expired
          // - New timer is earlier
          clearTimeout(backburner._laterTimer);

          if (backburner._laterTimerExpiresAt < n) { // If timer was never triggered
            // Calculate the left-over wait-time
            wait = Math.max(0, executeAt - n);
          }
        }

        backburner._laterTimer = $$backburner$$global.setTimeout(function() {
          backburner._laterTimer = null;
          backburner._laterTimerExpiresAt = null;
          $$backburner$$executeTimers(backburner);
        }, wait);

        backburner._laterTimerExpiresAt = n + wait;
      }
    }

    function $$backburner$$executeTimers(backburner) {
      var n = backburner$utils$$now();
      var fns, i, l;

      backburner.run(function() {
        i = backburner$binary$search$$default(n, backburner._timers);

        fns = backburner._timers.splice(0, i);

        for (i = 1, l = fns.length; i < l; i += 2) {
          backburner.schedule(backburner.options.defaultQueue, null, fns[i]);
        }
      });

      if (backburner._timers.length) {
        $$backburner$$updateLaterTimer(backburner, backburner._timers[0], backburner._timers[0] - n);
      }
    }

    function $$backburner$$findDebouncee(target, method, debouncees) {
      return $$backburner$$findItem(target, method, debouncees);
    }

    function $$backburner$$findThrottler(target, method, throttlers) {
      return $$backburner$$findItem(target, method, throttlers);
    }

    function $$backburner$$findItem(target, method, collection) {
      var item;
      var index = -1;

      for (var i = 0, l = collection.length; i < l; i++) {
        item = collection[i];
        if (item[0] === target && item[1] === method) {
          index = i;
          break;
        }
      }

      return index;
    }

    var $$backburner$$default = $$backburner$$Backburner;

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define.amd) {
      define(function() { return $$backburner$$default; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = $$backburner$$default;
    } else if (typeof this !== 'undefined') {
      this['Backburner'] = $$backburner$$default;
    }
}).call(this);
