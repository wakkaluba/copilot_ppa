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
exports.CodeSecurityScanner = void 0;
var vscode = require("vscode");
var SecurityPatternService_1 = require("./services/SecurityPatternService");
var SecurityAnalyzerService_1 = require("./services/SecurityAnalyzerService");
var SecurityDiagnosticService_1 = require("./services/SecurityDiagnosticService");
var SecurityFixService_1 = require("./services/SecurityFixService");
var SecurityReportHtmlProvider_1 = require("../providers/SecurityReportHtmlProvider");
/**
 * Class responsible for scanning code for potential security issues
 */
var CodeSecurityScanner = /** @class */ (function () {
    function CodeSecurityScanner(context) {
        this.disposables = [];
        this.webviewMap = new Map();
        this.messageQueue = [];
        this.isProcessing = false;
        this.issueCache = new Map();
        this.patternService = new SecurityPatternService_1.SecurityPatternService();
        this.analyzerService = new SecurityAnalyzerService_1.SecurityAnalyzerService(this.patternService);
        this.diagnosticService = new SecurityDiagnosticService_1.SecurityDiagnosticService(context);
        this.fixService = new SecurityFixService_1.SecurityFixService(context);
    }
    CodeSecurityScanner.prototype.scanActiveFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return [2 /*return*/, { issues: [], scannedFiles: 0 }];
                }
                return [2 /*return*/, this.scanFile(editor.document.uri)];
            });
        });
    };
    CodeSecurityScanner.prototype.scanFile = function (fileUri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(fileUri)];
                    case 1:
                        document = _a.sent();
                        return [4 /*yield*/, this.analyzerService.scanDocument(document)];
                    case 2:
                        result = _a.sent();
                        this.diagnosticService.report(fileUri, result.diagnostics);
                        // Cache the issues for later retrieval
                        result.issues.forEach(function (issue) {
                            _this.issueCache.set(issue.id, issue);
                        });
                        return [2 /*return*/, { issues: result.issues, scannedFiles: 1 }];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.scanWorkspace = function (progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzerService.scanWorkspace(progressCallback)];
                    case 1:
                        result = _a.sent();
                        // Cache the issues for later retrieval
                        result.issues.forEach(function (issue) {
                            _this.issueCache.set(issue.id, issue);
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get detailed information about a specific security issue
     * @param issueId The ID of the issue to retrieve details for
     * @returns The security issue details, or undefined if not found
     */
    CodeSecurityScanner.prototype.getIssueDetails = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.issueCache.get(issueId)];
            });
        });
    };
    CodeSecurityScanner.prototype.showSecurityReport = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            return __generator(this, function (_a) {
                panel = vscode.window.createWebviewPanel('securityIssuesReport', 'Code Security Issues Report', vscode.ViewColumn.One, { enableScripts: true });
                panel.webview.html = SecurityReportHtmlProvider_1.SecurityReportHtmlProvider.getHtml(result);
                return [2 /*return*/];
            });
        });
    };
    CodeSecurityScanner.prototype.registerWebview = function (id, webview) {
        var _this = this;
        this.webviewMap.set(id, webview);
        var disposable = webview.onDidReceiveMessage(function (message) { return _this.handleWebviewMessage(webview, message); }, undefined, this.disposables);
        this.disposables.push(disposable);
    };
    CodeSecurityScanner.prototype.unregisterWebview = function (id) {
        this.webviewMap.delete(id);
    };
    CodeSecurityScanner.prototype.handleWebviewMessage = function (webview, message) {
        var _this = this;
        this.messageQueue.push(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, document_1, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = message.command;
                        switch (_a) {
                            case 'openFile': return [3 /*break*/, 1];
                            case 'fixIssue': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 1: return [4 /*yield*/, vscode.workspace.openTextDocument(message.path)];
                    case 2:
                        document_1 = _b.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.fixService.applyFix(message.issueId, message.path)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        console.error('Error handling webview message:', error_1);
                        vscode.window.showErrorMessage("Error: ".concat(error_1));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        this.processMessageQueue();
    };
    CodeSecurityScanner.prototype.processMessageQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var handler, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isProcessing) {
                            return [2 /*return*/];
                        }
                        this.isProcessing = true;
                        _a.label = 1;
                    case 1:
                        if (!(this.messageQueue.length > 0)) return [3 /*break*/, 6];
                        handler = this.messageQueue.shift();
                        if (!handler) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, handler()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error processing message:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6:
                        this.isProcessing = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.dispose = function () {
        this.diagnosticService.dispose();
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
        this.webviewMap.clear();
        this.messageQueue = [];
        this.isProcessing = false;
        this.issueCache.clear();
    };
    return CodeSecurityScanner;
}());
exports.CodeSecurityScanner = CodeSecurityScanner;
