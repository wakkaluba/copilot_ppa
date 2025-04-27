"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAnalysisService = void 0;
var vscode = require("vscode");
var events_1 = require("events");
/**
 * Service responsible for coordinating security analysis operations
 */
var SecurityAnalysisService = /** @class */ (function () {
    function SecurityAnalysisService(scanner) {
        var _this = this;
        this.disposables = [];
        this._onAnalysisComplete = new events_1.EventEmitter();
        this.issueCache = new Map();
        this.onAnalysisComplete = this._onAnalysisComplete.event;
        this.scanner = scanner;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('security');
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(function () { return _this.onDocumentChanged(); }));
    }
    SecurityAnalysisService.prototype.scanWorkspace = function (progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback("Analyzing workspace files...");
                        return [4 /*yield*/, this.scanner.scanWorkspace(progressCallback)];
                    case 1:
                        result = _a.sent();
                        this._onAnalysisComplete.emit(result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    SecurityAnalysisService.prototype.scanActiveFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            return [2 /*return*/, { issues: [], scannedFiles: 0, timestamp: new Date() }];
                        }
                        return [4 /*yield*/, this.scanner.scanFile(editor.document.uri)];
                    case 1:
                        result = _a.sent();
                        this._onAnalysisComplete.emit(result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    SecurityAnalysisService.prototype.getIssuesByType = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.scanWorkspace()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.issues.filter(function (issue) { return issue.id === issueId; })];
                }
            });
        });
    };
    SecurityAnalysisService.prototype.onDocumentChanged = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.analysisTimeout) {
                    clearTimeout(this.analysisTimeout);
                }
                this.analysisTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.scanActiveFile()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, 1000);
                return [2 /*return*/];
            });
        });
    };
    SecurityAnalysisService.prototype.scanFile = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, text;
            return __generator(this, function (_a) {
                issues = [];
                text = document.getText();
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
                return [2 /*return*/, issues];
            });
        });
    };
    SecurityAnalysisService.prototype.updateDiagnostics = function (document, issues) {
        var diagnostics = issues.map(function (issue) { return new vscode.Diagnostic(new vscode.Range(new vscode.Position(issue.location.line, issue.location.column), new vscode.Position(issue.location.line, issue.location.column + 1)), issue.description, vscode.DiagnosticSeverity.Warning); });
        this.diagnosticCollection.set(document.uri, diagnostics);
    };
    SecurityAnalysisService.prototype.checkJavaScriptSecurity = function (text, document, issues) {
        // Add JavaScript/TypeScript specific security checks
        this.checkForEvalUse(text, document, issues);
        this.checkForDangerousNodeModules(text, document, issues);
        this.checkForXSSVulnerabilities(text, document, issues);
    };
    SecurityAnalysisService.prototype.checkPythonSecurity = function (text, document, issues) {
        // Add Python specific security checks
        this.checkForUnsafeDeserialization(text, document, issues);
        this.checkForShellInjection(text, document, issues);
        this.checkForSQLInjection(text, document, issues);
    };
    SecurityAnalysisService.prototype.checkJavaSecurity = function (text, document, issues) {
        // Add Java specific security checks
        this.checkForUnsafeReflection(text, document, issues);
        this.checkForUnsafeDeserialization(text, document, issues);
        this.checkForSQLInjection(text, document, issues);
    };
    SecurityAnalysisService.prototype.checkForEvalUse = function (text, document, issues) {
        var evalRegex = /eval\s*\(/g;
        var match;
        while ((match = evalRegex.exec(text)) !== null) {
            var position = document.positionAt(match.index);
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
    };
    SecurityAnalysisService.prototype.dispose = function () {
        this.diagnosticCollection.dispose();
        this.disposables.forEach(function (d) { return d.dispose(); });
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
        this._onAnalysisComplete.removeAllListeners();
    };
    return SecurityAnalysisService;
}());
exports.SecurityAnalysisService = SecurityAnalysisService;
