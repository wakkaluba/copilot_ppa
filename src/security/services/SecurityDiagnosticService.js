"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityDiagnosticService = void 0;
var vscode = require("vscode");
var SecurityDiagnosticService = /** @class */ (function () {
    function SecurityDiagnosticService(context) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('securityIssues');
        context.subscriptions.push(this.diagnosticCollection);
    }
    SecurityDiagnosticService.prototype.report = function (uri, diagnostics) {
        this.diagnosticCollection.set(uri, diagnostics);
    };
    SecurityDiagnosticService.prototype.clear = function (uri) {
        if (uri) {
            this.diagnosticCollection.delete(uri);
        }
        else {
            this.diagnosticCollection.clear();
        }
    };
    SecurityDiagnosticService.prototype.dispose = function () {
        this.diagnosticCollection.dispose();
    };
    return SecurityDiagnosticService;
}());
exports.SecurityDiagnosticService = SecurityDiagnosticService;
