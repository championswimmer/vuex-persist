/**
 * Created by championswimmer on 18/07/17.
 */
import { Payload, Plugin } from 'vuex';
import MockStorage from './MockStorage';
/**
 * Options to be used to construct a {@link VuexPersistence} object
 */
export interface PersistOptions<S> {
    /**
     * Window.Storage type object. Default is localStorage
     */
    storage?: Storage;
    /**
     * Method to retrieve state from persistence
     * @param key
     * @param [storage]
     */
    restoreState?: (key: string, storage?: Storage) => S;
    /**
     * Method to save state into persistence
     * @param key
     * @param state
     * @param [storage]
     */
    saveState?: (key: string, state: {}, storage?: Storage) => void;
    /**
     * Function to reduce state to the object you want to save.
     * Be default, we save the entire state.
     * You can use this if you want to save only a portion of it.
     * @param state
     */
    reducer?: (state: S) => {};
    /**
     * Key to use to save the state into the storage
     */
    key?: string;
    /**
     * Method to filter which mutations will trigger state saving
     * Be default returns true for all mutations.
     * Check mutations using <code>mutation.type</code>
     * @param mutation object of type {@link Payload}
     */
    filter?: (mutation: Payload) => boolean;
    /**
     * Names of modules that you want to persist.
     * If you create your custom {@link PersistOptions.reducer} function,
     * then that will override filter behaviour, not this argument
     */
    modules?: string[];
}
/**
 * A class that implements the vuex persistence.
 */
export declare class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
    storage: Storage;
    restoreState: (key: string, storage?: Storage) => S;
    saveState: (key: string, state: {}, storage?: Storage) => void;
    reducer: (state: S) => {};
    key: string;
    filter: (mutation: Payload) => boolean;
    modules: string[];
    /**
     * The plugin function that can be used inside a vuex store.
     */
    plugin: Plugin<S>;
    /**
     * Create a {@link VuexPersistence} object.
     * Use the <code>plugin</code> function of this class as a
     * Vuex plugin.
     * @param {PersistOptions} options
     */
    constructor(options: PersistOptions<S>);
    /**
     * Creates a subscriber on the store. automatically is used
     * when this is used a vuex plugin. Not for manual usage.
     * @param store
     */
    private subscriber;
}
export { MockStorage };
export default VuexPersistence;
