"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.LLMChatManager = void 0;
var events_1 = require("events");
var types_1 = require("../types");
/**
 * Manages chat sessions, messages, and conversation flow
 */
var LLMChatManager = /** @class */ (function (_super) {
    __extends(LLMChatManager, _super);
    function LLMChatManager(executionService, historyService) {
        var _this = _super.call(this) || this;
        _this.activeSessions = new Map();
        _this.metrics = {
            totalSessions: 0,
            activeSessions: 0,
            totalMessages: 0,
            averageResponseTime: 0,
            errorRate: 0
        };
        _this.executionService = executionService;
        _this.historyService = historyService;
        _this.setupEventListeners();
        return _this;
    }
    LLMChatManager.prototype.setupEventListeners = function () {
        this.historyService.on(types_1.ChatEvent.HistoryLoaded, this.handleHistoryLoaded.bind(this));
        this.historyService.on(types_1.ChatEvent.HistorySaved, this.handleHistorySaved.bind(this));
    };
    /**
     * Create a new chat session
     */
    LLMChatManager.prototype.createSession = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var session;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                session = {
                    id: crypto.randomUUID(),
                    state: types_1.ChatState.Active,
                    messages: [],
                    context: options.context || {},
                    metadata: {
                        createdAt: Date.now(),
                        lastMessage: null,
                        messageCount: 0
                    }
                };
                this.activeSessions.set(session.id, session);
                this.metrics.totalSessions++;
                this.metrics.activeSessions++;
                this.emit(types_1.ChatEvent.SessionCreated, {
                    sessionId: session.id,
                    timestamp: new Date()
                });
                return [2 /*return*/, session];
            });
        });
    };
    /**
     * Send a message in a chat session
     */
    LLMChatManager.prototype.sendMessage = function (sessionId_1, content_1) {
        return __awaiter(this, arguments, void 0, function (sessionId, content, options) {
            var session, message, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.activeSessions.get(sessionId);
                        if (!session) {
                            throw new types_1.ChatError('Session not found', sessionId);
                        }
                        message = {
                            id: crypto.randomUUID(),
                            role: options.role || types_1.ChatRole.User,
                            content: content,
                            timestamp: new Date(),
                            metadata: {}
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // Add message to session
                        session.messages.push(message);
                        session.metadata.lastMessage = message;
                        session.metadata.messageCount++;
                        this.metrics.totalMessages++;
                        this.emit(types_1.ChatEvent.MessageSent, {
                            sessionId: sessionId,
                            messageId: message.id,
                            timestamp: message.timestamp
                        });
                        if (!(message.role === types_1.ChatRole.User)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.sendRequest(session, content)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: 
                    // Save history
                    return [4 /*yield*/, this.historyService.saveMessage(sessionId, message)];
                    case 4:
                        // Save history
                        _a.sent();
                        return [2 /*return*/, message];
                    case 5:
                        error_1 = _a.sent();
                        this.handleChatError(session, error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    LLMChatManager.prototype.sendRequest = function (session, content) {
        return __awaiter(this, void 0, void 0, function () {
            var options, response, error_2, chatError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        session.metadata['requestStartTime'] = Date.now();
                        options = {
                            metadata: {
                                chatSessionId: session.id
                            }
                        };
                        return [4 /*yield*/, this.executionService.execute(content, options)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(session, response)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        chatError = error_2 instanceof Error ?
                            new types_1.ChatError('Failed to get response', session.id, error_2) :
                            new types_1.ChatError('Failed to get response', session.id);
                        session.metadata['errorCount'] = (session.metadata['errorCount'] || 0) + 1;
                        session.metadata['lastError'] = chatError;
                        throw chatError;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMChatManager.prototype.handleResponse = function (session, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseTime, message;
            var _a, _b;
            return __generator(this, function (_c) {
                responseTime = Date.now() - session.metadata['requestStartTime'];
                message = {
                    id: crypto.randomUUID(),
                    role: types_1.ChatRole.Assistant,
                    content: response.content,
                    timestamp: new Date(),
                    metadata: {
                        responseTime: responseTime,
                        tokenCount: (_b = (_a = response.usage) === null || _a === void 0 ? void 0 : _a.totalTokens) !== null && _b !== void 0 ? _b : null
                    }
                };
                session.messages.push(message);
                session.metadata.lastMessage = message;
                session.metadata.messageCount++;
                this.emit(types_1.ChatEvent.MessageHandled, {
                    sessionId: session.id,
                    message: message
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * End a chat session
     */
    LLMChatManager.prototype.endSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.activeSessions.get(sessionId);
                        if (!session) {
                            return [2 /*return*/];
                        }
                        session.state = types_1.ChatState.Ended;
                        session.metadata.endedAt = Date.now();
                        return [4 /*yield*/, this.historyService.saveSession(session)];
                    case 1:
                        _a.sent();
                        this.activeSessions.delete(sessionId);
                        this.metrics.activeSessions--;
                        this.emit(types_1.ChatEvent.SessionEnded, {
                            sessionId: sessionId,
                            timestamp: new Date()
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resume a previous chat session
     */
    LLMChatManager.prototype.resumeSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.historyService.loadSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            throw new types_1.ChatError('Session not found', sessionId);
                        }
                        session.state = types_1.ChatState.Active;
                        this.activeSessions.set(sessionId, session);
                        this.metrics.activeSessions++;
                        this.emit(types_1.ChatEvent.SessionResumed, {
                            sessionId: sessionId,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, session];
                }
            });
        });
    };
    /**
     * Get session messages
     */
    LLMChatManager.prototype.getSessionMessages = function (sessionId) {
        var session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new types_1.ChatError('Session not found', sessionId);
        }
        return __spreadArray([], session.messages, true);
    };
    /**
     * Get active sessions
     */
    LLMChatManager.prototype.getActiveSessions = function () {
        return Array.from(this.activeSessions.values());
    };
    /**
     * Get chat metrics
     */
    LLMChatManager.prototype.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    LLMChatManager.prototype.handleHistoryLoaded = function (event) {
        this.emit(types_1.ChatEvent.HistoryLoaded, event);
    };
    LLMChatManager.prototype.handleHistorySaved = function (event) {
        this.emit(types_1.ChatEvent.HistorySaved, event);
    };
    LLMChatManager.prototype.handleChatError = function (session, error) {
        session.metadata.errorCount = (session.metadata.errorCount || 0) + 1;
        session.metadata.lastError = error instanceof Error ? error : new Error(String(error));
        this.emit(types_1.ChatEvent.Error, {
            sessionId: session.id,
            error: session.metadata.lastError,
            timestamp: new Date()
        });
    };
    LLMChatManager.prototype.dispose = function () {
        // End all active sessions
        for (var _i = 0, _a = this.activeSessions.keys(); _i < _a.length; _i++) {
            var sessionId = _a[_i];
            this.endSession(sessionId).catch(console.error);
        }
        this.activeSessions.clear();
        this.removeAllListeners();
    };
    /**
     * Handle incoming user message
     */
    LLMChatManager.prototype.handleUserMessage = function (sessionId, content) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!content.trim()) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.sendMessage(sessionId, content)];
                    case 1:
                        message = _a.sent();
                        this.emit(types_1.ChatEvent.MessageHandled, {
                            sessionId: sessionId,
                            messageId: message.id,
                            timestamp: new Date()
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear chat history for a session
     */
    LLMChatManager.prototype.clearSessionHistory = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.activeSessions.get(sessionId);
                        if (!session) {
                            throw new types_1.ChatError('Session not found', sessionId);
                        }
                        session.messages = [];
                        session.metadata.messageCount = 0;
                        return [4 /*yield*/, this.historyService.saveSession(session)];
                    case 1:
                        _a.sent();
                        this.emit(types_1.ChatEvent.HistoryCleared, {
                            sessionId: sessionId,
                            timestamp: new Date()
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get connection status
     */
    LLMChatManager.prototype.getConnectionStatus = function () {
        var isConnected = this.executionService.isConnected();
        return {
            isConnected: isConnected,
            status: isConnected ? 'Connected' : 'Disconnected'
        };
    };
    return LLMChatManager;
}(events_1.EventEmitter));
exports.LLMChatManager = LLMChatManager;
