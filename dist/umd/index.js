(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash.merge')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lodash.merge'], factory) :
  (factory((global.VuexPersistence = {}),global._.merge));
}(this, (function (exports,lodashMerge) { 'use strict';

  lodashMerge = lodashMerge && lodashMerge.hasOwnProperty('default') ? lodashMerge['default'] : lodashMerge;

  /**
   * Created by championswimmer on 22/07/17.
   */

  // tslint:disable: variable-name
  var SimplePromiseQueue = /** @class */ (function () {
      function SimplePromiseQueue() {
          this._queue = [];
          this._flushing = false;
      }
      SimplePromiseQueue.prototype.enqueue = function (promise) {
          this._queue.push(promise);
          if (!this._flushing) {
              return this.flushQueue();
          }
          return Promise.resolve();
      };
      SimplePromiseQueue.prototype.flushQueue = function () {
          var _this = this;
          this._flushing = true;
          var chain = function () {
              var nextTask = _this._queue.shift();
              if (nextTask) {
                  return nextTask.then(chain);
              }
              else {
                  _this._flushing = false;
              }
          };
          return Promise.resolve(chain());
      };
      return SimplePromiseQueue;
  }());

  function merge(into, from) {
      return lodashMerge({}, into, from);
  }

  var CircularJSON = JSON;
  /**
   * A class that implements the vuex persistence.
   * @type S type of the 'state' inside the store (default: any)
   */
  var VuexPersistence = /** @class */ (function () {
      /**
       * Create a {@link VuexPersistence} object.
       * Use the <code>plugin</code> function of this class as a
       * Vuex plugin.
       * @param {PersistOptions} options
       */
      function VuexPersistence(options) {
          var _this = this;
          // tslint:disable-next-line:variable-name
          this._mutex = new SimplePromiseQueue();
          /**
           * Creates a subscriber on the store. automatically is used
           * when this is used a vuex plugin. Not for manual usage.
           * @param store
           */
          this.subscriber = function (store) {
              return function (handler) { return store.subscribe(handler); };
          };
          if (typeof options === 'undefined')
              options = {};
          this.key = ((options.key != null) ? options.key : 'vuex');
          this.subscribed = false;
          this.supportCircular = options.supportCircular || false;
          if (this.supportCircular) {
              CircularJSON = require('circular-json');
          }
          // @ts-ignore
          {
              // @ts-ignore
              {
                  // If UMD module, then we will only be having localStorage
                  this.storage = options.storage || window.localStorage;
              }
          }
          /**
           * How this works is -
           *  1. If there is options.reducer function, we use that, if not;
           *  2. We check options.modules;
           *    1. If there is no options.modules array, we use entire state in reducer
           *    2. Otherwise, we create a reducer that merges all those state modules that are
           *        defined in the options.modules[] array
           * @type {((state: S) => {}) | ((state: S) => S) | ((state: any) => {})}
           */
          this.reducer = ((options.reducer != null)
              ? options.reducer
              : ((options.modules == null)
                  ? (function (state) { return state; })
                  : (function (state) {
                      return options.modules.reduce(function (a, i) {
                          var _a;
                          return merge(a, (_a = {}, _a[i] = state[i], _a));
                      }, { /* start empty accumulator*/});
                  })));
          this.filter = options.filter || (function (mutation) { return true; });
          this.strictMode = options.strictMode || false;
          this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
              var mergedState = merge(state, savedState || {});
              for (var _i = 0, _a = Object.keys(mergedState); _i < _a.length; _i++) {
                  var propertyName = _a[_i];
                  this._vm.$set(state, propertyName, mergedState[propertyName]);
              }
          };
          this.asyncStorage = options.asyncStorage || false;
          var storageConfig = this.storage && (this.storage)._config;
          this.asyncStorage = this.asyncStorage || (storageConfig && storageConfig.name) === 'localforage';
          if (this.asyncStorage) {
              /**
               * Async {@link #VuexPersistence.restoreState} implementation
               * @type {((key: string, storage?: Storage) =>
               *      (Promise<S> | S)) | ((key: string, storage: AsyncStorage) => Promise<any>)}
               */
              this.restoreState = ((options.restoreState != null)
                  ? options.restoreState
                  : (function (key, storage) {
                      return (storage).getItem(key)
                          .then(function (value) {
                          return typeof value === 'string' // If string, parse, or else, just return
                              ? (_this.supportCircular
                                  ? CircularJSON.parse(value || '{}')
                                  : JSON.parse(value || '{}'))
                              : (value || {});
                      });
                  }));
              /**
               * Async {@link #VuexPersistence.saveState} implementation
               * @type {((key: string, state: {}, storage?: Storage) =>
               *    (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
               */
              this.saveState = ((options.saveState != null)
                  ? options.saveState
                  : (function (key, state, storage) {
                      return (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                      (((storage && storage._config && storage._config.name) === 'localforage')
                          ? merge({}, state || {})
                          : (_this.supportCircular
                              ? CircularJSON.stringify(state)
                              : JSON.stringify(state))));
                  }));
              /**
               * Async version of plugin
               * @param {Store<S>} store
               */
              this.plugin = function (store) {
                  (_this.restoreState(_this.key, _this.storage)).then(function (savedState) {
                      /**
                       * If in strict mode, do only via mutation
                       */
                      if (_this.strictMode) {
                          store.commit('RESTORE_MUTATION', savedState);
                      }
                      else {
                          store.replaceState(merge(store.state, savedState || {}));
                      }
                      /**
                       * Notify the app that the state has been restored, and
                       * set the flag that can be used to prevent state restores
                       * from happening on other pages. (Note: this is oen of
                       * those rare cases when semicolon is necessary since ASI
                       * won't insert one between two lines that end and begin
                       * with parentheses.)
                       * @since 2.1.0
                       */
                      store._vm.$root.$emit('vuexPersistStateRestored');
                      store._vm.$root.$data['vuexPersistStateRestored'] = true;
                      _this.subscriber(store)(function (mutation, state) {
                          if (_this.filter(mutation)) {
                              _this._mutex.enqueue(_this.saveState(_this.key, _this.reducer(state), _this.storage));
                          }
                      });
                      _this.subscribed = true;
                  });
              };
          }
          else {
              /**
               * Sync {@link #VuexPersistence.restoreState} implementation
               * @type {((key: string, storage?: Storage) =>
               *    (Promise<S> | S)) | ((key: string, storage: Storage) => (any | string | {}))}
               */
              this.restoreState = ((options.restoreState != null)
                  ? options.restoreState
                  : (function (key, storage) {
                      var value = (storage).getItem(key);
                      if (typeof value === 'string') { // If string, parse, or else, just return
                          return (_this.supportCircular
                              ? CircularJSON.parse(value || '{}')
                              : JSON.parse(value || '{}'));
                      }
                      else {
                          return (value || {});
                      }
                  }));
              /**
               * Sync {@link #VuexPersistence.saveState} implementation
               * @type {((key: string, state: {}, storage?: Storage) =>
               *     (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
               */
              this.saveState = ((options.saveState != null)
                  ? options.saveState
                  : (function (key, state, storage) {
                      return (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                      (_this.supportCircular
                          ? CircularJSON.stringify(state)
                          : JSON.stringify(state)));
                  }));
              /**
               * Sync version of plugin
               * @param {Store<S>} store
               */
              this.plugin = function (store) {
                  var savedState = _this.restoreState(_this.key, _this.storage);
                  if (_this.strictMode) {
                      store.commit('RESTORE_MUTATION', savedState);
                  }
                  else {
                      store.replaceState(merge(store.state, savedState || {}));
                  }
                  _this.subscriber(store)(function (mutation, state) {
                      if (_this.filter(mutation)) {
                          _this.saveState(_this.key, _this.reducer(state), _this.storage);
                      }
                  });
                  _this.subscribed = true;
              };
          }
      }
      return VuexPersistence;
  }());

  exports.VuexPersistence = VuexPersistence;
  exports.default = VuexPersistence;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
