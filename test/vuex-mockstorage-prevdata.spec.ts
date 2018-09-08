/**
 * Created by championswimmer on 20/07/17.
 */
import { assert, expect, should } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence, { MockStorage } from '../'

Vue.use(Vuex)
const mockStorage = new MockStorage()
mockStorage.setItem('vuex', JSON.stringify({
  dog: {
    barks: 2
  }
}))
const vuexPersist = new VuexPersistence<any, any>({
  storage: mockStorage,
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
const getSavedStore = () => JSON.parse(mockStorage.getItem('vuex'))

describe('Storage: MockStorage, Test: reducer, filter, Existing Data: TRUE', () => {
  it('should persist reduced state', () => {
    store.commit('dogBark')
    expect(getSavedStore().dog.barks).to.equal(3)
  })
  it('should not persist non reduced state', () => {
    store.commit('catMew')
    //noinspection TsLint
    expect(getSavedStore().cat).to.be.undefined
  })
})
