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
exports.RepositoryPanel = void 0;
var vscode = require("vscode");
var RepositoryWebviewService_1 = require("./services/RepositoryWebviewService");
var themeManager_1 = require("../services/ui/themeManager");
var logger_1 = require("../utils/logger");
var RepositoryPanel = /** @class */ (function () {
    function RepositoryPanel(context) {
        this.context = context;
        this.disposables = [];
        this.logger = logger_1.Logger.getInstance();
        this.webviewService = new RepositoryWebviewService_1.RepositoryWebviewService(themeManager_1.ThemeService.getInstance());
    }
    RepositoryPanel.getInstance = function (context) {
        if (!RepositoryPanel.instance) {
            RepositoryPanel.instance = new RepositoryPanel(context);
        }
        return RepositoryPanel.instance;
    };
    RepositoryPanel.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    if (this.panel) {
                        this.panel.reveal();
                        return [2 /*return*/];
                    }
                    this.panel = vscode.window.createWebviewPanel('repositoryPanel', 'Repository', vscode.ViewColumn.Three, {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                    });
                    this.updateWebviewContent();
                    this.registerMessageHandlers();
                    this.panel.onDidDispose(function () {
                        _this.panel = undefined;
                        _this.dispose();
                    }, null, this.disposables);
                }
                catch (error) {
                    this.logger.error('Error showing repository panel', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    RepositoryPanel.prototype.updateWebviewContent = function () {
        if (!this.panel) {
            return;
        }
        try {
            this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview);
        }
        catch (error) {
            this.logger.error('Error updating repository panel content', error);
            this.showErrorInWebview('Failed to update panel content');
        }
    };
    RepositoryPanel.prototype.registerMessageHandlers = function () {
        var _this = this;
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        _a = message.command;
                        switch (_a) {
                            case 'refreshRepository': return [3 /*break*/, 1];
                            case 'showBranches': return [3 /*break*/, 3];
                            case 'showCommits': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.refreshRepository()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 3: return [4 /*yield*/, this.showBranches()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, this.showCommits()];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        this.logger.warn("Unknown command received: ".concat(message.command));
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _b.sent();
                        this.logger.error('Error handling repository panel message', error_1);
                        this.showErrorInWebview('Failed to process command');
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); }, undefined, this.disposables);
    };
    RepositoryPanel.prototype.refreshRepository = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RepositoryPanel.prototype.showBranches = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RepositoryPanel.prototype.showCommits = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RepositoryPanel.prototype.showErrorInWebview = function (message) {
        if (this.panel) {
            this.panel.webview.postMessage({
                type: 'showError',
                message: message
            });
        }
    };
    RepositoryPanel.prototype.dispose = function () {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
        RepositoryPanel.instance = undefined;
    };
    return RepositoryPanel;
}());
exports.RepositoryPanel = RepositoryPanel;
