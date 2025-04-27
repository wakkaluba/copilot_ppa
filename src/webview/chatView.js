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
exports.UnifiedChatViewProvider = void 0;
var vscode = require("vscode");
var logger_1 = require("../utils/logger");
var themeManager_1 = require("../services/ui/themeManager");
var UnifiedChatViewProvider = /** @class */ (function () {
    function UnifiedChatViewProvider(extensionUri, chatManager) {
        this.extensionUri = extensionUri;
        this.chatManager = chatManager;
        this.disposables = [];
        this.logger = logger_1.Logger.getInstance();
        this.themeManager = themeManager_1.ThemeManager.getInstance();
        this.setupEventListeners();
    }
    UnifiedChatViewProvider.prototype.resolveWebviewView = function (webviewView, _context, _token) {
        var _this = this;
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        this.initializeWebview();
        this.registerMessageHandlers();
        // Clean up when view is disposed
        webviewView.onDidDispose(function () {
            _this.dispose();
        });
    };
    UnifiedChatViewProvider.prototype.setupEventListeners = function () {
        var _this = this;
        this.disposables.push(this.chatManager.onMessageHandled(function () { return _this.updateMessages(); }), this.chatManager.onHistoryCleared(function () { return _this.updateMessages(); }), this.chatManager.onError(function (event) { return _this.handleError(event); }), this.chatManager.onConnectionStatusChanged(function () { return _this.updateConnectionStatus(); }), this.themeManager.onThemeChanged(function () { return _this.updateTheme(); }));
    };
    UnifiedChatViewProvider.prototype.initializeWebview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.view) {
                            return [2 /*return*/];
                        }
                        if (!!this.currentSession) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.chatManager.createSession()];
                    case 1:
                        _a.currentSession = _b.sent();
                        _b.label = 2;
                    case 2:
                        this.view.webview.html = this.getWebviewContent();
                        this.updateMessages();
                        this.updateConnectionStatus();
                        return [2 /*return*/];
                }
            });
        });
    };
    UnifiedChatViewProvider.prototype.registerMessageHandlers = function () {
        var _this = this;
        if (!this.view) {
            return;
        }
        this.view.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 13]);
                        _a = message.type;
                        switch (_a) {
                            case 'sendMessage': return [3 /*break*/, 1];
                            case 'clearChat': return [3 /*break*/, 3];
                            case 'getMessages': return [3 /*break*/, 5];
                            case 'getConnectionStatus': return [3 /*break*/, 6];
                            case 'copyToClipboard': return [3 /*break*/, 7];
                            case 'createSnippet': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.handleMessage(message.content)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.clearChat()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 5:
                        this.updateMessages();
                        return [3 /*break*/, 11];
                    case 6:
                        this.updateConnectionStatus();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.copyToClipboard(message.text)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.createSnippet(message.code, message.language)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_1 = _b.sent();
                        this.handleError({ error: error_1 });
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        }); });
    };
    UnifiedChatViewProvider.prototype.handleMessage = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!content.trim() || !this.currentSession) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.chatManager.handleUserMessage(this.currentSession.id, content)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UnifiedChatViewProvider.prototype.clearChat = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentSession) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chatManager.clearSessionHistory(this.currentSession.id)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    UnifiedChatViewProvider.prototype.copyToClipboard = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.env.clipboard.writeText(text)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage('Copied to clipboard');
                        return [2 /*return*/];
                }
            });
        });
    };
    UnifiedChatViewProvider.prototype.createSnippet = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement snippet creation
                this.logger.debug('Snippet creation requested', { code: code, language: language });
                return [2 /*return*/];
            });
        });
    };
    UnifiedChatViewProvider.prototype.updateMessages = function () {
        if (!this.view || !this.currentSession) {
            return;
        }
        var messages = this.chatManager.getSessionMessages(this.currentSession.id);
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages: messages
        });
    };
    UnifiedChatViewProvider.prototype.updateConnectionStatus = function () {
        if (!this.view) {
            return;
        }
        var status = this.chatManager.getConnectionStatus();
        this.view.webview.postMessage({
            type: 'updateConnectionStatus',
            status: status
        });
    };
    UnifiedChatViewProvider.prototype.updateTheme = function () {
        if (!this.view) {
            return;
        }
        var theme = this.themeManager.getCurrentTheme();
        this.view.webview.postMessage({
            type: 'updateTheme',
            theme: theme
        });
    };
    UnifiedChatViewProvider.prototype.handleError = function (event) {
        var errorMessage = event.error instanceof Error ?
            event.error.message :
            String(event.error);
        this.logger.error('Chat error occurred', { error: errorMessage });
        vscode.window.showErrorMessage("Chat Error: ".concat(errorMessage));
        if (this.view) {
            this.view.webview.postMessage({
                type: 'showError',
                message: errorMessage
            });
        }
    };
    UnifiedChatViewProvider.prototype.getWebviewContent = function () {
        var cssUri = this.getResourceUri('chat.css');
        var jsUri = this.getResourceUri('chat.js');
        var theme = this.themeManager.getCurrentTheme();
        return "<!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src ".concat(this.view.webview.cspSource, "; script-src ").concat(this.view.webview.cspSource, ";\">\n                <title>Chat</title>\n                <link rel=\"stylesheet\" href=\"").concat(cssUri, "\">\n            </head>\n            <body class=\"theme-").concat(theme, "\">\n                <div id=\"chat-container\">\n                    <div class=\"status-bar\">\n                        <div class=\"connection-status\">\n                            <span class=\"status-dot\"></span>\n                            <span class=\"status-text\">Initializing...</span>\n                        </div>\n                    </div>\n\n                    <div id=\"messages\" class=\"messages\"></div>\n\n                    <div class=\"error-container\" style=\"display: none;\">\n                        <div class=\"error-message\"></div>\n                    </div>\n\n                    <div class=\"input-container\">\n                        <div class=\"toolbar\">\n                            <button id=\"clear-chat\">Clear Chat</button>\n                        </div>\n                        <div class=\"message-input\">\n                            <textarea id=\"message-input\" placeholder=\"Type your message...\" rows=\"3\"></textarea>\n                            <button id=\"send-button\">Send</button>\n                        </div>\n                    </div>\n                </div>\n                <script src=\"").concat(jsUri, "\"></script>\n            </body>\n            </html>");
    };
    UnifiedChatViewProvider.prototype.getResourceUri = function (fileName) {
        var filePath = vscode.Uri.joinPath(this.extensionUri, 'media', fileName);
        return this.view.webview.asWebviewUri(filePath).toString();
    };
    UnifiedChatViewProvider.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables = [];
        this.currentSession = undefined;
    };
    UnifiedChatViewProvider.viewType = 'copilotPPA.chatView';
    return UnifiedChatViewProvider;
}());
exports.UnifiedChatViewProvider = UnifiedChatViewProvider;
