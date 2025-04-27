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
exports.CopilotIntegrationPanel = void 0;
var vscode = require("vscode");
var CopilotWebviewContentService_1 = require("./services/CopilotWebviewContentService");
var CopilotWebviewStateManager_1 = require("./services/CopilotWebviewStateManager");
var CopilotConnectionManager_1 = require("./services/CopilotConnectionManager");
var CopilotWebviewMessageHandler_1 = require("./services/CopilotWebviewMessageHandler");
var logger_1 = require("../utils/logger");
var themeManager_1 = require("../services/ui/themeManager");
/**
 * Panel that provides a webview interface for Copilot and LLM interactions
 */
var CopilotIntegrationPanel = /** @class */ (function () {
    function CopilotIntegrationPanel(context) {
        this.context = context;
        this.disposables = [];
        this.logger = logger_1.Logger.getInstance();
        this.contentService = new CopilotWebviewContentService_1.CopilotWebviewContentService(themeManager_1.ThemeService.getInstance());
        this.stateManager = new CopilotWebviewStateManager_1.CopilotWebviewStateManager();
        this.connectionManager = new CopilotConnectionManager_1.CopilotConnectionManager();
        this.messageHandler = new CopilotWebviewMessageHandler_1.CopilotWebviewMessageHandler(this.stateManager, this.connectionManager, this.logger);
        this.setupListeners();
    }
    CopilotIntegrationPanel.getInstance = function (context) {
        if (!CopilotIntegrationPanel.instance) {
            CopilotIntegrationPanel.instance = new CopilotIntegrationPanel(context);
        }
        return CopilotIntegrationPanel.instance;
    };
    CopilotIntegrationPanel.prototype.setupListeners = function () {
        var _this = this;
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(function () { return _this.updateWebviewContent(); }), this.stateManager.onStateChanged(function () { return _this.updateWebviewContent(); }), this.connectionManager.onConnectionChanged(function () { return _this.updateWebviewContent(); }));
    };
    CopilotIntegrationPanel.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (this.panel) {
                            this.panel.reveal();
                            return [2 /*return*/];
                        }
                        this.panel = vscode.window.createWebviewPanel('copilotIntegration', 'AI Assistant', vscode.ViewColumn.Two, {
                            enableScripts: true,
                            retainContextWhenHidden: true,
                            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                        });
                        return [4 /*yield*/, this.connectionManager.initialize()];
                    case 1:
                        _a.sent();
                        this.registerWebviewHandlers();
                        this.updateWebviewContent();
                        this.panel.onDidDispose(function () {
                            _this.panel = undefined;
                            _this.dispose();
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error showing Copilot integration panel', error_1);
                        throw this.connectionManager.wrapError('Failed to show integration panel', error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CopilotIntegrationPanel.prototype.registerWebviewHandlers = function () {
        var _this = this;
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.messageHandler.handleMessage(message)];
                    case 1:
                        response = _a.sent();
                        if (response && this.panel) {
                            this.panel.webview.postMessage(response);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error handling webview message', error_2);
                        this.showErrorInWebview(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, undefined, this.disposables);
    };
    CopilotIntegrationPanel.prototype.updateWebviewContent = function () {
        if (!this.panel) {
            return;
        }
        try {
            var stylesUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'copilot-integration.css'));
            this.panel.webview.html = this.contentService.generateWebviewContent(stylesUri, this.stateManager.getState(), this.connectionManager.isConnected(), this.panel.webview);
        }
        catch (error) {
            this.logger.error('Error updating webview content', error);
            this.showErrorInWebview(error);
        }
    };
    CopilotIntegrationPanel.prototype.showErrorInWebview = function (error) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                text: "Error: ".concat(this.connectionManager.getErrorMessage(error))
            });
        }
    };
    CopilotIntegrationPanel.prototype.dispose = function () {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
        this.stateManager.dispose();
        this.connectionManager.dispose();
        this.messageHandler.dispose();
        CopilotIntegrationPanel.instance = undefined;
    };
    return CopilotIntegrationPanel;
}());
exports.CopilotIntegrationPanel = CopilotIntegrationPanel;
