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
exports.SecurityReportService = void 0;
var vscode = require("vscode");
var SecurityReportHtmlProvider_1 = require("../providers/SecurityReportHtmlProvider");
/**
 * Service for generating and displaying security reports
 */
var SecurityReportService = /** @class */ (function () {
    function SecurityReportService(context) {
        this.context = context;
        this.reportProvider = new SecurityReportHtmlProvider_1.SecurityReportHtmlProvider(context);
    }
    /**
     * Show a report of code security issues
     */
    SecurityReportService.prototype.showCodeIssues = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        panel = this.createReportPanel('Code Security Issues');
                        return [4 /*yield*/, this.reportProvider.updateCodeReport(panel, result)];
                    case 1:
                        _a.sent();
                        this.lastReport = { uri: panel.webview.html, type: 'code' };
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show a dependency vulnerability report
     */
    SecurityReportService.prototype.showDependencyReport = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        panel = this.createReportPanel('Dependency Vulnerabilities');
                        return [4 /*yield*/, this.reportProvider.updateDependencyReport(panel, result)];
                    case 1:
                        _a.sent();
                        this.lastReport = { uri: panel.webview.html, type: 'dependencies' };
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show a filtered list of security issues
     */
    SecurityReportService.prototype.showFilteredIssues = function (issues, issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        panel = this.createReportPanel("Security Issues - ".concat(issueId));
                        return [4 /*yield*/, this.reportProvider.updateFilteredReport(panel, issues)];
                    case 1:
                        _a.sent();
                        this.lastReport = { uri: panel.webview.html, type: 'filtered' };
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show a complete security analysis report
     */
    SecurityReportService.prototype.showFullReport = function (codeResult, dependencyResult, recommendationsResult) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        panel = this.createReportPanel('Security Analysis Report');
                        return [4 /*yield*/, this.reportProvider.updateFullReport(panel, {
                                codeResult: codeResult,
                                dependencyResult: dependencyResult,
                                recommendationsResult: recommendationsResult,
                                timestamp: new Date()
                            })];
                    case 1:
                        _a.sent();
                        this.lastReport = { uri: panel.webview.html, type: 'full' };
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new webview panel for displaying reports
     */
    SecurityReportService.prototype.createReportPanel = function (title) {
        var _this = this;
        var panel = vscode.window.createWebviewPanel('securityReport', title, vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true
        });
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.command;
                        switch (_a) {
                            case 'showIssue': return [3 /*break*/, 1];
                            case 'applyFix': return [3 /*break*/, 3];
                            case 'exportReport': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.showIssueInEditor(message.issue)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, vscode.commands.executeCommand('vscode-local-llm-agent.security.applyFix', message.issue)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.exportReport(message.format)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        return panel;
    };
    /**
     * Show a security issue in the editor
     */
    SecurityReportService.prototype.showIssueInEditor = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var document, editor, range;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(issue.file)];
                    case 1:
                        document = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document)];
                    case 2:
                        editor = _a.sent();
                        range = document.lineAt(issue.line).range;
                        editor.selection = new vscode.Selection(range.start, range.end);
                        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export the current report
     */
    SecurityReportService.prototype.exportReport = function (format) {
        return __awaiter(this, void 0, void 0, function () {
            var filters, uri, _a, _b, _c, _d, _e, error_1;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.lastReport) {
                            return [2 /*return*/];
                        }
                        filters = {
                            'HTML Files': ['html'],
                            'PDF Files': ['pdf'],
                            'Markdown Files': ['md']
                        }["".concat(format.toUpperCase(), " Files")];
                        return [4 /*yield*/, vscode.window.showSaveDialog({
                                filters: (_f = {}, _f[format] = filters, _f)
                            })];
                    case 1:
                        uri = _g.sent();
                        if (!uri) return [3 /*break*/, 6];
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 5, , 6]);
                        _b = (_a = vscode.workspace.fs).writeFile;
                        _c = [uri];
                        _e = (_d = Buffer).from;
                        return [4 /*yield*/, this.reportProvider.exportReport(this.lastReport.type, format)];
                    case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([_e.apply(_d, [_g.sent()])]))];
                    case 4:
                        _g.sent();
                        vscode.window.showInformationMessage("Report exported successfully to ".concat(uri.fsPath));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _g.sent();
                        vscode.window.showErrorMessage("Failed to export report: ".concat(error_1));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SecurityReportService.prototype.dispose = function () {
        this.reportProvider.dispose();
    };
    return SecurityReportService;
}());
exports.SecurityReportService = SecurityReportService;
