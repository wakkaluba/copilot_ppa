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
exports.SecurityAnalysisService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
/**
 * Service responsible for coordinating security analysis operations
 */
class SecurityAnalysisService {
    scanner;
    disposables = [];
    _onAnalysisComplete = new events_1.EventEmitter();
    analysisTimeout;
    diagnosticCollection;
    issueCache = new Map();
    constructor(scanner) {
        this.scanner = scanner;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('security');
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(() => this.onDocumentChanged()));
    }
    onAnalysisComplete = this._onAnalysisComplete.event;
    async scanWorkspace(progressCallback) {
        progressCallback?.("Analyzing workspace files...");
        const result = await this.scanner.scanWorkspace(progressCallback);
        this._onAnalysisComplete.emit(result);
        return result;
    }
    async scanActiveFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { issues: [], scannedFiles: 0, timestamp: new Date() };
        }
        const result = await this.scanner.scanFile(editor.document.uri);
        this._onAnalysisComplete.emit(result);
        return result;
    }
    async getIssuesByType(issueId) {
        const result = await this.scanWorkspace();
        return result.issues.filter(issue => issue.id === issueId);
    }
    async onDocumentChanged() {
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
        this.analysisTimeout = setTimeout(async () => {
            await this.scanActiveFile();
        }, 1000);
    }
    async scanFile(document) {
        const issues = [];
        const text = document.getText();
        // Scan based on file type
        switch (document.languageId) {
            case 'javascript':
            case 'typescript':
                this.checkJavaScriptSecurity(text, document, issues);
                break;
            case 'python':
                this.checkPythonSecurity(text, document, issues);
                break;
            case 'java':
                this.checkJavaSecurity(text, document, issues);
                break;
        }
        // Update diagnostics
        this.updateDiagnostics(document, issues);
        this.issueCache.set(document.uri.toString(), issues);
        return issues;
    }
    updateDiagnostics(document, issues) {
        const diagnostics = issues.map(issue => new vscode.Diagnostic(new vscode.Range(new vscode.Position(issue.location.line, issue.location.column), new vscode.Position(issue.location.line, issue.location.column + 1)), issue.description, vscode.DiagnosticSeverity.Warning));
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
    checkJavaScriptSecurity(text, document, issues) {
        // Add JavaScript/TypeScript specific security checks
        this.checkForEvalUse(text, document, issues);
        this.checkForDangerousNodeModules(text, document, issues);
        this.checkForXSSVulnerabilities(text, document, issues);
    }
    checkPythonSecurity(text, document, issues) {
        // Add Python specific security checks
        this.checkForUnsafeDeserialization(text, document, issues);
        this.checkForShellInjection(text, document, issues);
        this.checkForSQLInjection(text, document, issues);
    }
    checkJavaSecurity(text, document, issues) {
        // Add Java specific security checks
        this.checkForUnsafeReflection(text, document, issues);
        this.checkForUnsafeDeserialization(text, document, issues);
        this.checkForSQLInjection(text, document, issues);
    }
    checkForEvalUse(text, document, issues) {
        const evalRegex = /eval\s*\(/g;
        let match;
        while ((match = evalRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                id: 'SEC001',
                name: 'Unsafe eval() usage',
                description: 'Using eval() can be dangerous as it executes arbitrary JavaScript code',
                severity: 'high',
                location: {
                    file: document.uri.fsPath,
                    line: position.line,
                    column: position.character
                },
                recommendation: 'Avoid using eval(). Consider safer alternatives like JSON.parse() for JSON data.'
            });
        }
    }
    dispose() {
        this.diagnosticCollection.dispose();
        this.disposables.forEach(d => d.dispose());
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
        this._onAnalysisComplete.removeAllListeners();
    }
}
exports.SecurityAnalysisService = SecurityAnalysisService;
//# sourceMappingURL=SecurityAnalysisService.js.map