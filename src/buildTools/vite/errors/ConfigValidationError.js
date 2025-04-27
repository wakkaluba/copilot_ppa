"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidationError = void 0;
/**
 * Custom error class for Vite configuration validation errors
 */
var ConfigValidationError = /** @class */ (function (_super) {
    __extends(ConfigValidationError, _super);
    function ConfigValidationError(message, code, details) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ConfigValidationError';
        _this.code = code;
        _this.details = details;
        // Ensure proper prototype chain for ES5
        Object.setPrototypeOf(_this, ConfigValidationError.prototype);
        return _this;
    }
    ConfigValidationError.prototype.toString = function () {
        var result = "".concat(this.name, ": ").concat(this.message);
        if (this.details) {
            result += "\nDetails: ".concat(JSON.stringify(this.details, null, 2));
        }
        return result;
    };
    return ConfigValidationError;
}(Error));
exports.ConfigValidationError = ConfigValidationError;
