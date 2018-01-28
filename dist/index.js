'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var merge = _interopDefault(require('lodash.merge'));

/**
 * Created by championswimmer on 22/07/17.
 */
var MockStorage = /** @class */ (function () {
    function MockStorage() {
    }
    Object.defineProperty(MockStorage.prototype, "length", {
        get: function () {
            return Object.keys(this).length;
        },
        enumerable: true,
        configurable: true
    });
    MockStorage.prototype.key = function (index) {
        return Object.keys(this)[index];
    };
    MockStorage.prototype.setItem = function (key, data, mutation) {
        this[key] = data.toString();
    };
    MockStorage.prototype.getItem = function (key) {
        return this[key];
    };
    MockStorage.prototype.removeItem = function (key) {
        delete this[key];
    };
    MockStorage.prototype.clear = function () {
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var key = _a[_i];
            delete this[key];
        }
    };
    return MockStorage;
}());

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

/**
 * Created by championswimmer on 18/07/17.
 */
/**
 * A class that implements the vuex persistence.
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
        this.key = ((options.key != null) ? options.key : 'vuex');
        this.subscribed = false;
        this.storage =
            ((options.storage != null) ? options.storage : (new MockStorage()));
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
                        return merge(a, (_a = {}, _a[i] = state[i], _a));
                        var _a;
                    }, {});
                })));
        this.filter = ((options.filter != null)
            ? options.filter
            : (function (mutation) { return true; }));
        this.strictMode = options.strictMode || false;
        this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
            this._vm.$set(state, merge(state, savedState));
        };
        this.asyncStorage = options.asyncStorage || false;
        var storageConfig = (this.storage)._config;
        this.asyncStorage = (storageConfig && storageConfig.name) === 'localforage';
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
                            ? JSON.parse(value || '{}')
                            : (value || {});
                    });
                }));
            /**
             * Async {@link #VuexPersistence.saveState} implementation
             * @type {((key: string, state: {}, storage?: Storage, mutation?: string) =>
             *    (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage, mutation?: string) => Promise<void>)}
             */
            this.saveState = ((options.saveState != null)
                ? options.saveState
                : (function (key, state, storage, mutation) {
                    return (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                    (((storage && storage._config && storage._config.name) === 'localforage')
                        ? merge({}, state)
                        : JSON.stringify(state)), mutation);
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
                        store.replaceState(merge(store.state, savedState));
                    }
                    _this.subscriber(store)(function (mutation, state) {
                        if (_this.filter(mutation)) {
                            _this._mutex.enqueue(_this.saveState(_this.key, _this.reducer(state), _this.storage, mutation.type));
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
                    if (typeof value === 'string') {
                        return JSON.parse(value || '{}');
                    }
                    else {
                        return (value || {});
                    }
                }));
            /**
             * Sync {@link #VuexPersistence.saveState} implementation
             * @type {((key: string, state: {}, storage?: Storage, mutation?: string) =>
             *     (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage, mutation?: string) => Promise<void>)}
             */
            this.saveState = ((options.saveState != null)
                ? options.saveState
                : (function (key, state, storage, mutation) {
                    return (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                    JSON.stringify(state), mutation);
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
                    store.replaceState(merge(store.state, savedState));
                }
                _this.subscriber(store)(function (mutation, state) {
                    if (_this.filter(mutation)) {
                        _this.saveState(_this.key, _this.reducer(state), _this.storage, mutation.type);
                    }
                });
                _this.subscribed = true;
            };
        }
    }
    return VuexPersistence;
}());

exports.VuexPersistence = VuexPersistence;
exports.MockStorage = MockStorage;
exports.default = VuexPersistence;
//# sourceMappingURL=index.js.map
