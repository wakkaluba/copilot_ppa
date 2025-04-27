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
exports.ComplexityAnalysisCommand = void 0;
var vscode = require("vscode");
var codeComplexityAnalyzer_1 = require("./codeComplexityAnalyzer");
var path = require("path");
var ComplexityAnalysisCommand = /** @class */ (function () {
    function ComplexityAnalysisCommand() {
        this.decorationDisposables = [];
        this.complexityAnalyzer = new codeComplexityAnalyzer_1.CodeComplexityAnalyzer();
    }
    /**
     * Register all complexity analysis commands
     * @returns Disposable for the commands
     */
    ComplexityAnalysisCommand.prototype.register = function () {
        var _a;
        var subscriptions = [];
        // Register commands
        subscriptions.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileComplexity', this.analyzeCurrentFile.bind(this)));
        subscriptions.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeWorkspaceComplexity', this.analyzeWorkspace.bind(this)));
        subscriptions.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.toggleComplexityVisualization', this.toggleComplexityVisualization.bind(this)));
        // Watch for editor changes to update decorations
        subscriptions.push(vscode.window.onDidChangeActiveTextEditor(this.handleEditorChange.bind(this)));
        return (_a = vscode.Disposable).from.apply(_a, subscriptions);
    };
    /**
     * Analyze complexity of the current file in the editor
     */
    ComplexityAnalysisCommand.prototype.analyzeCurrentFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor;
            var _this = this;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showWarningMessage('No active file to analyze.');
                    return [2 /*return*/];
                }
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Analyzing file complexity...',
                    cancellable: false
                }, function () { return __awaiter(_this, void 0, void 0, function () {
                    var filePath, result, fileName, report, doc;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                filePath = editor.document.uri.fsPath;
                                return [4 /*yield*/, this.complexityAnalyzer.analyzeFile(filePath)];
                            case 1:
                                result = _a.sent();
                                if (!result) return [3 /*break*/, 4];
                                fileName = path.basename(filePath);
                                report = "# Complexity Analysis: ".concat(fileName, "\n\n") +
                                    "- **Average complexity**: ".concat(result.averageComplexity.toFixed(2), "\n") +
                                    "- **Total functions**: ".concat(result.functions.length, "\n\n") +
                                    this.generateFunctionsTable(result);
                                return [4 /*yield*/, vscode.workspace.openTextDocument({
                                        content: report,
                                        language: 'markdown'
                                    })];
                            case 2:
                                doc = _a.sent();
                                return [4 /*yield*/, vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside })];
                            case 3:
                                _a.sent();
                                // Apply decorations
                                this.clearDecorations();
                                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
                                return [3 /*break*/, 5];
                            case 4:
                                vscode.window.showInformationMessage('File type not supported for complexity analysis.');
                                _a.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Analyze complexity of the entire workspace
     */
    ComplexityAnalysisCommand.prototype.analyzeWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders;
            var _this = this;
            return __generator(this, function (_a) {
                workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    vscode.window.showWarningMessage('No workspace folder open.');
                    return [2 /*return*/];
                }
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Analyzing workspace complexity...',
                    cancellable: false
                }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                    var folder, selected, results, report, doc, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 7, , 8]);
                                folder = void 0;
                                if (!(workspaceFolders.length === 1)) return [3 /*break*/, 1];
                                folder = workspaceFolders[0];
                                return [3 /*break*/, 3];
                            case 1: return [4 /*yield*/, vscode.window.showQuickPick(workspaceFolders.map(function (folder) { return ({
                                    label: folder.name,
                                    folder: folder
                                }); }), { placeHolder: 'Select workspace folder to analyze' })];
                            case 2:
                                selected = _a.sent();
                                if (!selected) {
                                    return [2 /*return*/]; // User cancelled
                                }
                                folder = selected.folder;
                                _a.label = 3;
                            case 3:
                                progress.report({ message: "Analyzing files in ".concat(folder.name, "...") });
                                return [4 /*yield*/, this.complexityAnalyzer.analyzeWorkspace(folder)];
                            case 4:
                                results = _a.sent();
                                if (results.length === 0) {
                                    vscode.window.showInformationMessage('No files found for complexity analysis.');
                                    return [2 /*return*/];
                                }
                                report = this.complexityAnalyzer.generateComplexityReport(results);
                                return [4 /*yield*/, vscode.workspace.openTextDocument({
                                        content: report,
                                        language: 'markdown'
                                    })];
                            case 5:
                                doc = _a.sent();
                                return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                            case 6:
                                _a.sent();
                                vscode.window.showInformationMessage("Complexity analysis completed for ".concat(results.length, " files."));
                                return [3 /*break*/, 8];
                            case 7:
                                error_1 = _a.sent();
                                console.error('Error analyzing workspace:', error_1);
                                vscode.window.showErrorMessage("Error analyzing workspace: ".concat(error_1.message));
                                return [3 /*break*/, 8];
                            case 8: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Toggle complexity visualization in the editor
     */
    ComplexityAnalysisCommand.prototype.toggleComplexityVisualization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, filePath, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active editor.');
                            return [2 /*return*/];
                        }
                        if (!(this.decorationDisposables.length > 0)) return [3 /*break*/, 1];
                        // Decorations are active, remove them
                        this.clearDecorations();
                        vscode.window.showInformationMessage('Complexity visualization disabled.');
                        return [3 /*break*/, 3];
                    case 1:
                        filePath = editor.document.uri.fsPath;
                        return [4 /*yield*/, this.complexityAnalyzer.analyzeFile(filePath)];
                    case 2:
                        result = _a.sent();
                        if (result) {
                            this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
                            vscode.window.showInformationMessage('Complexity visualization enabled.');
                        }
                        else {
                            vscode.window.showInformationMessage('File type not supported for complexity analysis.');
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle editor change event to update decorations
     */
    ComplexityAnalysisCommand.prototype.handleEditorChange = function (editor) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Clear existing decorations
                        this.clearDecorations();
                        if (!(editor && this.decorationDisposables.length > 0)) return [3 /*break*/, 2];
                        filePath = editor.document.uri.fsPath;
                        return [4 /*yield*/, this.complexityAnalyzer.analyzeFile(filePath)];
                    case 1:
                        result = _a.sent();
                        if (result) {
                            this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear all active decorations
     */
    ComplexityAnalysisCommand.prototype.clearDecorations = function () {
        while (this.decorationDisposables.length > 0) {
            var disposable = this.decorationDisposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    };
    /**
     * Generate a markdown table of functions sorted by complexity
     */
    ComplexityAnalysisCommand.prototype.generateFunctionsTable = function (result) {
        var table = '## Functions by Complexity\n\n';
        if (result.functions.length === 0) {
            return table + '*No functions found to analyze.*\n\n';
        }
        table += '| Function | Complexity | Lines |\n';
        table += '|----------|------------|-------|\n';
        result.functions
            .sort(function (a, b) { return b.complexity - a.complexity; })
            .forEach(function (fn) {
            var complexityIndicator = '';
            if (fn.complexity > 15) {
                complexityIndicator = '🔴 '; // High complexity
            }
            else if (fn.complexity > 10) {
                complexityIndicator = '🟠 '; // Medium complexity
            }
            else {
                complexityIndicator = '🟢 '; // Low complexity
            }
            table += "| ".concat(fn.name, " | ").concat(complexityIndicator).concat(fn.complexity, " | ").concat(fn.startLine, "-").concat(fn.endLine, " |\n");
        });
        return table;
    };
    return ComplexityAnalysisCommand;
}());
exports.ComplexityAnalysisCommand = ComplexityAnalysisCommand;
