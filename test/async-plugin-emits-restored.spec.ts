/**
 * Created by morphatic on 23/05/19.
 */

import { expect } from 'chai'
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
  key: 'emit_test',
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

describe('Storage: AsyncStorage; Test: emit/flag on restore; Strict Mode: OFF', () => {
  it('should emit `vuexPersistStateRestored` when async state is restored', (done) => {
    const store = new Vuex.Store<any>(storeOpts);
    (store as any)._vm.$root.$on('vuexPersistStateRestored', done)
  })

  it('should set the `vuexPersistStateRestored` flag when async state restored', (done) => {
    const store = new Vuex.Store<any>(storeOpts);
    (store as any)._vm.$root.$on('vuexPersistStateRestored', () => {
      /* tslint:disable:no-unused-expression */
      expect((store as any)._vm.$root.$data['vuexPersistStateRestored']).to.be.true
      /* tslint:enable:no-unused-expression */
      done()
    })
  })
})
