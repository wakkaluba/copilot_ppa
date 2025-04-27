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
exports.SecurityManager = void 0;
var vscode = require("vscode");
var SecurityWebviewService_1 = require("../services/security/SecurityWebviewService");
var SecurityScanService_1 = require("../services/security/SecurityScanService");
var logger_1 = require("../utils/logger");
var SecurityManager = /** @class */ (function () {
    function SecurityManager(context) {
        this.context = context;
        this.disposables = [];
        this.logger = logger_1.Logger.getInstance();
        this.webviewService = new SecurityWebviewService_1.SecurityWebviewService();
        this.scanService = new SecurityScanService_1.SecurityScanService(context);
        // Initialize status bar
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = '$(shield) Security';
        this.statusBarItem.tooltip = 'Run security analysis';
        this.statusBarItem.command = 'copilot-ppa.security.showPanel';
        this.statusBarItem.show();
        this.disposables.push(this.statusBarItem);
        this.registerCommands();
    }
    SecurityManager.getInstance = function (context) {
        if (!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager(context);
        }
        return SecurityManager.instance;
    };
    SecurityManager.prototype.registerCommands = function () {
        var _this = this;
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.security.showPanel', function () {
            _this.show();
        }), vscode.commands.registerCommand('copilot-ppa.security.runScan', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runScan()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }), vscode.commands.registerCommand('copilot-ppa.security.showIssueDetails', function (issueId) {
            _this.showIssueDetails(issueId);
        }));
    };
    SecurityManager.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (this.panel) {
                            this.panel.reveal();
                            return [2 /*return*/];
                        }
                        this.panel = vscode.window.createWebviewPanel('securityPanel', 'Security Analysis', vscode.ViewColumn.Two, {
                            enableScripts: true,
                            retainContextWhenHidden: true,
                            localResourceRoots: [
                                vscode.Uri.joinPath(this.context.extensionUri, 'media')
                            ]
                        });
                        if (!this.panel) return [3 /*break*/, 2];
                        this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview, this.lastResult);
                        this.registerWebviewMessageHandlers();
                        this.panel.onDidDispose(function () {
                            _this.panel = undefined;
                        }, null, this.disposables);
                        if (!!this.lastResult) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.runScan()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('Error showing security panel', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SecurityManager.prototype.registerWebviewMessageHandlers = function () {
        var _this = this;
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var issueId, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        issueId = void 0;
                        _a = message.command;
                        switch (_a) {
                            case 'refresh': return [3 /*break*/, 1];
                            case 'showDetails': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.runScan()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        issueId = message.issueId;
                        return [4 /*yield*/, this.showIssueDetails(issueId)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        this.logger.warn("Unknown command received: ".concat(message.command));
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        this.logger.error('Error handling security panel message', error_2);
                        this.showErrorMessage('Failed to process command');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); }, undefined, this.disposables);
    };
    SecurityManager.prototype.runScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.panel) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: 'Running security analysis...',
                                cancellable: false
                            }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            progress.report({ increment: 0 });
                                            _a = this;
                                            return [4 /*yield*/, this.scanService.runFullScan()];
                                        case 1:
                                            _a.lastResult = _b.sent();
                                            progress.report({ increment: 100 });
                                            this.updateWebviewContent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        this.logger.error('Error running security scan', error_3);
                        this.showErrorMessage('Failed to complete security scan');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SecurityManager.prototype.updateWebviewContent = function () {
        if (!this.panel) {
            return;
        }
        try {
            this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview, this.lastResult);
        }
        catch (error) {
            this.logger.error('Error updating security panel content', error);
            this.showErrorMessage('Failed to update panel content');
        }
    };
    SecurityManager.prototype.showIssueDetails = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var issue, detailedInfo, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.panel || !this.lastResult) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        issue = this.lastResult.issues.find(function (issue) { return issue.id === issueId; });
                        if (!issue) {
                            this.logger.warn("Issue with ID ".concat(issueId, " not found"));
                            this.showErrorMessage("Issue with ID ".concat(issueId, " not found"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.scanService.getIssueDetails(issueId)];
                    case 2:
                        detailedInfo = _a.sent();
                        // Send the detailed information to the webview
                        if (this.panel) {
                            this.panel.webview.postMessage({
                                command: 'showIssueDetails',
                                issue: detailedInfo
                            });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.logger.error("Error showing issue details for ".concat(issueId), error_4);
                        this.showErrorMessage('Failed to retrieve issue details');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SecurityManager.prototype.showErrorMessage = function (message) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                message: message
            });
        }
    };
    SecurityManager.prototype.dispose = function () {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.scanService.dispose();
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return SecurityManager;
}());
exports.SecurityManager = SecurityManager;
