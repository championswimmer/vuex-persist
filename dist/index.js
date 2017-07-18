"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by championswimmer on 18/07/17.
 */
const lodash_1 = require("lodash");
const DomStorage = require("dom-storage");
/**
 * A class to define default options to be used
 * if respective options do not exist in the constructor
 * of {@link VuexPersistence}
 */
class DefaultOptions {
    constructor() {
        this.storage = (typeof window !== 'undefined') ? window.localStorage : new DomStorage(null, { strict: false });
        this.key = 'vuex';
        this.restoreState = (key) => {
            return JSON.parse((this.storage.getItem(key) || '{}'));
        };
        this.saveState = (key, state) => {
            this.storage.setItem(key, JSON.stringify(state));
        };
        this.reducer = (state) => state;
        this.filter = (mutation) => true;
    }
}
exports.DefaultOptions = DefaultOptions;
const defOpt = new DefaultOptions();
/**
 * A class that implements the vuex persistence.
 */
class VuexPersistence {
    /**
     * Create a {@link VuexPersistence} object.
     * Use the <code>plugin</code> function of this class as a
     * Vuex plugin.
     * @param {PersistOptions} options
     */
    constructor(options) {
        /**
         * Creates a subscriber on the store. automatically is used
         * when this is used a vuex plugin. Not for manual usage.
         * @param store
         */
        this.subscriber = (store) => (handler) => store.subscribe(handler);
        this.storage = ((options.storage != null) ? options.storage : defOpt.storage);
        this.restoreState = ((options.restoreState != null) ? options.restoreState : defOpt.restoreState);
        this.saveState = ((options.saveState != null) ? options.saveState : defOpt.saveState);
        this.reducer = ((options.reducer != null) ? options.reducer : defOpt.reducer);
        this.key = ((options.key != null) ? options.key : defOpt.key);
        this.filter = ((options.filter != null) ? options.filter : defOpt.filter);
        this.plugin = (store) => {
            const savedState = this.restoreState(this.key, this.storage);
            store.replaceState(lodash_1.merge({}, store.state, savedState));
            this.subscriber(store)((mutation, state) => {
                if (this.filter(mutation)) {
                    this.saveState(this.key, this.reducer(state), this.storage);
                }
            });
        };
    }
    get storage() {
        return this.mStorage;
    }
    set storage(str) {
        this.mStorage = str;
    }
}
exports.VuexPersistence = VuexPersistence;
exports.default = VuexPersistence;
//# sourceMappingURL=index.js.map