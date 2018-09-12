/**
 * Created by richicoder on 31/10/17.
 */

import { assert, expect, should } from 'chai'
import localForage from 'localforage'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence from '..'

const objectStore: { [key: string]: any } = {}
const MockForageStorage = {
  _driver: 'objectStorage',
  _support: true,
  _initStorage() { },
  clear() { },
  getItem<T>(key: string): Promise<T> {
    return Promise.resolve<T>(objectStore[key])
  },
  iterate() { },
  key() { },
  keys() { },
  length() { },
  removeItem() { },
  setItem<T>(key: string, data: T): Promise<T> {
    return Promise.resolve<T>((objectStore[key] = data))
  }
}

Vue.use(Vuex)

localForage.defineDriver(MockForageStorage as any)
localForage.setDriver('objectStorage')

const vuexPersist = new VuexPersistence<any, any>({
  storage: localForage,
  key: 'dafuq',
  reducer: (state) => ({ dog: state.dog }),
  filter: (mutation) => (mutation.type === 'dogBark')
})

const store = new Store<any>({
  state: {
    dog: {
      barks: 0
    },
    cat: {
      mews: 0
    }
  },
  mutations: {
    dogBark(state) {
      state.dog.barks++
    },
    catMew(state) {
      state.cat.mews++
    }
  },
  plugins: [vuexPersist.plugin]
})

describe('Storage: AsyncStorage; Test: reducer, filter; Strict Mode: OFF', () => {
  before(() => waitUntil(() => vuexPersist.subscribed))
  it('should persist reduced state', async () => {
    await waitUntil(() => vuexPersist.subscribed)
    store.commit('dogBark')
    expect(objectStore['dafuq']).to.exist
    expect(objectStore['dafuq'].dog.barks).to.equal(1)
  })
  it('should not persist non reduced state', async () => {
    store.commit('catMew')
    expect(objectStore['dafuq'].cat).to.be.undefined
  })
})

function waitUntil(condition: () => boolean): Promise<void> {
  return new Promise(async (resolve) => {
    let tries = 0
    while (!condition() && tries < 30) {
      await new Promise((_) => setTimeout(_, 10))
      tries++
    }
    resolve()
  })
}
