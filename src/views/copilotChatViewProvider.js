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
exports.CopilotChatViewProvider = void 0;
var vscode = require("vscode");
var copilotChatIntegration_1 = require("../copilot/copilotChatIntegration");
var logger_1 = require("../utils/logger");
/**
 * Provides a custom view that integrates with Copilot Chat
 */
var CopilotChatViewProvider = /** @class */ (function () {
    function CopilotChatViewProvider(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.copilotChatIntegration = copilotChatIntegration_1.CopilotChatIntegration.getInstance();
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Resolves the webview view
     */
    CopilotChatViewProvider.prototype.resolveWebviewView = function (webviewView, context, _token) {
        return __awaiter(this, void 0, void 0, function () {
            var isInitialized;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._view = webviewView;
                        webviewView.webview.options = {
                            enableScripts: true,
                            localResourceRoots: [this._extensionUri]
                        };
                        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
                        return [4 /*yield*/, this.copilotChatIntegration.initialize()];
                    case 1:
                        isInitialized = _a.sent();
                        this._updateStatus(isInitialized);
                        // Handle messages from the webview
                        webviewView.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, reconnected, isActive;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = message.command;
                                        switch (_a) {
                                            case 'sendMessage': return [3 /*break*/, 1];
                                            case 'reconnect': return [3 /*break*/, 3];
                                            case 'toggleIntegration': return [3 /*break*/, 5];
                                        }
                                        return [3 /*break*/, 6];
                                    case 1: return [4 /*yield*/, this._handleSendMessage(message.text)];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 6];
                                    case 3: return [4 /*yield*/, this.copilotChatIntegration.initialize()];
                                    case 4:
                                        reconnected = _b.sent();
                                        this._updateStatus(reconnected);
                                        return [3 /*break*/, 6];
                                    case 5:
                                        {
                                            isActive = this.copilotChatIntegration.toggleIntegration();
                                            this._updateStatus(isActive);
                                            return [3 /*break*/, 6];
                                        }
                                        _b.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update integration status in the webview
     */
    CopilotChatViewProvider.prototype._updateStatus = function (isActive) {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'updateStatus',
                isActive: isActive
            });
        }
    };
    /**
     * Handle sending a message to Copilot chat
     */
    CopilotChatViewProvider.prototype._handleSendMessage = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var success, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!text.trim()) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.copilotChatIntegration.sendMessageToCopilotChat(text)];
                    case 2:
                        success = _a.sent();
                        if (!success) {
                            if (this._view) {
                                this._view.webview.postMessage({
                                    command: 'showError',
                                    text: 'Failed to send message to Copilot. Check integration status.'
                                });
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('Error sending message to Copilot chat', error_1);
                        if (this._view) {
                            this._view.webview.postMessage({
                                command: 'showError',
                                text: "Error: ".concat(error_1 instanceof Error ? error_1.message : String(error_1))
                            });
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate HTML for the webview
     */
    CopilotChatViewProvider.prototype._getHtmlForWebview = function (webview) {
        // Get path to stylesheet
        var styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <link href=\"".concat(styleUri, "\" rel=\"stylesheet\">\n            <title>Copilot Chat Integration</title>\n            <style>\n                body {\n                    padding: 10px;\n                }\n                .container {\n                    display: flex;\n                    flex-direction: column;\n                    height: 100%;\n                }\n                .status-bar {\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                    margin-bottom: 10px;\n                    padding: 5px;\n                    background-color: var(--vscode-editor-background);\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                }\n                .status-indicator {\n                    display: flex;\n                    align-items: center;\n                }\n                .status-dot {\n                    width: 10px;\n                    height: 10px;\n                    border-radius: 50%;\n                    margin-right: 5px;\n                }\n                .status-active {\n                    background-color: #4CAF50;\n                }\n                .status-inactive {\n                    background-color: #F44336;\n                }\n                .message-container {\n                    flex: 1;\n                    overflow-y: auto;\n                    margin-bottom: 10px;\n                    border: 1px solid var(--vscode-panel-border);\n                    border-radius: 5px;\n                    padding: 10px;\n                }\n                .message {\n                    margin-bottom: 8px;\n                    padding: 8px;\n                    border-radius: 5px;\n                }\n                .message-input {\n                    display: flex;\n                }\n                input {\n                    flex: 1;\n                    padding: 8px;\n                    border: 1px solid var(--vscode-input-border);\n                    border-radius: 5px;\n                    margin-right: 8px;\n                    background-color: var(--vscode-input-background);\n                    color: var(--vscode-input-foreground);\n                }\n                button {\n                    padding: 8px 12px;\n                    background-color: var(--vscode-button-background);\n                    color: var(--vscode-button-foreground);\n                    border: none;\n                    border-radius: 5px;\n                    cursor: pointer;\n                }\n                button:hover {\n                    background-color: var(--vscode-button-hoverBackground);\n                }\n                .error {\n                    color: #F44336;\n                    margin: 5px 0;\n                    font-size: 12px;\n                }\n            </style>\n        </head>\n        <body>\n            <div class=\"container\">\n                <div class=\"status-bar\">\n                    <div class=\"status-indicator\">\n                        <div class=\"status-dot status-inactive\" id=\"statusDot\"></div>\n                        <span id=\"statusText\">Integration Inactive</span>\n                    </div>\n                    <div>\n                        <button id=\"toggleIntegration\">Toggle</button>\n                        <button id=\"reconnectButton\">Reconnect</button>\n                    </div>\n                </div>\n                \n                <div class=\"message-container\" id=\"messageContainer\">\n                    <div class=\"message\">\n                        Welcome to the Copilot Chat Integration. Messages sent from here will appear in the Copilot chat window.\n                    </div>\n                </div>\n                \n                <div id=\"errorContainer\" class=\"error\" style=\"display: none;\"></div>\n                \n                <div class=\"message-input\">\n                    <input type=\"text\" id=\"messageInput\" placeholder=\"Type message to send to Copilot Chat...\" />\n                    <button id=\"sendButton\">Send</button>\n                </div>\n            </div>\n            \n            <script>\n                const vscode = acquireVsCodeApi();\n                const messageInput = document.getElementById('messageInput');\n                const sendButton = document.getElementById('sendButton');\n                const statusDot = document.getElementById('statusDot');\n                const statusText = document.getElementById('statusText');\n                const toggleButton = document.getElementById('toggleIntegration');\n                const reconnectButton = document.getElementById('reconnectButton');\n                const errorContainer = document.getElementById('errorContainer');\n                \n                // Send message\n                function sendMessage() {\n                    const text = messageInput.value.trim();\n                    if (text) {\n                        vscode.postMessage({\n                            command: 'sendMessage',\n                            text: text\n                        });\n                        \n                        // Clear input\n                        messageInput.value = '';\n                    }\n                }\n                \n                // Update status indicator\n                function updateStatus(active) {\n                    if (active) {\n                        statusDot.classList.remove('status-inactive');\n                        statusDot.classList.add('status-active');\n                        statusText.textContent = 'Integration Active';\n                    } else {\n                        statusDot.classList.remove('status-active');\n                        statusDot.classList.add('status-inactive');\n                        statusText.textContent = 'Integration Inactive';\n                    }\n                }\n                \n                // Show error message\n                function showError(message) {\n                    errorContainer.textContent = message;\n                    errorContainer.style.display = 'block';\n                    setTimeout(() => {\n                        errorContainer.style.display = 'none';\n                    }, 5000);\n                }\n                \n                // Event listeners\n                sendButton.addEventListener('click', sendMessage);\n                \n                messageInput.addEventListener('keypress', (e) => {\n                    if (e.key === 'Enter') {\n                        sendMessage();\n                    }\n                });\n                \n                toggleButton.addEventListener('click', () => {\n                    vscode.postMessage({\n                        command: 'toggleIntegration'\n                    });\n                });\n                \n                reconnectButton.addEventListener('click', () => {\n                    vscode.postMessage({\n                        command: 'reconnect'\n                    });\n                });\n                \n                // Handle messages from extension\n                window.addEventListener('message', event => {\n                    const message = event.data;\n                    \n                    switch (message.command) {\n                        case 'updateStatus':\n                            updateStatus(message.isActive);\n                            break;\n                            \n                        case 'showError':\n                            showError(message.text);\n                            break;\n                    }\n                });\n            </script>\n        </body>\n        </html>");
    };
    CopilotChatViewProvider.viewType = 'localLlmAgent.copilotChatView';
    return CopilotChatViewProvider;
}());
exports.CopilotChatViewProvider = CopilotChatViewProvider;
