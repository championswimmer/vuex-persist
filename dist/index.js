"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DomStorage = require("dom-storage");
/**
 * A class to define default options to be used
 * if respective options do not exist in the constructor
 * of {@link VuexPersistence}
 */
var DefaultOptions = (function () {
    function DefaultOptions() {
        var _this = this;
        this.storage = (typeof window !== 'undefined') ? window.localStorage : new DomStorage(null, { strict: false });
        this.key = 'vuex';
        this.restoreState = function (key) {
            return JSON.parse((_this.storage.getItem(key) || '{}'));
        };
        this.saveState = function (key, state) {
            _this.storage.setItem(key, JSON.stringify(state));
        };
        this.reducer = function (state) { return state; };
        this.filter = function (mutation) { return true; };
    }
    return DefaultOptions;
}());
exports.DefaultOptions = DefaultOptions;
var defOpt = new DefaultOptions();
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
        this.storage = ((options.storage != null) ? options.storage : defOpt.storage);
        this.restoreState = ((options.restoreState != null) ? options.restoreState : defOpt.restoreState);
        this.saveState = ((options.saveState != null) ? options.saveState : defOpt.saveState);
        this.reducer = ((options.reducer != null) ? options.reducer : defOpt.reducer);
        this.key = ((options.key != null) ? options.key : defOpt.key);
        this.filter = ((options.filter != null) ? options.filter : defOpt.filter);
        this.plugin = function (store) {
            var savedState = _this.restoreState(_this.key, _this.storage);
            store.replaceState(Object.assign({}, store.state, savedState));
            _this.subscriber(store)(function (mutation, state) {
                if (_this.filter(mutation)) {
                    _this.saveState(_this.key, _this.reducer(state), _this.storage);
                }
            });
        };
    }
    Object.defineProperty(VuexPersistence.prototype, "storage", {
        get: function () {
            return this.mStorage;
        },
        set: function (str) {
            this.mStorage = str;
        },
        enumerable: true,
        configurable: true
    });
    return VuexPersistence;
}());
exports.VuexPersistence = VuexPersistence;
exports.default = VuexPersistence;
//# sourceMappingURL=index.js.map