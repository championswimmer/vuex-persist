/**
 * Created by championswimmer on 20/07/17.
 */
import { Store } from 'vuex'
import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersistence, { MockStorage } from '../dist'
import { assert, expect, should } from 'chai'

Vue.use(Vuex)
const mockStorage = new MockStorage()
mockStorage.setItem('vuex', JSON.stringify({
  dog: {
    barks: 2
  }
}))
const vuexPersist = new VuexPersistence<any, any>({
  strictMode: true,
  storage: mockStorage,
  reducer: (state) => ({ dog: state.dog }),
  filter: (mutation) => (mutation.type === 'dogBark')
})

const store = new Store<any>({
  strict: true,
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
    },
    RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION
  },
  plugins: [vuexPersist.plugin]
})
const getSavedStore = () => JSON.parse(mockStorage.getItem('vuex'))

describe('Storage: MockStorage; Test: reducer, filter; Existing Data: TRUE; Strict: TRUE', () => {
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
