/**
 * Created by championswimmer on 23/07/17.
 */

import { assert, expect, should } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence from '../'

Vue.use(Vuex)
const vuexPersist = new VuexPersistence({})

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
const getSavedStore = () => JSON.parse((vuexPersist.storage as Storage).getItem('vuex') as string)

describe('Storage: Default Storage, Test: reducer, filter; Strict Mode: OFF', () => {
  it('should persist reduced state', () => {
    store.commit('dogBark')
    expect(getSavedStore().dog.barks).to.equal(1)
    store.commit('catMew')
    //noinspection TsLint
    expect(getSavedStore().cat.mews).to.equal(1)
  })
})
