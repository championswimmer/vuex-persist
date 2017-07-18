/**
 * Created by championswimmer on 19/07/17.
 */
/**
 * Created by championswimmer on 19/07/17.
 */
import {Store} from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence from '../dist'
import {assert, expect} from 'chai'

Vue.use(Vuex)

const obj: any = {vuex: {count: 10}}
const vuexDom = new VuexPersistence<any, any>({
  restoreState: (key, storage) => obj[key],
  saveState: (key, state, storage) => obj[key] = state,
  reducer: (state) => ({count: state.count}),
  filter: (mutation) => (mutation.type === 'increment'),
})

const store = new Store<any>({
  state: {
    count: 0,
    name: 'test'
  },
  mutations: {
    increment(state) {
      state.count++
    },
    decrement(state) {
      state.count--
    }
  },
  plugins: [vuexDom.plugin]
})

describe('mutations', () => {
  it('increment', () => {
    store.commit('increment')
    expect(obj['vuex'].count).to.equal(11)
  })
})
describe('mutations', () => {
  it('decrement', () => {
    store.commit('decrement')
    expect(obj['vuex'].count).to.equal(11)
  })
})
describe('storage', () => {
  it('reducer', () => {
    store.commit('decrement')
    expect(obj['vuex'].name).to.be.an('undefined')
  })
})

