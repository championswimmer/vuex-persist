'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var merge = _interopDefault(require('lodash.merge'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */













function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

/**
 * Created by championswimmer on 22/07/17.
 */
var MockStorage = (function () {
    function MockStorage() {
    }
    Object.defineProperty(MockStorage.prototype, "length", {
        get: function () {
            return Object.keys(this).length;
        },
        enumerable: true,
        configurable: true
    });
    MockStorage.prototype.key = function (index) {
        return Object.keys(this)[index];
    };
    MockStorage.prototype.setItem = function (key, data) {
        this[key] = data.toString();
    };
    MockStorage.prototype.getItem = function (key) {
        return this[key];
    };
    MockStorage.prototype.removeItem = function (key) {
        delete this[key];
    };
    MockStorage.prototype.clear = function () {
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var key = _a[_i];
            delete this[key];
        }
    };
    return MockStorage;
}());

/**
 * A class that implements the vuex persistence.
 */
var VuexPersistence = (function () {
    /**
     * Create a {@link VuexPersistence} object.
     * Use the <code>plugin</code> function of this class as a
     * Vuex plugin.
     * @param {PersistOptions} options
     */
    function VuexPersistence(options) {
        var _this = this;
        /**
         * Creates a subscriber on the store. automatically is used
         * when this is used a vuex plugin. Not for manual usage.
         * @param store
         */
        this.subscriber = function (store) {
            return function (handler) { return store.subscribe(handler); };
        };
        this.key = ((options.key != null) ? options.key : 'vuex');
        this.storage = ((options.storage != null)
            ? options.storage
            : (new MockStorage()));
        this.restoreState = ((options.restoreState != null)
            ? options.restoreState
            : (function (key, storage) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, (storage || this.storage).getItem(key)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()) || '{}'])];
                }
            }); }); }));
        this.saveState = ((options.saveState != null)
            ? options.saveState
            : (function (key, state, storage) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (storage || this.storage).setItem(key, JSON.stringify(state))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); }));
        /**
         * How this works is -
         *  1. If there is options.reducer function, we use that, if not;
         *  2. We check options.modules;
         *    1. If there is no options.modules array, we use entire state in reducer
         *    2. Otherwise, we create a reducer that merges all those state modules that are
         *        defined in the options.modules[] array
         * @type {((state: S) => {}) | ((state: S) => S) | ((state: any) => {})}
         */
        this.reducer = ((options.reducer != null)
            ? options.reducer
            : ((options.modules == null)
                ? (function (state) { return state; })
                : (function (state) {
                    return options.modules.reduce(function (a, i) {
                        return merge(a, (_a = {}, _a[i] = state[i], _a));
                        var _a;
                    }, {});
                })));
        this.filter = ((options.filter != null)
            ? options.filter
            : (function (mutation) { return true; }));
        this.strictMode = options.strictMode || false;
        this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
            state = merge(state, savedState);
        };
        this.plugin = function (store) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var savedState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restoreState(this.key, this.storage)
                        /**
                         * If in strict mode, do only via mutation
                         */
                    ];
                    case 1:
                        savedState = _a.sent();
                        /**
                         * If in strict mode, do only via mutation
                         */
                        if (this.strictMode) {
                            store.commit('RESTORE_MUTATION', savedState);
                        }
                        else {
                            store.replaceState(merge(store.state, savedState));
                        }
                        this.subscriber(store)(function (mutation, state) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this.filter(mutation)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.saveState(this.key, this.reducer(state), this.storage)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); };
    }
    return VuexPersistence;
}());

exports.VuexPersistence = VuexPersistence;
exports.MockStorage = MockStorage;
exports['default'] = VuexPersistence;
//# sourceMappingURL=index.js.map
