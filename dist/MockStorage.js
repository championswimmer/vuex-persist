"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = MockStorage;
//# sourceMappingURL=MockStorage.js.map