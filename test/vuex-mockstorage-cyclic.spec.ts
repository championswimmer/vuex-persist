/**
 * Created by rossng on 02/04/2018.
 */
import { assert, expect, should } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence, { MockStorage } from '../dist'

Vue.use(Vuex)
const mockStorage = new MockStorage()
const vuexPersist = new VuexPersistence<any, any>({
  supportCircular: true,
  storage: mockStorage
})

const store = new Store<any>({
  state: {
    cyclicObject: null
  },
  mutations: {
    storeCyclicObject(state, payload) {
      state.cyclicObject = payload
    }
  },
  plugins: [vuexPersist.plugin]
})
const getSavedStore = () => JSON.parse(mockStorage.getItem('vuex'))

describe('Storage: MockStorage, Test: cyclic object', () => {
  it('should persist cyclic object', () => {
    const cyclicObject: any = { foo: 10 }
    cyclicObject.bar = cyclicObject
    store.commit('storeCyclicObject', cyclicObject)
    expect(getSavedStore().cyclicObject.foo).to.equal(10)
  })
})
