"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by championswimmer on 22/07/17.
 */
/**
 * Created by championswimmer on 20/07/17.
 */
var vuex_1 = require("vuex");
var Vuex = require("vuex");
var Vue = require("vue");
var dist_1 = require("../dist");
var chai_1 = require("chai");
Vue.use(Vuex);
var objStorage = {};
var vuexPersist = new dist_1.default({
    key: 'dafuq',
    restoreState: function (key) { return objStorage[key]; },
    saveState: function (key, state) { objStorage[key] = state; },
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
var getSavedStore = function () { return objStorage['dafuq']; };
describe('Storage: Custom(Object); Test: reducer, filter; Strict Mode: OFF', function () {
    it('should persist reduced state', function () {
        store.commit('dogBark');
        chai_1.expect(getSavedStore().dog.barks).to.equal(1);
    });
    it('should not persist non reduced state', function () {
        store.commit('catMew');
        //noinspection TsLint
        chai_1.expect(getSavedStore().cat).to.be.undefined;
    });
});
