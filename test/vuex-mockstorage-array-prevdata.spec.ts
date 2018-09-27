/**
 * Created by championswimmer on 20/07/17.
 */
import { assert, expect, should } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence, { MockStorage } from '..'

Vue.use(Vuex)
const mockStorage = new MockStorage()
mockStorage.setItem('vuex', JSON.stringify({
  dog: {
    colors: ['black']
  }
}))
const vuexPersist = new VuexPersistence<any, any>({
  storage: mockStorage,
  reducer: (state) => ({ dog: state.dog }),
  filter: (mutation) => (mutation.type === 'addDogColor')
})

const store = new Store<any>({
  state: {
    dog: {
      colors: ['black', 'brown']
    },
    cat: {
      colors: ['white', 'yellow']
    }
  },
  mutations: {
    addDogColor(state) {
      state.dog.colors.push('grey')
    },
    addCatColor(state) {
      state.cat.colors.push('beige')
    }
  },
  plugins: [vuexPersist.plugin]
})
const getSavedStore = () => JSON.parse(mockStorage.getItem('vuex'))

describe('Storage: MockStorage, Test: reducer, filter, Existing Data: TRUE', () => {
  it('should persist reduced state', () => {
    store.commit('addDogColor')
    expect(getSavedStore().dog.colors.length).to.equal(3)
  })
  it('should not persist non reduced state', () => {
    store.commit('addCatColor')
    //noinspection TsLint
    expect(getSavedStore().cat).to.be.undefined
  })
})
