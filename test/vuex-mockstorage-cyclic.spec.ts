/**
 * Created by rossng on 02/04/2018.
 */
import { Store } from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence, { MockStorage } from '../dist'
import { assert, expect, should } from 'chai'

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
    let cyclicObject: any = { foo: 10 }
    cyclicObject.bar = cyclicObject
    store.commit('storeCyclicObject', cyclicObject)
    expect(getSavedStore().cyclicObject.foo).to.equal(10)
  })
})
