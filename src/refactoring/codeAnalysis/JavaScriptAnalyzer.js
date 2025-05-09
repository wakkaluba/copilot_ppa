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
exports.JavaScriptAnalyzer = void 0;
var TypeScriptAnalyzer_1 = require("./TypeScriptAnalyzer");
var JavaScriptAnalyzer = /** @class */ (function (_super) {
    __extends(JavaScriptAnalyzer, _super);
    function JavaScriptAnalyzer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return JavaScriptAnalyzer;
}(TypeScriptAnalyzer_1.TypeScriptAnalyzer));
exports.JavaScriptAnalyzer = JavaScriptAnalyzer;
