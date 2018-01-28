/**
 * Created by championswimmer on 18/07/17.
 */
import merge from 'lodash.merge'
import {Mutation, MutationPayload, Payload, Plugin, Store} from 'vuex'
import {AsyncStorage} from './AsyncStorage'
import MockStorage from './MockStorage'
import {PersistOptions} from './PersistOptions'
import SimplePromiseQueue from './SimplePromiseQueue'

/**
 * A class that implements the vuex persistence.
 */
export class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
  public asyncStorage: boolean
  public storage: Storage | AsyncStorage
  public restoreState: (key: string, storage?: AsyncStorage | Storage) => Promise<S> | S
  public saveState: (key: string, state: {}, storage?: AsyncStorage | Storage, mutation?: string) => Promise<void> | void
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
  public subscribed: boolean

  // tslint:disable-next-line:variable-name
  private _mutex = new SimplePromiseQueue()

  /**
   * Create a {@link VuexPersistence} object.
   * Use the <code>plugin</code> function of this class as a
   * Vuex plugin.
   * @param {PersistOptions} options
   */
  public constructor(options: PersistOptions<S>) {
    this.key = ((options.key != null) ? options.key : 'vuex')

    this.subscribed = false

    this.storage =
      ((options.storage != null) ? options.storage : (new MockStorage()))

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
                (options.modules as string[]).reduce((a, i) =>
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

    this.RESTORE_MUTATION = function RESTORE_MUTATION(state: S, savedState: any) {
      (this as any)._vm.$set(state, merge(state, savedState))
    }

    this.asyncStorage = options.asyncStorage || false
    const storageConfig = ((this.storage) as any)._config
    this.asyncStorage = (storageConfig && storageConfig.name) === 'localforage'

    if (this.asyncStorage) {

      /**
       * Async {@link #VuexPersistence.restoreState} implementation
       * @type {((key: string, storage?: Storage) =>
       *      (Promise<S> | S)) | ((key: string, storage: AsyncStorage) => Promise<any>)}
       */
      this.restoreState = (
        (options.restoreState != null)
          ? options.restoreState
          : ((key: string, storage: AsyncStorage) =>
              (storage ).getItem(key)
                .then((value) =>
                  typeof value === 'string' // If string, parse, or else, just return
                    ? JSON.parse(value || '{}')
                    : (value || {})
                )
          )
      )

      /**
       * Async {@link #VuexPersistence.saveState} implementation
       * @type {((key: string, state: {}, storage?: Storage, mutation?: string) =>
       *    (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage, mutation?: string) => Promise<void>)}
       */
      this.saveState = (
        (options.saveState != null)
          ? options.saveState
          : ((key: string, state: {}, storage: AsyncStorage, mutation: string) =>
              (storage).setItem(
                key, // Second argument is state _object_ if localforage, stringified otherwise
                (((storage && storage._config && storage._config.name) === 'localforage')
                  ? merge({}, state)
                  : JSON.stringify(state) as any),
                mutation
              )
          )
      )

      /**
       * Async version of plugin
       * @param {Store<S>} store
       */
      this.plugin = (store: Store<S>) => {
        ((this.restoreState(this.key, this.storage)) as Promise<S>).then((savedState) => {
          /**
           * If in strict mode, do only via mutation
           */
          if (this.strictMode) {
            store.commit('RESTORE_MUTATION', savedState)
          } else {
            store.replaceState(merge(store.state, savedState))
          }

          this.subscriber(store)((mutation: MutationPayload, state: S) => {
            if (this.filter(mutation)) {
              this._mutex.enqueue(
                this.saveState(this.key, this.reducer(state), this.storage, mutation.type) as Promise<void>
              )
            }
          })
          this.subscribed = true
        })
      }
    } else {

      /**
       * Sync {@link #VuexPersistence.restoreState} implementation
       * @type {((key: string, storage?: Storage) =>
       *    (Promise<S> | S)) | ((key: string, storage: Storage) => (any | string | {}))}
       */
      this.restoreState = (
        (options.restoreState != null)
          ? options.restoreState
          : ((key: string, storage: Storage) => {
             const value = (storage).getItem(key)
             if (typeof value === 'string') {// If string, parse, or else, just return
                return JSON.parse(value || '{}')
             } else {
               return (value || {})
             }
          })
      )

      /**
       * Sync {@link #VuexPersistence.saveState} implementation
       * @type {((key: string, state: {}, storage?: Storage, mutation?: string) =>
       *     (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage, mutation?: string) => Promise<void>)}
       */
      this.saveState = (
        (options.saveState != null)
          ? options.saveState
          : ((key: string, state: {}, storage: Storage | any, mutation: string) =>
              (storage).setItem(
                key, // Second argument is state _object_ if localforage, stringified otherwise
                JSON.stringify(state) as any,
                mutation
              )
          )
      )

      /**
       * Sync version of plugin
       * @param {Store<S>} store
       */
      this.plugin = (store: Store<S>) => {
        const savedState = this.restoreState(this.key, this.storage) as S

        if (this.strictMode) {
          store.commit('RESTORE_MUTATION', savedState)
        } else {
          store.replaceState(merge(store.state, savedState))
        }

        this.subscriber(store)((mutation: MutationPayload, state: S) => {
          if (this.filter(mutation)) {
            this.saveState(this.key, this.reducer(state), this.storage, mutation.type)
          }
        })

        this.subscribed = true
      }
    }
  }

  /**
   * Creates a subscriber on the store. automatically is used
   * when this is used a vuex plugin. Not for manual usage.
   * @param store
   */
  private subscriber = (store: Store<S>) =>
    (handler: (mutation: MutationPayload, state: S) => any) => store.subscribe(handler)
}

export {
  MockStorage, AsyncStorage, PersistOptions
}

export default VuexPersistence
