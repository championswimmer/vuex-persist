"use strict";
/**
 * Created by richicoder on 31/10/17.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var vuex_1 = require("vuex");
var Vuex = require("vuex");
var Vue = require("vue");
var dist_1 = require("../dist");
var chai_1 = require("chai");
var localForage = require("localforage");
var objectStore = {};
var MockForageStorage = {
    _driver: 'objectStorage',
    _support: true,
    _initStorage: function () { },
    clear: function () { },
    getItem: function (key) {
        return Promise.resolve(objectStore[key]);
    },
    iterate: function () { },
    key: function () { },
    keys: function () { },
    length: function () { },
    removeItem: function () { },
    setItem: function (key, data) {
        return Promise.resolve((objectStore[key] = data));
    }
};
Vue.use(Vuex);
localForage.defineDriver(MockForageStorage);
localForage.setDriver('objectStorage');
var vuexPersist = new dist_1.default({
    storage: localForage,
    key: 'dafuq',
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
describe('Storage: AsyncStorage; Test: reducer, filter; Strict Mode: OFF', function () {
    before(function () { return waitUntil(function () { return vuexPersist.subscribed; }); });
    it('should persist reduced state', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, waitUntil(function () { return vuexPersist.subscribed; })];
                case 1:
                    _a.sent();
                    store.commit('dogBark');
                    chai_1.expect(objectStore["dafuq"]).to.exist;
                    chai_1.expect(objectStore["dafuq"].dog.barks).to.equal(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not persist non reduced state', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            store.commit('catMew');
            chai_1.expect(objectStore["dafuq"].cat).to.be.undefined;
            return [2 /*return*/];
        });
    }); });
});
function waitUntil(condition) {
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var tries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tries = 0;
                    _a.label = 1;
                case 1:
                    if (!(!condition() && tries < 30)) return [3 /*break*/, 3];
                    return [4 /*yield*/, new Promise(function (_) { return setTimeout(_, 10); })];
                case 2:
                    _a.sent();
                    tries++;
                    return [3 /*break*/, 1];
                case 3:
                    resolve();
                    return [2 /*return*/];
            }
        });
    }); });
}
