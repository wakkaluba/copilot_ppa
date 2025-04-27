"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestLogger = void 0;
var TestLogger = /** @class */ (function () {
    function TestLogger() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
    }
    TestLogger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.errors.push(this.format(message, args));
    };
    TestLogger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.warnings.push(this.format(message, args));
    };
    TestLogger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.infos.push(this.format(message, args));
    };
    TestLogger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.debugs.push(this.format(message, args));
    };
    TestLogger.prototype.format = function (message, args) {
        return "".concat(message, " ").concat(args.join(' ')).trim();
    };
    TestLogger.prototype.reset = function () {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
    };
    return TestLogger;
}());
exports.TestLogger = TestLogger;
