/**
 * Created by championswimmer on 22/07/17.
 */
/**
 * Created by championswimmer on 20/07/17.
 */
import {assert, expect, should} from 'chai'
import Vue from 'vue'
import {Store} from 'vuex'
import Vuex from 'vuex'
import VuexPersistence from '../dist'
import MockStorage from '../dist/MockStorage'

Vue.use(Vuex)
const objStorage: any = {}
const vuexPersist = new VuexPersistence<any, any>({
  key: 'dafuq',
  restoreState: (key) => objStorage[key],
  saveState: (key, state) => { objStorage[key] = state },
  reducer: (state) => ({dog: state.dog}),
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
const getSavedStore = () => objStorage['dafuq']

describe('Storage: Custom(Object); Test: reducer, filter; Strict Mode: OFF', () => {
  it('should persist reduced state', () => {
    store.commit('dogBark')
    expect(getSavedStore().dog.barks).to.equal(1)
  })
  it('should not persist non reduced state', () => {
    store.commit('catMew')
    //noinspection TsLint
    expect(getSavedStore().cat).to.be.undefined
  })
})
