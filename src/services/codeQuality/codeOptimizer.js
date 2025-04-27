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
exports.CodeOptimizer = void 0;
var vscode = require("vscode");
var LoggerService_1 = require("../LoggerService");
var CodeAnalysisService_1 = require("./services/CodeAnalysisService");
var OptimizationService_1 = require("./services/OptimizationService");
var SuggestionService_1 = require("./services/SuggestionService");
/**
 * Provides code optimization functionality with comprehensive error handling
 */
var CodeOptimizer = /** @class */ (function () {
    function CodeOptimizer(context) {
        this.disposables = [];
        this.analysisService = new CodeAnalysisService_1.CodeAnalysisService(context);
        this.optimizationService = new OptimizationService_1.OptimizationService(context);
        this.suggestionService = new SuggestionService_1.SuggestionService(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
        this.registerEventHandlers();
    }
    /**
     * Analyzes and optimizes code in the given file
     */
    CodeOptimizer.prototype.optimizeFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.analyzeFile(filePath)];
                    case 1:
                        analysis = _a.sent();
                        return [4 /*yield*/, this.applyOptimizations(filePath, analysis)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError('Failed to optimize file', error_1);
                        return [2 /*return*/, this.createEmptyResult(filePath)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes code for optimization opportunities
     */
    CodeOptimizer.prototype.analyzeFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.analysisService.analyzeFile(filePath)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to analyze file', error_2);
                        return [2 /*return*/, this.createEmptyAnalysis(filePath)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets optimization suggestions without applying them
     */
    CodeOptimizer.prototype.getSuggestions = function (analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.suggestionService.generateSuggestions(analysis)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Failed to generate suggestions', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Applies optimization suggestions to the code
     */
    CodeOptimizer.prototype.applyOptimizations = function (filePath, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSuggestions(analysis)];
                    case 1:
                        suggestions = _a.sent();
                        return [4 /*yield*/, this.optimizationService.applyOptimizations(filePath, suggestions)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        this.handleError('Failed to apply optimizations', error_4);
                        return [2 /*return*/, this.createEmptyResult(filePath)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Shows optimization suggestions in the editor
     */
    CodeOptimizer.prototype.showSuggestionsInEditor = function (editor, suggestions) {
        var _this = this;
        try {
            var decorations = this.suggestionService.createDecorations(suggestions);
            editor.setDecorations(this.suggestionService.getDecorationType(), decorations);
            this.disposables.push({ dispose: function () { return editor.setDecorations(_this.suggestionService.getDecorationType(), []); } });
        }
        catch (error) {
            this.handleError('Failed to show suggestions', error);
        }
    };
    /**
     * Cleans up resources
     */
    CodeOptimizer.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
        this.analysisService.dispose();
        this.optimizationService.dispose();
        this.suggestionService.dispose();
    };
    CodeOptimizer.prototype.registerEventHandlers = function () {
        var _this = this;
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(function (e) { return _this.handleDocumentChange(e); }), vscode.window.onDidChangeActiveTextEditor(function (e) { return _this.handleEditorChange(e); }));
    };
    CodeOptimizer.prototype.handleDocumentChange = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, suggestions, editor, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.shouldOptimize(e.document)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.analyzeFile(e.document.uri.fsPath)];
                    case 1:
                        analysis = _a.sent();
                        return [4 /*yield*/, this.getSuggestions(analysis)];
                    case 2:
                        suggestions = _a.sent();
                        editor = vscode.window.activeTextEditor;
                        if (editor && editor.document === e.document) {
                            this.showSuggestionsInEditor(editor, suggestions);
                        }
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        this.handleError('Failed to handle document change', error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CodeOptimizer.prototype.handleEditorChange = function (editor) {
        var _this = this;
        try {
            if (editor && this.shouldOptimize(editor.document)) {
                this.analyzeFile(editor.document.uri.fsPath)
                    .then(function (analysis) { return _this.getSuggestions(analysis); })
                    .then(function (suggestions) { return _this.showSuggestionsInEditor(editor, suggestions); })
                    .catch(function (error) { return _this.handleError('Failed to handle editor change', error); });
            }
        }
        catch (error) {
            this.handleError('Failed to handle editor change', error);
        }
    };
    CodeOptimizer.prototype.shouldOptimize = function (document) {
        var supportedLanguages = ['typescript', 'javascript', 'python', 'java'];
        return supportedLanguages.includes(document.languageId);
    };
    CodeOptimizer.prototype.createEmptyAnalysis = function (filePath) {
        return {
            filePath: filePath,
            issues: [],
            metrics: {
                complexity: 0,
                maintainability: 0,
                performance: 0
            }
        };
    };
    CodeOptimizer.prototype.createEmptyResult = function (filePath) {
        return {
            filePath: filePath,
            optimizations: [],
            metrics: {
                complexity: 0,
                maintainability: 0,
                performance: 0
            },
            success: false
        };
    };
    CodeOptimizer.prototype.handleError = function (message, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error("CodeOptimizer: ".concat(message), errorMessage);
        vscode.window.showErrorMessage("Code optimization error: ".concat(errorMessage));
    };
    return CodeOptimizer;
}());
exports.CodeOptimizer = CodeOptimizer;
