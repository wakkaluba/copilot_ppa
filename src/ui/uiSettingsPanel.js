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
exports.UISettingsPanel = void 0;
var vscode = require("vscode");
var UISettingsWebviewService_1 = require("./services/UISettingsWebviewService");
var themeManager_1 = require("../services/ui/themeManager");
var logger_1 = require("../utils/logger");
var UISettingsPanel = /** @class */ (function () {
    function UISettingsPanel(context) {
        this.context = context;
        this.disposables = [];
        this.logger = logger_1.Logger.getInstance();
        this.webviewService = new UISettingsWebviewService_1.UISettingsWebviewService(themeManager_1.ThemeService.getInstance());
    }
    UISettingsPanel.getInstance = function (context) {
        if (!UISettingsPanel.instance) {
            UISettingsPanel.instance = new UISettingsPanel(context);
        }
        return UISettingsPanel.instance;
    };
    UISettingsPanel.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tabs;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    if (this.panel) {
                        this.panel.reveal();
                        return [2 /*return*/];
                    }
                    this.panel = vscode.window.createWebviewPanel('uiSettingsPanel', 'Settings', vscode.ViewColumn.One, {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                    });
                    tabs = [
                        {
                            id: 'general',
                            label: 'General',
                            content: this.getGeneralSettingsContent()
                        },
                        {
                            id: 'advanced',
                            label: 'Advanced',
                            content: this.getAdvancedSettingsContent()
                        }
                    ];
                    this.panel.webview.html = this.webviewService.generateWebviewContent(tabs);
                    this.registerMessageHandlers();
                    this.panel.onDidDispose(function () {
                        _this.panel = undefined;
                        _this.dispose();
                    }, null, this.disposables);
                }
                catch (error) {
                    this.logger.error('Error showing UI settings panel', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    UISettingsPanel.prototype.registerMessageHandlers = function () {
        var _this = this;
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = message.command;
                        switch (_a) {
                            case 'tabChanged': return [3 /*break*/, 1];
                            case 'updateSetting': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.handleTabChange(message.tab)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this.handleSettingUpdate(message.key, message.value)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        this.logger.warn("Unknown message command: ".concat(message.command));
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        this.logger.error('Error handling settings panel message', error_1);
                        this.showErrorMessage('Failed to process command');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); }, undefined, this.disposables);
    };
    UISettingsPanel.prototype.selectTab = function (tabName) {
        var _a;
        if (!((_a = this.panel) === null || _a === void 0 ? void 0 : _a.visible)) {
            return;
        }
        try {
            this.panel.webview.postMessage({
                command: 'selectTab',
                tab: tabName
            });
        }
        catch (error) {
            this.logger.error('Error selecting tab', error);
            this.showErrorMessage('Failed to switch tab');
        }
    };
    UISettingsPanel.prototype.showErrorMessage = function (message) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                message: message
            });
        }
    };
    UISettingsPanel.prototype.getGeneralSettingsContent = function () {
        return "\n            <div class=\"setting-group\">\n                <h2>General Settings</h2>\n                <div class=\"setting-item\">\n                    <label for=\"theme\">Theme</label>\n                    <select id=\"theme\">\n                        <option value=\"system\">System Default</option>\n                        <option value=\"light\">Light</option>\n                        <option value=\"dark\">Dark</option>\n                    </select>\n                </div>\n                <div class=\"setting-item\">\n                    <label for=\"language\">Language</label>\n                    <select id=\"language\">\n                        <option value=\"en\">English</option>\n                        <option value=\"es\">Espa\u00F1ol</option>\n                        <option value=\"fr\">Fran\u00E7ais</option>\n                    </select>\n                </div>\n            </div>\n        ";
    };
    UISettingsPanel.prototype.getAdvancedSettingsContent = function () {
        return "\n            <div class=\"setting-group\">\n                <h2>Advanced Settings</h2>\n                <div class=\"setting-item\">\n                    <label for=\"caching\">Enable Caching</label>\n                    <input type=\"checkbox\" id=\"caching\" />\n                </div>\n                <div class=\"setting-item\">\n                    <label for=\"logging\">Logging Level</label>\n                    <select id=\"logging\">\n                        <option value=\"error\">Error</option>\n                        <option value=\"warn\">Warning</option>\n                        <option value=\"info\">Info</option>\n                        <option value=\"debug\">Debug</option>\n                    </select>\n                </div>\n            </div>\n        ";
    };
    UISettingsPanel.prototype.handleTabChange = function (tab) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    UISettingsPanel.prototype.handleSettingUpdate = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    UISettingsPanel.prototype.dispose = function () {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
        UISettingsPanel.instance = undefined;
    };
    return UISettingsPanel;
}());
exports.UISettingsPanel = UISettingsPanel;
