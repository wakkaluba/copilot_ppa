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
exports.OptimizationError = void 0;
// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\OptimizationError.ts
/**
 * Error thrown when there is an issue generating optimization suggestions
 */
var OptimizationError = /** @class */ (function (_super) {
    __extends(OptimizationError, _super);
    function OptimizationError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'OptimizationError';
        return _this;
    }
    return OptimizationError;
}(Error));
exports.OptimizationError = OptimizationError;
