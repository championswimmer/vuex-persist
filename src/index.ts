/**
 * Created by championswimmer on 18/07/17.
 */
import { merge } from 'lodash'
import {Payload, Plugin, Store} from 'vuex'

/**
 * Options to be used to construct a {@link VuexPersistence} object
 */
export interface PersistOptions<S> {
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
   * Window.Storage type object. Default is localStorage
   */
  storage?: Storage

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
}

/**
 * A class to define default options to be used
 * if respective options do not exist in the constructor
 * of {@link VuexPersistence}
 */
export class DefaultOptions<S> implements PersistOptions<S> {
  public storage = window.localStorage
  public key =  'vuex'
  public restoreState = (key: string) => {
    return JSON.parse(
      (this.storage.getItem(key) || '{}') as string,
    )
  }
  public saveState = (key: string, state: {}) => {
    this.storage.setItem(key, JSON.stringify(state))
  }
  public reducer = (state: S) => state
  public filter = (mutation: Payload) => true
}

const defOpt = new DefaultOptions()

/**
 * A class that implements the vuex persistence.
 */
export class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
  public restoreState: (key: string, storage?: Storage) => S
  public saveState: (key: string, state: {}, storage?: Storage) => void
  public storage: Storage
  public reducer: (state: S) => {}
  public key: string
  public filter: (mutation: Payload) => boolean

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
  constructor(options: PersistOptions<S>) {
    this.restoreState = ((options.restoreState != null) ? options.restoreState : defOpt.restoreState)
    this.saveState = ((options.saveState != null) ? options.saveState : defOpt.restoreState)
    this.reducer = ((options.reducer != null) ? options.reducer : defOpt.reducer)
    this.key = ((options.key != null) ? options.key : defOpt.key)
    this.filter = ((options.filter != null) ? options.filter : defOpt.filter)
    this.storage = ((options.storage != null) ? options.storage : defOpt.storage)

    this.plugin = (store: Store<S>) => {
      const savedState = this.restoreState(this.key, this.storage)
      store.replaceState(merge({}, store.state, savedState))

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

export default VuexPersistence
