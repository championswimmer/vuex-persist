/**
 * Created by morphatic on 23/05/19. Updated 12/06/19.
 */

import localForage from 'localforage'
import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from '..'

const objectStore: {[key: string]: any} = {}
/* tslint:disable:no-empty */
const MockForageStorage = {
  _driver: 'objectStorage',
  _support: true,
  _initStorage() {},
  clear() {},
  getItem<T>(key: string): Promise<T> {
    return Promise.resolve<T>(objectStore[key])
  },
  iterate() {},
  key() {},
  keys() {},
  length() {},
  removeItem() {},
  setItem<T>(key: string, data: T): Promise<T> {
    return Promise.resolve<T>((objectStore[key] = data))
  }
}
/* tslint:enable:no-empty */

Vue.use(Vuex)

localForage.defineDriver(MockForageStorage as any)
localForage.setDriver('objectStorage')

const vuexPersist = new VuexPersistence<any>({
  key: 'restored_test',
  asyncStorage: true,
  storage: localForage,
  reducer: (state) => ({ count: state.count })
})

const storeOpts = {
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  plugins: [vuexPersist.plugin]
}

describe('Storage: AsyncStorage; Test: set `restored` on store; Strict Mode: OFF', () => {
  it('connects the `store.restored` property to the Promise returned by `restoreState()`', (done) => {
    const store: any = new Vuex.Store<any>(storeOpts)
    store.restored.then(done)
  })
})
