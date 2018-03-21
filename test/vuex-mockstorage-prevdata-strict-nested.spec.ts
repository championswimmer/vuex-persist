/**
 * Created by championswimmer on 20/07/17.
 */
import {Store} from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence, {MockStorage} from '../dist'
import {assert, expect, should} from 'chai'

Vue.use(Vuex)
const mockStorage = new MockStorage()
mockStorage.setItem('vuex', JSON.stringify({
  mice: {
    jerry: {
      squeeks: 2
    }
  }
}))
const vuexPersist = new VuexPersistence<any, any>({
  strictMode: true,
  storage: mockStorage,
})

const buildStore = () => new Store<any>({
  strict: true,
  state: {
    mice: {
      jerry: {
        squeeks: 2
      },
      mickey: {
        squeeks: 3
      }
    }
  },
  mutations: {
    addMouse(state, name) {
      state.mice = {...state.mice, [name]: {squeeks: 0}}
    },
    RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION
  },
  plugins: [vuexPersist.plugin]
})

const store = buildStore()


describe('Storage: MockStorage; Test: observable nested objects; Existing Data: TRUE; Strict: TRUE', () => {
  it('should keep observers in nested objects', () => {
    store.commit('addMouse', 'minnie')
    expect(store.state.mice.minnie.__ob__).to.not.be.undefined
    const newStore = buildStore()
    expect(newStore.state.mice.minnie.__ob__).to.not.be.undefined
  })
})
