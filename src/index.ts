/**
 * Created by championswimmer on 18/07/17.
 */
import { Mutation, MutationPayload, Payload, Plugin, Store } from 'vuex'
import { AsyncStorage } from './AsyncStorage'
import { MockStorage } from './MockStorage'
import { PersistOptions } from './PersistOptions'
import SimplePromiseQueue from './SimplePromiseQueue'
import { merge, MergeOptionType } from './utils'

let FlattedJSON = JSON

/**
 * A class that implements the vuex persistence.
 * @type S type of the 'state' inside the store (default: any)
 */
export class VuexPersistence<S> implements PersistOptions<S> {
  public asyncStorage: boolean
  public storage: Storage | AsyncStorage | undefined
  public restoreState: (key: string, storage?: AsyncStorage | Storage) => Promise<S> | S
  public saveState: (key: string, state: {}, storage?: AsyncStorage | Storage) => Promise<void> | void
  public reducer: (state: S) => Partial<S>
  public key: string
  public filter: (mutation: Payload) => boolean
  public modules: string[]
  public strictMode: boolean
  public supportCircular: boolean
  public mergeOption: MergeOptionType

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
  public constructor(options?: PersistOptions<S>) {
    if (typeof options === 'undefined') options = {} as PersistOptions<S>
    this.key = ((options.key != null) ? options.key : 'vuex')

    this.subscribed = false
    this.supportCircular = options.supportCircular || false
    if (this.supportCircular) {
      FlattedJSON = require('flatted')
    }
    this.mergeOption = options.mergeOption || 'replaceArrays'

    let localStorageLitmus = true

    try {
      window.localStorage.getItem('')
    } catch (err) {
      localStorageLitmus = false
    }

    /**
     * 1. First, prefer storage sent in optinos
     * 2. Otherwise, use window.localStorage if available
     * 3. Finally, try to use MockStorage
     * 4. None of above? Well we gotta fail.
     */
    if (options.storage) { this.storage = options.storage }
    else if (localStorageLitmus) { this.storage = window.localStorage }
    else if (MockStorage) { this.storage = new MockStorage() }
    else { throw new Error("Neither 'window' is defined, nor 'MockStorage' is available") }

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
                (options!.modules as string[]).reduce((a, i) =>
                  merge(a, { [i]: state[i] }, this.mergeOption), {/* start empty accumulator*/ })
            )
        )
    )

    this.filter = options.filter || ((mutation) => true)

    this.strictMode = options.strictMode || false

    const _this = this
    this.RESTORE_MUTATION = function RESTORE_MUTATION(state: S, savedState: any) {
      const mergedState = merge(state, savedState || {}, _this.mergeOption)
      for (const propertyName of Object.keys(mergedState as {})) {
        (this as any)._vm.$set(state, propertyName, (mergedState as any)[propertyName])
      }
    }

    this.asyncStorage = options.asyncStorage || false

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
            (storage).getItem(key)
              .then((value) =>
                typeof value === 'string' // If string, parse, or else, just return
                  ? (
                    this.supportCircular
                      ? FlattedJSON.parse(value || '{}')
                      : JSON.parse(value || '{}')
                  )
                  : (value || {})
              )
          )
      )

      /**
       * Async {@link #VuexPersistence.saveState} implementation
       * @type {((key: string, state: {}, storage?: Storage) =>
       *    (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
       */
      this.saveState = (
        (options.saveState != null)
          ? options.saveState
          : ((key: string, state: {}, storage: AsyncStorage) =>
            (storage).setItem(
              key, // Second argument is state _object_ if asyc storage, stringified otherwise
              // do not stringify the state if the storage type is async
              (this.asyncStorage
                ? merge({}, state || {}, this.mergeOption)
                : (
                  this.supportCircular
                    ? FlattedJSON.stringify(state) as any
                    : JSON.stringify(state) as any
                )
              )
            )
          )
      )

      /**
       * Async version of plugin
       * @param {Store<S>} store
       */
      this.plugin = (store: Store<S>) => {
        /**
         * For async stores, we're capturing the Promise returned
         * by the `restoreState()` function in a `restored` property
         * on the store itself. This would allow app developers to
         * determine when and if the store's state has indeed been
         * refreshed. This approach was suggested by GitHub user @hotdogee.
         * See https://github.com/championswimmer/vuex-persist/pull/118#issuecomment-500914963
         * @since 2.1.0
         */
        (store as any).restored = ((this.restoreState(this.key, this.storage)) as Promise<S>).then((savedState) => {
          /**
           * If in strict mode, do only via mutation
           */
          if (this.strictMode) {
            store.commit('RESTORE_MUTATION', savedState)
          } else {
            store.replaceState(merge(store.state, savedState || {}, this.mergeOption) as S)
          }
          this.subscriber(store)((mutation: MutationPayload, state: S) => {
            if (this.filter(mutation)) {
              this._mutex.enqueue(
                this.saveState(this.key, this.reducer(state), this.storage) as Promise<void>
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
              return (
                this.supportCircular
                  ? FlattedJSON.parse(value || '{}')
                  : JSON.parse(value || '{}')
              )
            } else {
              return (value || {})
            }
          })
      )

      /**
       * Sync {@link #VuexPersistence.saveState} implementation
       * @type {((key: string, state: {}, storage?: Storage) =>
       *     (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
       */
      this.saveState = (
        (options.saveState != null)
          ? options.saveState
          : ((key: string, state: {}, storage: Storage) =>
            (storage).setItem(
              key, // Second argument is state _object_ if localforage, stringified otherwise
              (
                this.supportCircular
                  ? FlattedJSON.stringify(state) as any
                  : JSON.stringify(state) as any
              )
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
          store.replaceState(merge(store.state, savedState || {}, this.mergeOption) as S)
        }

        this.subscriber(store)((mutation: MutationPayload, state: S) => {
          if (this.filter(mutation)) {
            this.saveState(this.key, this.reducer(state), this.storage)
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
