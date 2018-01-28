/**
 * Created by richicoder on 31/10/17.
 */

import { Store } from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence from '../dist'
import { assert, expect, should } from 'chai'
import * as localForage from 'localforage'

const objectStore: { [key: string]: any } = { barn: {} }
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
  setItem<T>(key: string, data: T | any, mutation: string): Promise<T> {
    if (mutation !== 'cowMoo')
      return Promise.resolve<T>(objectStore[key] = data)
    else {
      return Promise.resolve<T>(objectStore['barn'].cow = data.cow)
    }
  }
}

Vue.use(Vuex)

localForage.defineDriver(MockForageStorage as any)
localForage.setDriver('objectStorage')

const vuexPersist = new VuexPersistence<any, any>({
  storage: localForage,
  key: 'dafuq',
  reducer: (state) => ({ dog: state.dog, cow: state.cow }),
  filter: (mutation) => (mutation.type !== 'catMew')
})

const store = new Store<any>({
  state: {
    dog: {
      barks: 0
    },
    cat: {
      mews: 0
    },
    cow: {
      moos: 0
    }
  },
  mutations: {
    dogBark(state) {
      state.dog.barks++
    },
    catMew(state) {
      state.cat.mews++
    },
    cowMoo(state) {
      state.cow.moos++
    }
  },
  plugins: [vuexPersist.plugin]
})

describe('Storage: AsyncStorage; Test: reducer, filter, mutation; Strict Mode: OFF', () => {
  before(() => waitUntil(() => vuexPersist.subscribed))
  it('should persist reduced state', async () => {
    await waitUntil(() => vuexPersist.subscribed)
    store.commit('dogBark')
    expect(objectStore["dafuq"]).to.exist
    expect(objectStore["dafuq"].dog.barks).to.equal(1)
  })
  it('should handle mutation in the storage', async () => {
    store.commit('cowMoo')
    expect(objectStore["barn"].cow.moos).to.equal(1)
    expect(objectStore["dafuq"].cow.moos).to.equal(0)
  })
  it('should not persist non reduced state', async () => {
    store.commit('catMew')
    expect(objectStore["dafuq"].cat).to.be.undefined
  })
})

function waitUntil(condition: () => boolean): Promise<void> {
  return new Promise(async resolve => {
    let tries = 0;
    while (!condition() && tries < 30) {
      await new Promise(_ => setTimeout(_, 10))
      tries++;
    }
    resolve()
  })
}
