/**
 * Created by championswimmer on 18/07/17.
 */
import {Mutation, Payload, Plugin, Store} from 'vuex'
import MockStorage from './MockStorage'
import merge from 'lodash.merge'
/**
 * Options to be used to construct a {@link VuexPersistence} object
 */
export interface PersistOptions<S> {
  /**
   * Window.Storage type object. Default is localStorage
   */
  storage?: Storage | any

  /**
   * Method to retrieve state from persistence
   * @param key
   * @param [storage]
   */
  restoreState?: (key: string, storage?: Storage) => (S | Promise<S>)

  /**
   * Method to save state into persistence
   * @param key
   * @param state
   * @param [storage]
   */
  saveState?: (key: string, state: {}, storage?: Storage) => (void | Promise<void>)

  /**
   * Function to reduce state to the object you want to save.
   * Be default, we save the entire state.
   * You can use this if you want to save only a portion of it.
   * @param state
   */
  reducer?: (state: S) => {}

  /**
   * Key to use to save the state into the storage
   */
  key?: string

  /**
   * Method to filter which mutations will trigger state saving
   * Be default returns true for all mutations.
   * Check mutations using <code>mutation.type</code>
   * @param mutation object of type {@link Payload}
   */
  filter?: (mutation: Payload) => boolean

  /**
   * Names of modules that you want to persist.
   * If you create your custom {@link PersistOptions.reducer} function,
   * then that will override filter behaviour, not this argument
   */
  modules?: string[]

  /**
   * Set this to true to support
   * <a href="https://vuex.vuejs.org/en/strict.html">Vuex Strict Mode</a>
   */
  strictMode?: boolean
}

/**
 * A class that implements the vuex persistence.
 */
export class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
  public storage: Storage | any
  public restoreState: (key: string, storage?: Storage) => (S | Promise<S>)
  public saveState: (key: string, state: {}, storage?: Storage) => (void | Promise<void>)
  public reducer: (state: S) => {}
  public key: string
  public filter: (mutation: Payload) => boolean
  public modules: string[]
  public strictMode: boolean

  /**
   * The plugin function that can be used inside a vuex store.
   */
  public plugin: Plugin<S>
  /**
   * A mutation that can be used to restore state
   * Helpful if we are running in strict mode
   */
  public RESTORE_MUTATION: Mutation<S>
  /**
   * Create a {@link VuexPersistence} object.
   * Use the <code>plugin</code> function of this class as a
   * Vuex plugin.
   * @param {PersistOptions} options
   */
  public constructor(options: PersistOptions<S>) {
    this.key = ((options.key != null) ? options.key : 'vuex')
    this.storage = (
      (options.storage != null)
        ? options.storage
        : (new MockStorage())
    )
    this.restoreState = (
      (options.restoreState != null)
        ? options.restoreState
        : (async (key: string, storage?: Storage) =>
          {
            try {
              return JSON.parse(await (storage || this.storage).getItem(key) || '{}')
            } catch (err) {
              throw err
            }
          }
        )
    )
    this.saveState = (
      (options.saveState != null)
        ? options.saveState
        : (async (key: string, state: {}, storage?: Storage) =>
          {
            try {
              return await (storage || this.storage).setItem(key, JSON.stringify(state))
            } catch (err) {
              throw err
            }
          }
        )
    )
    /**
     * How this works is -
     *  1. If there is options.reducer function, we use that, if not;
     *  2. We check options.modules;
     *    1. If there is no options.modules array, we use entire state in reducer
     *    2. Otherwise, we create a reducer that merges all those state modules that are
     *        defined in the options.modules[] array
     * @type {((state: S) => {}) | ((state: S) => S) | ((state: any) => {})}
     */
    this.reducer = (
      (options.reducer != null)
        ? options.reducer
        : (
          (options.modules == null)
            ? ((state: S) => state)
            : (
              (state: any) =>
                (<string[]> options.modules).reduce((a, i) =>
                  merge(a, { [i]: state[i] }), {})
            )
        )
    )
    this.filter = (
      (options.filter != null)
        ? options.filter
        : ((mutation) => true)
    )


    this.strictMode = options.strictMode || false

    this.RESTORE_MUTATION = function RESTORE_MUTATION (state: S, savedState: any) {
      state = merge(state, savedState)
    }

    this.plugin = async (store: Store<S>) => {
      let savedState = {}
      try {
        savedState =  this.restoreState(this.key, this.storage)
      } catch (err) {
        console.error(err)
      }
      /**
       * If in strict mode, do only via mutation
       */
      if (this.strictMode) {
        store.commit('RESTORE_MUTATION', savedState)
      } else {
        store.replaceState(merge(store.state, savedState))
      }

      this.subscriber(store)(async (mutation: P, state: S) => {
        if (this.filter(mutation)) {
          // TODO: Use a Promise queue here
          this.saveState(this.key, this.reducer(state), this.storage)
        }
      })
    }
  }

  /**
   * Creates a subscriber on the store. automatically is used
   * when this is used a vuex plugin. Not for manual usage.
   * @param store
   */
  private subscriber = (store: Store<S>) =>
    (handler: (mutation: P, state: S) => any) => store.subscribe(handler)

}

export {
  MockStorage
}

export default VuexPersistence
