"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCodeAnalyzer = void 0;
var vscode = require("vscode");
var BaseCodeAnalyzer = /** @class */ (function () {
    function BaseCodeAnalyzer() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('unusedCode');
    }
    BaseCodeAnalyzer.prototype.dispose = function () {
        this.diagnosticCollection.dispose();
    };
    BaseCodeAnalyzer.prototype.updateDiagnostics = function (document, diagnostics) {
        this.diagnosticCollection.set(document.uri, diagnostics);
    };
    BaseCodeAnalyzer.prototype.clearDiagnostics = function (document) {
        this.diagnosticCollection.delete(document.uri);
    };
    return BaseCodeAnalyzer;
}());
exports.BaseCodeAnalyzer = BaseCodeAnalyzer;
