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
exports.EnhancedChatProvider = void 0;
var vscode = require("vscode");
var uuid_1 = require("uuid");
var EnhancedChatProvider = /** @class */ (function () {
    function EnhancedChatProvider(context, contextManager, llmProvider) {
        this.isStreaming = false;
        this.offlineCache = new Map();
        this.maxRetries = 3;
        this.contextManager = contextManager;
        this.llmProvider = llmProvider;
    }
    EnhancedChatProvider.prototype.setWebview = function (view) {
        var _this = this;
        this.view = view;
        // Handle webview messages
        this.view.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.type;
                        switch (_a) {
                            case 'sendMessage': return [3 /*break*/, 1];
                            case 'clearChat': return [3 /*break*/, 3];
                            case 'getMessages': return [3 /*break*/, 5];
                            case 'getConnectionStatus': return [3 /*break*/, 6];
                            case 'connectLlm': return [3 /*break*/, 7];
                            case 'copyToClipboard': return [3 /*break*/, 9];
                            case 'createSnippet': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.handleUserMessage(message.message)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 3: return [4 /*yield*/, this.clearHistory()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 5:
                        this.sendMessagesToWebview();
                        return [3 /*break*/, 13];
                    case 6:
                        this.updateConnectionStatus();
                        return [3 /*break*/, 13];
                    case 7: return [4 /*yield*/, this.llmProvider.connect()];
                    case 8:
                        _b.sent();
                        this.updateConnectionStatus();
                        return [3 /*break*/, 13];
                    case 9: return [4 /*yield*/, vscode.env.clipboard.writeText(message.text)];
                    case 10:
                        _b.sent();
                        vscode.window.showInformationMessage('Copied to clipboard');
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, this.createCodeSnippet(message.code, message.language)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        }); });
        // Initial render
        this.renderChatInterface();
    };
    EnhancedChatProvider.prototype.renderChatInterface = function () {
        if (!this.view) {
            return;
        }
        this.sendMessagesToWebview();
        this.updateConnectionStatus();
    };
    EnhancedChatProvider.prototype.sendMessagesToWebview = function () {
        if (!this.view) {
            return;
        }
        var messages = this.contextManager.listMessages();
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages: messages
        });
    };
    EnhancedChatProvider.prototype.updateConnectionStatus = function () {
        if (!this.view) {
            return;
        }
        var isConnected = this.llmProvider.isConnected();
        var status = {
            state: isConnected ? 'connected' : 'disconnected',
            message: isConnected ? 'Connected to LLM' : 'Not connected to LLM',
            isInputDisabled: !isConnected
        };
        this.view.webview.postMessage({
            type: 'updateConnectionStatus',
            status: status
        });
    };
    EnhancedChatProvider.prototype.handleUserMessage = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var userMessage, retryCount, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!content.trim()) {
                            return [2 /*return*/];
                        }
                        userMessage = {
                            id: (0, uuid_1.v4)(),
                            role: 'user',
                            content: content,
                            timestamp: new Date()
                        };
                        this.contextManager.appendMessage(userMessage);
                        this.sendMessagesToWebview();
                        if (!!this.llmProvider.isConnected()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleOfflineMode(userMessage)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        retryCount = 0;
                        _a.label = 3;
                    case 3:
                        if (!(retryCount < this.maxRetries)) return [3 /*break*/, 12];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 11]);
                        return [4 /*yield*/, this.generateStreamingResponse(userMessage)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 6:
                        error_1 = _a.sent();
                        retryCount++;
                        if (!(retryCount === this.maxRetries)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.handleError(error_1)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.waitBeforeRetry(retryCount)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 3];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    EnhancedChatProvider.prototype.generateStreamingResponse = function (userMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var currentResponse, context_1, assistantMessage;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isStreaming = true;
                        this.updateStatus('Thinking...');
                        currentResponse = '';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        context_1 = this.contextManager.getContextString();
                        return [4 /*yield*/, this.llmProvider.streamCompletion(userMessage.content, { context: context_1 }, function (event) {
                                currentResponse += event.content;
                                _this.updateStreamingContent(currentResponse);
                            })];
                    case 2:
                        _a.sent();
                        assistantMessage = {
                            id: (0, uuid_1.v4)(),
                            role: 'assistant',
                            content: currentResponse,
                            timestamp: new Date()
                        };
                        this.contextManager.appendMessage(assistantMessage);
                        this.sendMessagesToWebview();
                        return [3 /*break*/, 4];
                    case 3:
                        this.isStreaming = false;
                        this.updateStatus('');
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EnhancedChatProvider.prototype.handleOfflineMode = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, cachedMessages, offlineMessage;
            return __generator(this, function (_a) {
                conversationId = this.contextManager.getCurrentConversationId();
                cachedMessages = this.offlineCache.get(conversationId) || [];
                cachedMessages.push(message);
                this.offlineCache.set(conversationId, cachedMessages);
                offlineMessage = {
                    id: (0, uuid_1.v4)(),
                    role: 'system',
                    content: 'Currently offline. Message saved and will be processed when connection is restored.',
                    timestamp: new Date()
                };
                this.contextManager.appendMessage(offlineMessage);
                this.sendMessagesToWebview();
                return [2 /*return*/];
            });
        });
    };
    EnhancedChatProvider.prototype.handleError = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var errorMessage, errorResponse;
            return __generator(this, function (_a) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errorResponse = {
                    id: (0, uuid_1.v4)(),
                    role: 'system',
                    content: "Error: ".concat(errorMessage, "\nPlease try again or check your connection."),
                    timestamp: new Date()
                };
                this.contextManager.appendMessage(errorResponse);
                this.sendMessagesToWebview();
                this.updateStatus('');
                vscode.window.showErrorMessage("Chat Error: ".concat(errorMessage));
                return [2 /*return*/];
            });
        });
    };
    EnhancedChatProvider.prototype.waitBeforeRetry = function (retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EnhancedChatProvider.prototype.updateStreamingContent = function (content) {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'updateStreamingContent',
            content: content
        });
    };
    EnhancedChatProvider.prototype.syncOfflineMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, cachedMessages, _i, cachedMessages_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.llmProvider.isConnected()) {
                            return [2 /*return*/];
                        }
                        conversationId = this.contextManager.getCurrentConversationId();
                        cachedMessages = this.offlineCache.get(conversationId) || [];
                        if (cachedMessages.length === 0) {
                            return [2 /*return*/];
                        }
                        _i = 0, cachedMessages_1 = cachedMessages;
                        _a.label = 1;
                    case 1:
                        if (!(_i < cachedMessages_1.length)) return [3 /*break*/, 4];
                        message = cachedMessages_1[_i];
                        return [4 /*yield*/, this.generateStreamingResponse(message)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.offlineCache.delete(conversationId);
                        return [2 /*return*/];
                }
            });
        });
    };
    EnhancedChatProvider.prototype.updateStatus = function (status) {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'updateStatus',
            status: status
        });
    };
    EnhancedChatProvider.prototype.createCodeSnippet = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            var snippet, doc, editor, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        snippet = new vscode.SnippetString(code);
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                language: language || 'text',
                                content: ''
                            })];
                    case 1:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 2:
                        editor = _a.sent();
                        return [4 /*yield*/, editor.insertSnippet(snippet)];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage('Code snippet created');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        vscode.window.showErrorMessage("Failed to create snippet: ".concat(errorMessage));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EnhancedChatProvider.prototype.clearHistory = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contextManager.clear()];
                    case 1:
                        _a.sent();
                        this.sendMessagesToWebview();
                        return [2 /*return*/];
                }
            });
        });
    };
    EnhancedChatProvider.prototype.dispose = function () {
        // Cleanup
    };
    return EnhancedChatProvider;
}());
exports.EnhancedChatProvider = EnhancedChatProvider;
