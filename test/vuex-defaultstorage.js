"use strict";
/**
 * Created by championswimmer on 23/07/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var vuex_1 = require("vuex");
var Vuex = require("vuex");
var Vue = require("vue");
var dist_1 = require("../dist");
var chai_1 = require("chai");
Vue.use(Vuex);
var vuexPersist = new dist_1.default({});
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
var getSavedStore = function () { return JSON.parse(vuexPersist.storage.getItem('vuex')); };
describe('Storage: Default Storage, Test: reducer, filter; Strict Mode: OFF', function () {
    it('should persist reduced state', function () {
        store.commit('dogBark');
        chai_1.expect(getSavedStore().dog.barks).to.equal(1);
        store.commit('catMew');
        //noinspection TsLint
        chai_1.expect(getSavedStore().cat.mews).to.equal(1);
    });
});
