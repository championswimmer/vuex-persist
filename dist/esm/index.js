import lodashMerge from 'lodash.merge';

/**
 * Created by championswimmer on 22/07/17.
 */
let MockStorage;
// @ts-ignore
{
    MockStorage = class {
        get length() {
            return Object.keys(this).length;
        }
        key(index) {
            return Object.keys(this)[index];
        }
        setItem(key, data) {
            this[key] = data.toString();
        }
        getItem(key) {
            return this[key];
        }
        removeItem(key) {
            delete this[key];
        }
        clear() {
            for (const key of Object.keys(this)) {
                delete this[key];
            }
        }
    };
}

// tslint:disable: variable-name
class SimplePromiseQueue {
    constructor() {
        this._queue = [];
        this._flushing = false;
    }
    enqueue(promise) {
        this._queue.push(promise);
        if (!this._flushing) {
            return this.flushQueue();
        }
        return Promise.resolve();
    }
    flushQueue() {
        this._flushing = true;
        const chain = () => {
            const nextTask = this._queue.shift();
            if (nextTask) {
                return nextTask.then(chain);
            }
            else {
                this._flushing = false;
            }
        };
        return Promise.resolve(chain());
    }
}

function merge(into, from) {
    return lodashMerge({}, into, from);
}

let CircularJSON = JSON;
/**
 * A class that implements the vuex persistence.
 * @type S type of the 'state' inside the store (default: any)
 */
class VuexPersistence {
    /**
     * Create a {@link VuexPersistence} object.
     * Use the <code>plugin</code> function of this class as a
     * Vuex plugin.
     * @param {PersistOptions} options
     */
    constructor(options) {
        // tslint:disable-next-line:variable-name
        this._mutex = new SimplePromiseQueue();
        /**
         * Creates a subscriber on the store. automatically is used
         * when this is used a vuex plugin. Not for manual usage.
         * @param store
         */
        this.subscriber = (store) => (handler) => store.subscribe(handler);
        if (typeof options === 'undefined')
            options = {};
        this.key = ((options.key != null) ? options.key : 'vuex');
        this.subscribed = false;
        this.supportCircular = options.supportCircular || false;
        if (this.supportCircular) {
            CircularJSON = require('circular-json');
        }
        // @ts-ignore
        if (process.env.NODE_ENV === 'production') {
            this.storage = options.storage || window.localStorage;
        }
        else {
            // @ts-ignore
            {
                this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : new MockStorage());
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
                ? ((state) => state)
                : ((state) => options.modules.reduce((a, i) => merge(a, { [i]: state[i] }), { /* start empty accumulator*/}))));
        this.filter = options.filter || ((mutation) => true);
        this.strictMode = options.strictMode || false;
        this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
            const mergedState = merge(state, savedState || {});
            for (const propertyName of Object.keys(mergedState)) {
                this._vm.$set(state, propertyName, mergedState[propertyName]);
            }
        };
        this.asyncStorage = options.asyncStorage || false;
        const storageConfig = this.storage && (this.storage)._config;
        this.asyncStorage = this.asyncStorage || (storageConfig && storageConfig.name) === 'localforage';
        if (this.asyncStorage) {
            /**
             * Async {@link #VuexPersistence.restoreState} implementation
             * @type {((key: string, storage?: Storage) =>
             *      (Promise<S> | S)) | ((key: string, storage: AsyncStorage) => Promise<any>)}
             */
            this.restoreState = ((options.restoreState != null)
                ? options.restoreState
                : ((key, storage) => (storage).getItem(key)
                    .then((value) => typeof value === 'string' // If string, parse, or else, just return
                    ? (this.supportCircular
                        ? CircularJSON.parse(value || '{}')
                        : JSON.parse(value || '{}'))
                    : (value || {}))));
            /**
             * Async {@link #VuexPersistence.saveState} implementation
             * @type {((key: string, state: {}, storage?: Storage) =>
             *    (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
             */
            this.saveState = ((options.saveState != null)
                ? options.saveState
                : ((key, state, storage) => (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                (((storage && storage._config && storage._config.name) === 'localforage')
                    ? merge({}, state || {})
                    : (this.supportCircular
                        ? CircularJSON.stringify(state)
                        : JSON.stringify(state))))));
            /**
             * Async version of plugin
             * @param {Store<S>} store
             */
            this.plugin = (store) => {
                (this.restoreState(this.key, this.storage)).then((savedState) => {
                    /**
                     * If in strict mode, do only via mutation
                     */
                    if (this.strictMode) {
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
                    this.subscriber(store)((mutation, state) => {
                        if (this.filter(mutation)) {
                            this._mutex.enqueue(this.saveState(this.key, this.reducer(state), this.storage));
                        }
                    });
                    this.subscribed = true;
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
                : ((key, storage) => {
                    const value = (storage).getItem(key);
                    if (typeof value === 'string') { // If string, parse, or else, just return
                        return (this.supportCircular
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
                : ((key, state, storage) => (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                (this.supportCircular
                    ? CircularJSON.stringify(state)
                    : JSON.stringify(state)))));
            /**
             * Sync version of plugin
             * @param {Store<S>} store
             */
            this.plugin = (store) => {
                const savedState = this.restoreState(this.key, this.storage);
                if (this.strictMode) {
                    store.commit('RESTORE_MUTATION', savedState);
                }
                else {
                    store.replaceState(merge(store.state, savedState || {}));
                }
                this.subscriber(store)((mutation, state) => {
                    if (this.filter(mutation)) {
                        this.saveState(this.key, this.reducer(state), this.storage);
                    }
                });
                this.subscribed = true;
            };
        }
    }
}

export default VuexPersistence;
export { VuexPersistence, MockStorage };
//# sourceMappingURL=index.js.map
