/**
 * Created by championswimmer on 18/07/17.
 */
import {Payload, Plugin, Store} from 'vuex'
import { merge } from 'lodash'

export interface PersistOptions<S> {
  restoreState?: (key: string, storage?: Storage) => S
  saveState?: (key: string, state: {}, storage?: Storage) => void
  storage?: Storage
  reducer?: (state: S) => {}
  key?: string
  filter?: (mutation: Payload) => boolean
}

export class DefaultOptions<S> implements PersistOptions<S>{
  storage = window.localStorage
  key =  'vuex'
  restoreState = (key: string) => {
    return JSON.parse(
      <string>(this.storage.getItem(key) || "{}")
    )
  }
  saveState = (key: string, state: {}) => {
    this.storage.setItem(key, JSON.stringify(state))
  }
  reducer = (state: S) => state
  filter = (mutation: Payload) => true
}

const defOpt = new DefaultOptions();


export class VuexPersistence<S, P extends Payload> implements PersistOptions<S>{
  restoreState: (key: string, storage?: Storage) => S
  saveState: (key: string, state: {}, storage?: Storage) => void
  storage: Storage
  reducer: (state: S) => {}
  key: string
  filter: (mutation: Payload) => boolean
  subscriber = (store: Store<S>) =>
    (handler:(mutation: P, state: S) => any) => store.subscribe(handler)

  plugin: Plugin<S>

  constructor (options: PersistOptions<S>) {
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
          this.saveState(this.key, this.reducer(state), this.storage);
        }
      })
    }

  }
}
