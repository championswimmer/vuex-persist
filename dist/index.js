"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MockStorage_1 = require("./MockStorage");
var deepAssign = require("deep-assign");
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
            : (new MockStorage_1.default()));
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
        this.reducer = ((options.reducer != null)
            ? options.reducer
            : ((options.modules == null)
                ? (function (state) { return state; })
                : (function (state) {
                    return options.modules.reduce(function (a, i) {
                        return Object.assign(a, (_a = {}, _a[i] = state[i], _a));
                        var _a;
                    }, {});
                })));
        this.filter = ((options.filter != null)
            ? options.filter
            : (function (mutation) { return true; }));
        this.plugin = function (store) {
            var savedState = _this.restoreState(_this.key, _this.storage);
            store.replaceState(deepAssign(store.state, savedState));
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
exports.default = VuexPersistence;
//# sourceMappingURL=index.js.map