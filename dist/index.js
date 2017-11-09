"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by championswimmer on 18/07/17.
 */
var lodash_merge_1 = require("lodash.merge");
var MockStorage_1 = require("./MockStorage");
exports.MockStorage = MockStorage_1.default;
var SimplePromiseQueue_1 = require("./SimplePromiseQueue");
/**
 * A class that implements the vuex persistence.
 */
var VuexPersistence = (function () {
    /**
     * Create a {@link VuexPersistence} object.
     * Use the <code>plugin</code> function of this class as a
     * Vuex plugin.
     * @param {PersistOptions} options
     */
    function VuexPersistence(options) {
        var _this = this;
        // tslint:disable-next-line:variable-name
        this._mutex = new SimplePromiseQueue_1.default();
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
        this.storage = ((options.storage != null)
            ? options.storage
            : (new MockStorage_1.default()));
        this.restoreState = ((options.restoreState != null)
            ? options.restoreState
            : (function (key, storage) {
                return Promise.resolve((storage || _this.storage).getItem(key))
                    .then(function (value) {
                    return typeof value === 'string' // If string, parse, or else, just return
                        ? JSON.parse(value || '{}')
                        : (value || {});
                });
            }));
        this.saveState = ((options.saveState != null)
            ? options.saveState
            : (function (key, state, storage) {
                return Promise.resolve((storage || _this.storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                (((storage && storage._config && storage._config.name) === 'localforage')
                    ? lodash_merge_1.default({}, state)
                    : JSON.stringify(state))));
            }));
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
                        return lodash_merge_1.default(a, (_a = {}, _a[i] = state[i], _a));
                        var _a;
                    }, {});
                })));
        this.filter = ((options.filter != null)
            ? options.filter
            : (function (mutation) { return true; }));
        this.strictMode = options.strictMode || false;
        this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
            state = lodash_merge_1.default(state, savedState);
        };
        this.plugin = function (store) {
            Promise.resolve(_this.restoreState(_this.key, _this.storage)).then(function (savedState) {
                /**
                 * If in strict mode, do only via mutation
                 */
                if (_this.strictMode) {
                    store.commit('RESTORE_MUTATION', savedState);
                }
                else {
                    store.replaceState(lodash_merge_1.default(store.state, savedState));
                }
                _this.subscriber(store)(function (mutation, state) {
                    if (_this.filter(mutation)) {
                        _this._mutex.enqueue(Promise.resolve(_this.saveState(_this.key, _this.reducer(state), _this.storage)));
                    }
                });
                _this.subscribed = true;
            });
        };
    }
    return VuexPersistence;
}());
exports.VuexPersistence = VuexPersistence;
exports.default = VuexPersistence;
//# sourceMappingURL=index.js.map