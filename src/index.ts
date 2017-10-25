/**
 * Created by championswimmer on 18/07/17.
 */
import { Payload, Plugin, Store } from 'vuex'
import MockStorage from './MockStorage'
import merge from "lodash/merge";
/**
 * Options to be used to construct a {@link VuexPersistence} object
 */
export interface PersistOptions<S> {
  /**
   * Window.Storage type object. Default is localStorage
   */
  storage?: Storage

  /**
   * Method to retrieve state from persistence
   * @param key
   * @param [storage]
   */
  restoreState?: (key: string, storage?: Storage) => S

  /**
   * Method to save state into persistence
   * @param key
   * @param state
   * @param [storage]
   */
  saveState?: (key: string, state: {}, storage?: Storage) => void

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
}

/**
 * A class that implements the vuex persistence.
 */
export class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
  public storage: Storage
  public restoreState: (key: string, storage?: Storage) => S
  public saveState: (key: string, state: {}, storage?: Storage) => void
  public reducer: (state: S) => {}
  public key: string
  public filter: (mutation: Payload) => boolean
  public modules: string[]

  /**
   * The plugin function that can be used inside a vuex store.
   */
  public plugin: Plugin<S>
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
        : ((key: string, storage?: Storage) =>
          JSON.parse((storage || this.storage).getItem(key) || '{}')
        )
    )
    this.saveState = (
      (options.saveState != null)
        ? options.saveState
        : ((key: string, state: {}, storage?: Storage) =>
          (storage || this.storage).setItem(key, JSON.stringify(state)))
    )
    this.reducer = (
      (options.reducer != null)
        ? options.reducer
        : (
          (options.modules == null)
            ? ((state: S) => state)
            : (
              (state: any) =>
                (<string[]>options.modules).reduce((a, i) =>
                  Object.assign(a, { [i]: state[i] }), {})
            )
        )
    )
    this.filter = (
      (options.filter != null)
        ? options.filter
        : ((mutation) => true)
    )

    this.plugin = (store: Store<S>) => {
      const savedState = this.restoreState(this.key, this.storage)
      store.replaceState(merge(store.state, savedState))

      this.subscriber(store)((mutation: P, state: S) => {
        if (this.filter(mutation)) {
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

export default VuexPersistence;