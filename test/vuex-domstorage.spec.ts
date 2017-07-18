/**
 * Created by championswimmer on 19/07/17.
 */
import {Store} from 'vuex'
import Vuex = require('vuex')
import Vue = require('vue')
import VuexPersistence from '../dist'
import {assert, expect} from 'chai'

Vue.use(Vuex)

const vuexDom = new VuexPersistence<any, any>({
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
    expect(JSON.parse(vuexDom.storage.getItem('vuex') as string).count).to.equal(1)
  })
})
describe('mutations', () => {
  it('decrement', () => {
    store.commit('decrement')
    expect(JSON.parse(vuexDom.storage.getItem('vuex') as string).count).to.equal(1)
  })
})
describe('storage', () => {
  it('reducer', () => {
    store.commit('decrement')
    expect(JSON.parse(vuexDom.storage.getItem('vuex') as string).name).to.be.an('undefined')
  })
})

