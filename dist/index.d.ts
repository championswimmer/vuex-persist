import { Mutation, Payload, Plugin } from 'vuex';
import MockStorage from './MockStorage';
import { AsyncStorage } from './AsyncStorage';
import { PersistOptions } from './PersistOptions';
/**
 * A class that implements the vuex persistence.
 */
export declare class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
    asyncStorage: boolean;
    storage: Storage | AsyncStorage;
    restoreState: (key: string, storage?: AsyncStorage | Storage) => Promise<S> | S;
    saveState: (key: string, state: {}, storage?: AsyncStorage | Storage) => Promise<void> | void;
    reducer: (state: S) => {};
    key: string;
    filter: (mutation: Payload) => boolean;
    modules: string[];
    strictMode: boolean;
    /**
     * The plugin function that can be used inside a vuex store.
     */
    plugin: Plugin<S>;
    /**
     * A mutation that can be used to restore state
     * Helpful if we are running in strict mode
     */
    RESTORE_MUTATION: Mutation<S>;
    subscribed: boolean;
    private _mutex;
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
export { MockStorage, AsyncStorage, PersistOptions };
export default VuexPersistence;
