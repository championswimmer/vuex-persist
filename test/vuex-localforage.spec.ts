/**
 * Created by championswimmer on 20/07/17.
 */
import { Store } from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence from '../dist'
import { assert, expect, should } from 'chai'
import localForage = require('localforage')
import MockForageDriver from '../src/MockForageDriver'

Vue.use(Vuex)

localForage.defineDriver(new MockForageDriver())
localForage.setDriver('mockforage')

const vuexPersist = new VuexPersistence<any, any>({
  storage: localForage,
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
// const getSavedStore = async function (): Promise<any> {
//   try {
//     let store = await localForage.getItem<string>('vuex')
//     return JSON.parse(store)
//   } catch (err) {
//     throw err
//   }
// }
const getSavedStore = () =>
  Promise.resolve(localForage.getItem<string>('vuex')
    .then(savedStore => JSON.parse(savedStore))
    .catch(err => {throw err}))

describe('Storage: LocalForage, Test: reducer, filter', () => {
  it('should persist reduced state', () => {
    store.commit('dogBark')
    getSavedStore().then(savedStore => {
      expect(savedStore.dog.barks).to.equal(1)
    }).catch(err => {throw err})
  })
  it('should not persist non reduced state', () => {
    store.commit('catMew')
    getSavedStore().then(savedStore => {
      expect(savedStore.cat).to.be.undefined
    }).catch(err => {throw err})
  })
})
