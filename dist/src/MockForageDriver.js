"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MockForageDriver = (function () {
    function MockForageDriver() {
        this._driver = 'mockforage';
        this._support = true;
    }
    MockForageDriver.prototype._initStorage = function (options) {
    };
    MockForageDriver.prototype.getItem = function (key) {
        return Promise.resolve(this._store[key]);
    };
    MockForageDriver.prototype.setItem = function (key, value) {
        this._store[key] = value.toString();
        return Promise.resolve();
    };
    MockForageDriver.prototype.removeItem = function (key) {
        delete this._store[key];
        return Promise.resolve();
    };
    MockForageDriver.prototype.clear = function () {
        for (var _i = 0, _a = Object.keys(this._store); _i < _a.length; _i++) {
            var key = _a[_i];
            delete this._store[key];
        }
        return Promise.resolve();
    };
    MockForageDriver.prototype.length = function () {
        return Promise.resolve(Object.keys(this._store).length);
    };
    MockForageDriver.prototype.key = function (keyIndex) {
        return Promise.resolve(Object.keys(this._store)[keyIndex]);
    };
    MockForageDriver.prototype.keys = function () {
        return Promise.resolve(Object.keys(this._store));
    };
    MockForageDriver.prototype.iterate = function (iteratee) {
        var _this = this;
        return Promise.all(Object.keys(this._store).map(function (key, index, store) {
            return Promise.resolve(iteratee(_this._store[key], key, index));
        }));
    };
    return MockForageDriver;
}());
exports.default = MockForageDriver;
//# sourceMappingURL=MockForageDriver.js.map