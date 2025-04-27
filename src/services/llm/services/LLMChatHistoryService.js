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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChatHistoryService = void 0;
var events_1 = require("events");
var types_1 = require("../types");
/**
 * Service for managing chat history, persistence, and statistics
 */
var LLMChatHistoryService = /** @class */ (function (_super) {
    __extends(LLMChatHistoryService, _super);
    function LLMChatHistoryService(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.sessions = new Map();
        _this.stats = {
            totalSessions: 0,
            totalMessages: 0,
            averageMessagesPerSession: 0,
            oldestSession: null,
            newestSession: null
        };
        _this.options = __assign({ maxHistory: options.maxHistory || 100, maxMessagesPerSession: options.maxMessagesPerSession || 1000, pruneInterval: options.pruneInterval || 3600000 }, options);
        _this.startPruneInterval();
        return _this;
    }
    /**
     * Save a chat message
     */
    LLMChatHistoryService.prototype.saveMessage = function (sessionId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.sessions.get(sessionId);
                        if (!session) {
                            throw new types_1.ChatError('Session not found', sessionId);
                        }
                        // Check message limit
                        if (session.messages.length >= this.options.maxMessagesPerSession) {
                            throw new types_1.ChatError("Session ".concat(sessionId, " has reached maximum message limit"), sessionId);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.persistMessage(session, message)];
                    case 2:
                        _a.sent();
                        this.updateStats();
                        this.emit(types_1.ChatEvent.HistorySaved, {
                            sessionId: sessionId,
                            messageId: message.id,
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new types_1.ChatError('Failed to save message', sessionId, error_1 instanceof Error ? error_1 : undefined);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save a chat session
     */
    LLMChatHistoryService.prototype.saveSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.persistSession(session)];
                    case 1:
                        _a.sent();
                        this.sessions.set(session.id, session);
                        this.updateStats();
                        this.emit(types_1.ChatEvent.HistorySaved, {
                            sessionId: session.id,
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        throw new types_1.ChatError('Failed to save session', session.id, error_2 instanceof Error ? error_2 : undefined);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load a chat session
     */
    LLMChatHistoryService.prototype.loadSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.retrieveSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (session) {
                            this.sessions.set(sessionId, session);
                            this.emit(types_1.ChatEvent.HistoryLoaded, {
                                sessionId: sessionId,
                                timestamp: new Date()
                            });
                        }
                        return [2 /*return*/, session];
                    case 2:
                        error_3 = _a.sent();
                        throw new types_1.ChatError('Failed to load session', sessionId, error_3 instanceof Error ? error_3 : undefined);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a chat session
     */
    LLMChatHistoryService.prototype.deleteSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.removeSession(sessionId)];
                    case 1:
                        _a.sent();
                        this.sessions.delete(sessionId);
                        this.updateStats();
                        this.emit(types_1.ChatEvent.HistoryDeleted, {
                            sessionId: sessionId,
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        throw new types_1.ChatError('Failed to delete session', sessionId, error_4 instanceof Error ? error_4 : undefined);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export chat history
     */
    LLMChatHistoryService.prototype.exportHistory = function (sessionId_1) {
        return __awaiter(this, arguments, void 0, function (sessionId, format) {
            var session;
            if (format === void 0) { format = 'json'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            throw new types_1.ChatError('Session not found', sessionId);
                        }
                        try {
                            switch (format) {
                                case 'json':
                                    return [2 /*return*/, JSON.stringify(session, null, 2)];
                                case 'text':
                                    return [2 /*return*/, this.formatHistoryAsText(session)];
                                case 'markdown':
                                    return [2 /*return*/, this.formatHistoryAsMarkdown(session)];
                                default:
                                    throw new Error("Unsupported export format: ".concat(format));
                            }
                        }
                        catch (error) {
                            throw new types_1.ChatError('Failed to export history', sessionId, error instanceof Error ? error : undefined);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Import chat history
     */
    LLMChatHistoryService.prototype.importHistory = function (content_1) {
        return __awaiter(this, arguments, void 0, function (content, format) {
            var session, error_5;
            if (format === void 0) { format = 'json'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        session = void 0;
                        switch (format) {
                            case 'json':
                                session = JSON.parse(content);
                                break;
                            case 'text':
                            case 'markdown':
                                session = this.parseHistoryFromText(content);
                                break;
                            default:
                                throw new Error("Unsupported import format: ".concat(format));
                        }
                        // Validate imported session
                        if (!this.validateSession(session)) {
                            throw new Error('Invalid session format');
                        }
                        return [4 /*yield*/, this.saveSession(session)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, session];
                    case 2:
                        error_5 = _a.sent();
                        throw new types_1.ChatError('Failed to import history', undefined, error_5 instanceof Error ? error_5 : undefined);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get chat statistics
     */
    LLMChatHistoryService.prototype.getStats = function () {
        return __assign({}, this.stats);
    };
    /**
     * Clean up old sessions
     */
    LLMChatHistoryService.prototype.pruneHistory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessions, sortedSessions, sessionsToDelete, _i, sessionsToDelete_1, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessions = Array.from(this.sessions.values());
                        sortedSessions = sessions.sort(function (a, b) {
                            var _a, _b;
                            return (((_a = b.metadata.lastMessage) === null || _a === void 0 ? void 0 : _a.timestamp) || 0) -
                                (((_b = a.metadata.lastMessage) === null || _b === void 0 ? void 0 : _b.timestamp) || 0);
                        });
                        sessionsToDelete = sortedSessions.slice(this.options.maxHistory);
                        _i = 0, sessionsToDelete_1 = sessionsToDelete;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sessionsToDelete_1.length)) return [3 /*break*/, 4];
                        session = sessionsToDelete_1[_i];
                        return [4 /*yield*/, this.deleteSession(session.id)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMChatHistoryService.prototype.startPruneInterval = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pruneHistory()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Failed to prune history:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, this.options.pruneInterval);
    };
    LLMChatHistoryService.prototype.persistMessage = function (session, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with storage system
                throw new Error('Not implemented');
            });
        });
    };
    LLMChatHistoryService.prototype.persistSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with storage system
                throw new Error('Not implemented');
            });
        });
    };
    LLMChatHistoryService.prototype.retrieveSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with storage system
                throw new Error('Not implemented');
            });
        });
    };
    LLMChatHistoryService.prototype.removeSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with storage system
                throw new Error('Not implemented');
            });
        });
    };
    LLMChatHistoryService.prototype.formatHistoryAsText = function (session) {
        var text = "Chat Session: ".concat(session.id, "\n");
        text += "Created: ".concat(new Date(session.metadata.createdAt).toISOString(), "\n\n");
        for (var _i = 0, _a = session.messages; _i < _a.length; _i++) {
            var message = _a[_i];
            var timestamp = new Date(message.timestamp).toLocaleTimeString();
            text += "[".concat(timestamp, "] ").concat(message.role, ": ").concat(message.content, "\n\n");
        }
        return text;
    };
    LLMChatHistoryService.prototype.formatHistoryAsMarkdown = function (session) {
        var md = "# Chat Session: ".concat(session.id, "\n\n");
        md += "Created: ".concat(new Date(session.metadata.createdAt).toISOString(), "\n\n");
        for (var _i = 0, _a = session.messages; _i < _a.length; _i++) {
            var message = _a[_i];
            var timestamp = new Date(message.timestamp).toLocaleTimeString();
            md += "### ".concat(message.role, " (").concat(timestamp, ")\n\n");
            md += "".concat(message.content, "\n\n");
        }
        return md;
    };
    LLMChatHistoryService.prototype.parseHistoryFromText = function (content) {
        // This would parse text/markdown format back into a session
        throw new Error('Not implemented');
    };
    LLMChatHistoryService.prototype.validateSession = function (session) {
        return (typeof session === 'object' &&
            typeof session.id === 'string' &&
            Array.isArray(session.messages) &&
            typeof session.metadata === 'object' &&
            typeof session.metadata.createdAt === 'number');
    };
    LLMChatHistoryService.prototype.updateStats = function () {
        this.stats.totalSessions = this.sessions.size;
        this.stats.totalMessages = Array.from(this.sessions.values())
            .reduce(function (total, session) { return total + session.messages.length; }, 0);
        if (this.stats.totalSessions > 0) {
            this.stats.averageMessagesPerSession =
                this.stats.totalMessages / this.stats.totalSessions;
        }
        var sessions = Array.from(this.sessions.values());
        if (sessions.length > 0) {
            var sorted = sessions.sort(function (a, b) { return a.metadata.createdAt - b.metadata.createdAt; });
            this.stats.oldestSession = {
                id: sorted[0].id,
                createdAt: sorted[0].metadata.createdAt
            };
            this.stats.newestSession = {
                id: sorted[sorted.length - 1].id,
                createdAt: sorted[sorted.length - 1].metadata.createdAt
            };
        }
    };
    LLMChatHistoryService.prototype.dispose = function () {
        this.removeAllListeners();
    };
    return LLMChatHistoryService;
}(events_1.EventEmitter));
exports.LLMChatHistoryService = LLMChatHistoryService;
