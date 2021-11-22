/**
 * Created by championswimmer on 23/07/17.
 */

import { assert, expect, should } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence from '..'

Vue.use(Vuex)
const vuexPersist = new VuexPersistence()
vuexPersist.filter = async (mutation) => (mutation.type === 'dogBark')
console.log((vuexPersist.storage as Storage).getItem('vuex') as string)
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

describe('Storage: Default Storage, Test: reducer, async-filter; Strict Mode: OFF', () => {
  it('should persist reduced state', async () => {
    store.commit('dogBark')
    await ptimeout() // wait for store.commit
    expect(getSavedStore().dog.barks).to.equal(1)
    store.commit('catMew')
    //noinspection TsLint
    expect(getSavedStore().cat.mews).to.equal(0)
  })
})

function ptimeout(ms = 10) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}
