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
exports.LinterIntegration = void 0;
var vscode = require("vscode");
var cp = require("child_process");
var path = require("path");
var fs = require("fs");
/**
 * Handles integration with various code linters
 */
var LinterIntegration = /** @class */ (function () {
    function LinterIntegration() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Linter');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('llm-agent-linter');
    }
    /**
     * Initialize the linter integration
     */
    LinterIntegration.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Run appropriate linter for the current file
     */
    LinterIntegration.prototype.runLinter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document, filePath, workspaceFolder, fileExt, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        document = editor.document;
                        filePath = document.uri.fsPath;
                        workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
                        if (!workspaceFolder) {
                            vscode.window.showWarningMessage('File must be part of a workspace');
                            return [2 /*return*/];
                        }
                        // Save document first
                        return [4 /*yield*/, document.save()];
                    case 1:
                        // Save document first
                        _b.sent();
                        fileExt = path.extname(filePath);
                        _a = fileExt;
                        switch (_a) {
                            case '.js': return [3 /*break*/, 2];
                            case '.ts': return [3 /*break*/, 2];
                            case '.jsx': return [3 /*break*/, 2];
                            case '.tsx': return [3 /*break*/, 2];
                            case '.py': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.runESLint(filePath, workspaceFolder.uri.fsPath)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this.runPylint(filePath, workspaceFolder.uri.fsPath)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        vscode.window.showInformationMessage("No linter configured for ".concat(fileExt, " files"));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run ESLint on a JavaScript/TypeScript file
     */
    LinterIntegration.prototype.runESLint = function (filePath, workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var eslintPath, result;
            return __generator(this, function (_a) {
                try {
                    eslintPath = path.join(workspacePath, 'node_modules', '.bin', 'eslint');
                    if (!fs.existsSync(eslintPath)) {
                        vscode.window.showWarningMessage('ESLint not found in node_modules. Please install it first.');
                        return [2 /*return*/];
                    }
                    this.outputChannel.clear();
                    this.outputChannel.show();
                    this.outputChannel.appendLine('Running ESLint...');
                    result = cp.execSync("\"".concat(eslintPath, "\" \"").concat(filePath, "\" --format json"), { cwd: workspacePath }).toString();
                    this.parseLintResults(filePath, result, 'eslint');
                    this.outputChannel.appendLine('ESLint completed');
                }
                catch (error) {
                    this.outputChannel.appendLine("Error running ESLint: ".concat(error));
                    vscode.window.showErrorMessage("Failed to run ESLint: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Run Pylint on a Python file
     */
    LinterIntegration.prototype.runPylint = function (filePath, workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                try {
                    this.outputChannel.clear();
                    this.outputChannel.show();
                    this.outputChannel.appendLine('Running Pylint...');
                    result = cp.execSync("pylint \"".concat(filePath, "\" --output-format=json"), { cwd: workspacePath }).toString();
                    this.parseLintResults(filePath, result, 'pylint');
                    this.outputChannel.appendLine('Pylint completed');
                }
                catch (error) {
                    this.outputChannel.appendLine("Error running Pylint: ".concat(error));
                    vscode.window.showErrorMessage("Failed to run Pylint: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Parse lint results and convert to VS Code diagnostics
     */
    LinterIntegration.prototype.parseLintResults = function (filePath, results, linterType) {
        try {
            var diagnostics = [];
            var fileUri = vscode.Uri.file(filePath);
            if (linterType === 'eslint') {
                var eslintResults = JSON.parse(results);
                for (var _i = 0, eslintResults_1 = eslintResults; _i < eslintResults_1.length; _i++) {
                    var result = eslintResults_1[_i];
                    if (result.messages && result.messages.length > 0) {
                        for (var _a = 0, _b = result.messages; _a < _b.length; _a++) {
                            var msg = _b[_a];
                            var range = new vscode.Range(msg.line - 1, msg.column - 1, msg.endLine ? msg.endLine - 1 : msg.line - 1, msg.endColumn ? msg.endColumn - 1 : msg.column);
                            var severity = this.mapESLintSeverity(msg.severity);
                            var diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                            diagnostic.source = 'eslint';
                            diagnostic.code = msg.ruleId;
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
            else if (linterType === 'pylint') {
                var pylintResults = JSON.parse(results);
                for (var _c = 0, pylintResults_1 = pylintResults; _c < pylintResults_1.length; _c++) {
                    var msg = pylintResults_1[_c];
                    var range = new vscode.Range(msg.line - 1, msg.column, msg.line - 1, msg.column + 1);
                    var severity = this.mapPylintSeverity(msg.type);
                    var diagnostic = new vscode.Diagnostic(range, msg.message, severity);
                    diagnostic.source = 'pylint';
                    diagnostic.code = msg.symbol;
                    diagnostics.push(diagnostic);
                }
            }
            this.diagnosticCollection.set(fileUri, diagnostics);
            if (diagnostics.length === 0) {
                this.outputChannel.appendLine('No issues found');
            }
            else {
                this.outputChannel.appendLine("Found ".concat(diagnostics.length, " issues"));
            }
        }
        catch (error) {
            this.outputChannel.appendLine("Error parsing lint results: ".concat(error));
        }
    };
    /**
     * Map ESLint severity to VS Code DiagnosticSeverity
     */
    LinterIntegration.prototype.mapESLintSeverity = function (severity) {
        switch (severity) {
            case 2: return vscode.DiagnosticSeverity.Error;
            case 1: return vscode.DiagnosticSeverity.Warning;
            default: return vscode.DiagnosticSeverity.Information;
        }
    };
    /**
     * Map Pylint severity to VS Code DiagnosticSeverity
     */
    LinterIntegration.prototype.mapPylintSeverity = function (severity) {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'convention': return vscode.DiagnosticSeverity.Information;
            case 'refactor': return vscode.DiagnosticSeverity.Hint;
            default: return vscode.DiagnosticSeverity.Information;
        }
    };
    /**
     * Dispose resources
     */
    LinterIntegration.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.diagnosticCollection.dispose();
    };
    return LinterIntegration;
}());
exports.LinterIntegration = LinterIntegration;
