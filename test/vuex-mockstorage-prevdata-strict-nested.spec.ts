/**
 * Created by championswimmer on 20/07/17.
 */
import {assert, expect, should} from 'chai'
import Vue = require('vue')
import {Store} from 'vuex'
import Vuex = require('vuex')
import {MockStorage} from '../dist'
import VuexPersistence from '../dist'

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
    //noinspection TsLint
    // tslint:disable-next-line
    expect(store.state.mice.minnie.__ob__).to.not.be.undefined
    const newStore = buildStore()
    //noinspection TsLint
    // tslint:disable-next-line
    expect(newStore.state.mice.minnie.__ob__).to.not.be.undefined
  })
})
