import { expect } from 'chai'
import Vue from 'vue'
import { Store } from 'vuex'
import Vuex from 'vuex'
import VuexPersistence from '..'

Vue.use(Vuex)

class SaveWaiter {
  ready: Promise<void>
  done: Promise<void>
  resolveReady!: () => void
  resolveDone!: () => void

  constructor() {
    this.ready = new Promise((resolve) => { this.resolveReady = resolve })
    this.done = new Promise((resolve) => { this.resolveDone = resolve })
  }
}

const KEY = 'key'
const storage: Record<string, any> = {}
const saveWaiters = [new SaveWaiter(), new SaveWaiter()]
let saveCount = 0
const vuexPersist = new VuexPersistence({
  key: KEY,
  asyncStorage: true,
  restoreState: async (key) => storage[key],
  saveState: async (key, state) => {
    const saveWaiter = saveWaiters[saveCount]
    saveCount++

    await saveWaiter.ready
    storage[key] = state
    saveWaiter.resolveDone()
  }
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

describe('Storage: Custom/Async; Test: queue order', () => {
  it('should wait for the previous save to finish before saving', async () => {
    store.commit('dogBark')
    store.commit('catMew')

    // Make the second saveWaiter ready first. This should do nothing, because the write sits in
    // the queue behind the first write. The await here is needed to make the expect fail if
    // saveState has already started execution by making the promise in saveState resolve.
    saveWaiters[1].resolveReady()
    await saveWaiters[1].ready
    expect(storage[KEY]).not.to.exist

    saveWaiters[0].resolveReady()
    await saveWaiters[0].done
    expect(storage[KEY]).to.deep.equal({ dog: { barks: 1 }, cat: { mews: 0 }})

    await saveWaiters[1].done
    expect(storage[KEY]).to.deep.equal({ dog: { barks: 1 }, cat: { mews: 1 }})
  })
})