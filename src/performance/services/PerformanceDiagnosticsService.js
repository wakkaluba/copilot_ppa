"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceDiagnosticsService = void 0;
var vscode = require("vscode");
var PerformanceDiagnosticsService = /** @class */ (function () {
    function PerformanceDiagnosticsService() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('performance');
    }
    PerformanceDiagnosticsService.prototype.updateDiagnostics = function (document, result) {
        var _this = this;
        var diagnostics = result.issues.map(function (issue) {
            var range = new vscode.Range(issue.line - 1, 0, issue.line - 1, document.lineAt(issue.line - 1).text.length);
            var diagnostic = new vscode.Diagnostic(range, "".concat(issue.description, "\n").concat(issue.solution || ''), _this.getSeverity(issue.severity));
            diagnostic.source = 'Performance';
            diagnostic.code = issue.title;
            if (issue.solutionCode) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, range), "Suggestion: ".concat(issue.solutionCode))
                ];
            }
            return diagnostic;
        });
        this.diagnosticCollection.set(document.uri, diagnostics);
    };
    PerformanceDiagnosticsService.prototype.getSeverity = function (severity) {
        switch (severity) {
            case 'critical':
                return vscode.DiagnosticSeverity.Error;
            case 'high':
                return vscode.DiagnosticSeverity.Warning;
            case 'medium':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    };
    PerformanceDiagnosticsService.prototype.dispose = function () {
        this.diagnosticCollection.dispose();
    };
    return PerformanceDiagnosticsService;
}());
exports.PerformanceDiagnosticsService = PerformanceDiagnosticsService;
