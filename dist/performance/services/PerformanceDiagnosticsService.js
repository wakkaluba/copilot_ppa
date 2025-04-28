"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceDiagnosticsService = void 0;
const vscode = __importStar(require("vscode"));
class PerformanceDiagnosticsService {
    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('performance');
    }
    updateDiagnostics(document, result) {
        const diagnostics = result.issues.map(issue => {
            const range = new vscode.Range(issue.line - 1, 0, issue.line - 1, document.lineAt(issue.line - 1).text.length);
            const diagnostic = new vscode.Diagnostic(range, `${issue.description}\n${issue.solution || ''}`, this.getSeverity(issue.severity));
            diagnostic.source = 'Performance';
            diagnostic.code = issue.title;
            if (issue.solutionCode) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, range), `Suggestion: ${issue.solutionCode}`)
                ];
            }
            return diagnostic;
        });
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
    getSeverity(severity) {
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
    }
    dispose() {
        this.diagnosticCollection.dispose();
    }
}
exports.PerformanceDiagnosticsService = PerformanceDiagnosticsService;
//# sourceMappingURL=PerformanceDiagnosticsService.js.map