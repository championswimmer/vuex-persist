/**
 * Created by victorpugin on 11/05/18.
 */

import { Store } from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence from '../dist'
import { assert, expect, should } from 'chai'

Vue.use(Vuex)
const vuexPersist = new VuexPersistence({
  sharedMutations: ['dogBark']
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
const getSavedItem = (key) => JSON.parse((vuexPersist.storage as Storage).getItem(key) as string)
const setSavedItem = (key, value) => (vuexPersist.storage as Storage).setItem(key, JSON.stringify(value) as any)

describe('Storage: Default Storage, Test: shared mutations; Strict Mode: OFF', () => {
  it('should persist shared mutations', () => {
    store.commit('dogBark')
    expect(getSavedItem('vuex-shared-mutation').type).to.equal('dogBark')

    store.commit('catMew')
    expect(getSavedItem('vuex-shared-mutation').type).to.equal('dogBark')
  })
  it('should replicate shared mutations', () => {
    setSavedItem('vuex-shared-mutation', { type: 'dogBark' })
    expect(getSavedItem('vuex').dog.barks).to.equal(1)

    store.commit('dogBark')
    expect(getSavedItem('vuex').dog.barks).to.equal(2)
  })
})
