/**
 * Created by championswimmer on 23/07/17.
 */

import { assert, expect, should } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence from '../dist'

Vue.use(Vuex)
const vuexPersist = new VuexPersistence({
  modules: ['dog']
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
const getSavedStore = () => JSON.parse((vuexPersist.storage as any).getItem('vuex') as string)

describe('Storage: MockStorage, Test: modules', () => {
  it('should persist specified module', () => {
    store.commit('dogBark')
    expect(getSavedStore().dog.barks).to.equal(1)
  })
  it('should not persist unspecified module', () => {
    store.commit('catMew')
    expect(getSavedStore().cat).to.be.undefined
  })
})
