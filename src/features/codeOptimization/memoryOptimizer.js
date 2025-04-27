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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryOptimizer = void 0;
var vscode = require("vscode");
var StaticMemoryAnalyzer_1 = require("./memoryAnalyzer/StaticMemoryAnalyzer");
var LLMMemoryAnalyzer_1 = require("./memoryAnalyzer/LLMMemoryAnalyzer");
var MemoryCacheService_1 = require("./memoryAnalyzer/MemoryCacheService");
var MemoryDiagnosticCollector_1 = require("./memoryAnalyzer/MemoryDiagnosticCollector");
var MemoryReportGenerator_1 = require("./memoryAnalyzer/MemoryReportGenerator");
var MemoryOptimizer = /** @class */ (function () {
    function MemoryOptimizer(context, llmService) {
        this.staticAnalyzer = new StaticMemoryAnalyzer_1.StaticMemoryAnalyzer();
        this.llmAnalyzer = new LLMMemoryAnalyzer_1.LLMMemoryAnalyzer(llmService);
        this.cacheService = new MemoryCacheService_1.MemoryCacheService();
        this.diagnosticCollector = new MemoryDiagnosticCollector_1.MemoryDiagnosticCollector(context);
        this.reportGenerator = new MemoryReportGenerator_1.MemoryReportGenerator(context);
        context.subscriptions.push(vscode.commands.registerCommand('vscode-local-llm-agent.analyzeMemoryUsage', this.analyzeCurrentFile.bind(this)), vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceMemory', this.analyzeWorkspace.bind(this)), vscode.commands.registerCommand('vscode-local-llm-agent.findMemoryLeaks', this.findMemoryLeaks.bind(this)), this.diagnosticCollector);
    }
    MemoryOptimizer.prototype.dispose = function () {
        this.diagnosticCollector.dispose();
        this.cacheService.clear();
    };
    MemoryOptimizer.prototype.analyzeCurrentFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showWarningMessage('No active file to analyze');
                    return [2 /*return*/, []];
                }
                document = editor.document;
                return [2 /*return*/, this.analyzeFile(document.uri)];
            });
        });
    };
    MemoryOptimizer.prototype.analyzeFile = function (fileUri) {
        return __awaiter(this, void 0, void 0, function () {
            var content, cached, issues, staticIssues, llmIssues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(fileUri)];
                    case 1:
                        content = (_a.sent()).getText();
                        cached = this.cacheService.get(content);
                        issues = cached || [];
                        if (!!cached) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.staticAnalyzer.analyze(content)];
                    case 2:
                        staticIssues = _a.sent();
                        return [4 /*yield*/, this.llmAnalyzer.analyze(content)];
                    case 3:
                        llmIssues = _a.sent();
                        issues = __spreadArray(__spreadArray([], staticIssues, true), llmIssues, true);
                        this.cacheService.store(content, issues);
                        _a.label = 4;
                    case 4:
                        this.diagnosticCollector.collect(fileUri, issues);
                        return [2 /*return*/, issues];
                }
            });
        });
    };
    MemoryOptimizer.prototype.analyzeWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceRoot;
            var _this = this;
            return __generator(this, function (_a) {
                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showWarningMessage('No workspace folder open');
                    return [2 /*return*/];
                }
                workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Analyzing workspace memory usage',
                    cancellable: true
                }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                    var files, processedFiles, totalFiles, allIssues, _i, files_1, file, issues;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,c,cpp}', '**/node_modules/**')];
                            case 1:
                                files = _a.sent();
                                processedFiles = 0;
                                totalFiles = files.length;
                                allIssues = [];
                                _i = 0, files_1 = files;
                                _a.label = 2;
                            case 2:
                                if (!(_i < files_1.length)) return [3 /*break*/, 5];
                                file = files_1[_i];
                                if (token.isCancellationRequested) {
                                    return [3 /*break*/, 5];
                                }
                                return [4 /*yield*/, this.analyzeFile(file)];
                            case 3:
                                issues = _a.sent();
                                allIssues = __spreadArray(__spreadArray([], allIssues, true), issues, true);
                                processedFiles++;
                                progress.report({
                                    increment: (100 / totalFiles),
                                    message: "Processed ".concat(processedFiles, " of ").concat(totalFiles, " files")
                                });
                                _a.label = 4;
                            case 4:
                                _i++;
                                return [3 /*break*/, 2];
                            case 5:
                                this.reportGenerator.generate(allIssues);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    MemoryOptimizer.prototype.findMemoryLeaks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, fileUri, issues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showWarningMessage('No active file to analyze');
                            return [2 /*return*/];
                        }
                        fileUri = editor.document.uri;
                        return [4 /*yield*/, this.analyzeFile(fileUri)];
                    case 1:
                        issues = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MemoryOptimizer;
}());
exports.MemoryOptimizer = MemoryOptimizer;
