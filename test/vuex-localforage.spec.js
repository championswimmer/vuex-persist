"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by championswimmer on 20/07/17.
 */
var vuex_1 = require("vuex");
var Vuex = require("vuex");
var Vue = require("vue");
var dist_1 = require("../dist");
var chai_1 = require("chai");
var localForage = require("localforage");
var MockForageDriver_1 = require("../src/MockForageDriver");
Vue.use(Vuex);
localForage.defineDriver(new MockForageDriver_1.default());
localForage.setDriver('mockforage');
var vuexPersist = new dist_1.default({
    storage: localForage,
    reducer: function (state) { return ({ dog: state.dog }); },
    filter: function (mutation) { return (mutation.type === 'dogBark'); }
});
var store = new vuex_1.Store({
    state: {
        dog: {
            barks: 0
        },
        cat: {
            mews: 0
        }
    },
    mutations: {
        dogBark: function (state) {
            state.dog.barks++;
        },
        catMew: function (state) {
            state.cat.mews++;
        }
    },
    plugins: [vuexPersist.plugin]
});
// const getSavedStore = async function (): Promise<any> {
//   try {
//     let store = await localForage.getItem<string>('vuex')
//     return JSON.parse(store)
//   } catch (err) {
//     throw err
//   }
// }
var getSavedStore = function () {
    return Promise.resolve(localForage.getItem('vuex')
        .then(function (savedStore) { return JSON.parse(savedStore); })
        .catch(function (err) { throw err; }));
};
describe('Storage: LocalForage, Test: reducer, filter', function () {
    it('should persist reduced state', function () {
        store.commit('dogBark');
        getSavedStore().then(function (savedStore) {
            chai_1.expect(savedStore.dog.barks).to.equal(1);
        }).catch(function (err) { throw err; });
    });
    it('should not persist non reduced state', function () {
        store.commit('catMew');
        getSavedStore().then(function (savedStore) {
            chai_1.expect(savedStore.cat).to.be.undefined;
        }).catch(function (err) { throw err; });
    });
});
