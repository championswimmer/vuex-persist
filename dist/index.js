'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var merge = _interopDefault(require('lodash.merge'));

/**
 * Created by championswimmer on 22/07/17.
 */
var MockStorage = (function () {
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
    MockStorage.prototype.setItem = function (key, data) {
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
        /**
         * Creates a subscriber on the store. automatically is used
         * when this is used a vuex plugin. Not for manual usage.
         * @param store
         */
        this.subscriber = function (store) {
            return function (handler) { return store.subscribe(handler); };
        };
        this.key = ((options.key != null) ? options.key : 'vuex');
        this.storage = ((options.storage != null)
            ? options.storage
            : (new MockStorage()));
        this.restoreState = ((options.restoreState != null)
            ? options.restoreState
            : (function (key, storage) {
                return JSON.parse((storage || _this.storage).getItem(key) || '{}');
            }));
        this.saveState = ((options.saveState != null)
            ? options.saveState
            : (function (key, state, storage) {
                return (storage || _this.storage).setItem(key, JSON.stringify(state));
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
                        return merge(a, (_a = {}, _a[i] = state[i], _a));
                        var _a;
                    }, {});
                })));
        this.filter = ((options.filter != null)
            ? options.filter
            : (function (mutation) { return true; }));
        this.strictMode = options.strictMode || false;
        this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
            state = merge(state, savedState);
        };
        this.plugin = function (store) {
            var savedState = _this.restoreState(_this.key, _this.storage);
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
                    _this.saveState(_this.key, _this.reducer(state), _this.storage);
                }
            });
        };
    }
    return VuexPersistence;
}());

exports.VuexPersistence = VuexPersistence;
exports.MockStorage = MockStorage;
exports['default'] = VuexPersistence;
//# sourceMappingURL=index.js.map
