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
exports.DependencyAnalysisCommand = void 0;
var vscode = require("vscode");
var LoggerService_1 = require("../services/LoggerService");
var DependencyAnalysisService_1 = require("../services/dependencyAnalysis/DependencyAnalysisService");
var dependencyGraphView_1 = require("../webview/dependencyGraphView");
/**
 * Handles dependency analysis commands with comprehensive error handling
 */
var DependencyAnalysisCommand = /** @class */ (function () {
    function DependencyAnalysisCommand(context) {
        this.disposables = [];
        this.service = new DependencyAnalysisService_1.DependencyAnalysisService(context);
        this.graphProvider = new dependencyGraphView_1.DependencyGraphProvider(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
        this.registerEventHandlers();
    }
    DependencyAnalysisCommand.prototype.register = function () {
        var _this = this;
        try {
            this.disposables.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeDependencies', function () { return _this.handleAnalyzeDependencies(); }), vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileDependencies', function () { return _this.handleAnalyzeFileDependencies(); }), vscode.commands.registerCommand('vscodeLocalLLMAgent.showDependencyGraph', function () { return _this.handleShowDependencyGraph(); }));
            return {
                dispose: function () {
                    _this.disposables.forEach(function (d) { return d.dispose(); });
                    _this.disposables.length = 0;
                    _this.service.dispose();
                }
            };
        }
        catch (error) {
            this.handleError('Failed to register commands', error);
            throw error;
        }
    };
    DependencyAnalysisCommand.prototype.handleAnalyzeDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceRoot_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        workspaceRoot_1 = this.getWorkspaceRoot();
                        if (!workspaceRoot_1) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: 'Analyzing project dependencies...',
                                cancellable: true
                            }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.service.analyzeDependencies(workspaceRoot_1, {
                                                onProgress: function (message) {
                                                    progress.report({ message: message });
                                                }
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Failed to analyze dependencies', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisCommand.prototype.handleAnalyzeFileDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('Please open a file to analyze dependencies');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.service.analyzeFileDependencies(editor.document.uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to analyze file dependencies', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisCommand.prototype.handleShowDependencyGraph = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceRoot, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        workspaceRoot = this.getWorkspaceRoot();
                        if (!workspaceRoot) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.graphProvider.show(workspaceRoot)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Failed to show dependency graph', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisCommand.prototype.getWorkspaceRoot = function () {
        var workspaceFolders = vscode.workspace.workspaceFolders;
        if (!(workspaceFolders === null || workspaceFolders === void 0 ? void 0 : workspaceFolders.length)) {
            vscode.window.showErrorMessage('Please open a workspace to analyze dependencies');
            return undefined;
        }
        return workspaceFolders[0].uri.fsPath;
    };
    DependencyAnalysisCommand.prototype.registerEventHandlers = function () {
        var _this = this;
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(function () { return _this.handleWorkspaceChange(); }), vscode.workspace.onDidChangeTextDocument(function (e) { return _this.handleDocumentChange(e); }));
    };
    DependencyAnalysisCommand.prototype.handleWorkspaceChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.service.reset()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.handleError('Failed to handle workspace change', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisCommand.prototype.handleDocumentChange = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.shouldAnalyze(e.document)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.service.invalidateCache(e.document.uri)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        this.handleError('Failed to handle document change', error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisCommand.prototype.shouldAnalyze = function (document) {
        var analyzableExtensions = ['.ts', '.js', '.jsx', '.tsx', '.vue', '.json'];
        return analyzableExtensions.some(function (ext) { return document.fileName.endsWith(ext); });
    };
    DependencyAnalysisCommand.prototype.handleError = function (message, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error("DependencyAnalysisCommand: ".concat(message), errorMessage);
        vscode.window.showErrorMessage("".concat(message, ": ").concat(errorMessage));
    };
    return DependencyAnalysisCommand;
}());
exports.DependencyAnalysisCommand = DependencyAnalysisCommand;
