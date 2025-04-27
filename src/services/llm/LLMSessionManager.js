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
exports.LLMSessionManager = void 0;
var events_1 = require("events");
var uuid_1 = require("uuid");
var LLMConnectionManager_1 = require("./LLMConnectionManager");
var LLMSessionManager = /** @class */ (function (_super) {
    __extends(LLMSessionManager, _super);
    function LLMSessionManager(connectionManager, hostManager) {
        var _this = _super.call(this) || this;
        _this.sessions = new Map();
        _this.sessionTimeout = 3600000; // 1 hour
        _this.connectionManager = connectionManager;
        _this.hostManager = hostManager;
        // Listen for connection status changes
        _this.connectionManager.on('statusChanged', function (event) {
            if (event.status === LLMConnectionManager_1.ConnectionStatus.Disconnected && _this.activeSessionId) {
                _this.deactivateSession(_this.activeSessionId);
            }
        });
        // Start session cleanup
        _this.startSessionCleanup();
        return _this;
    }
    /**
     * Create a new LLM session
     * @param config Session configuration
     * @returns The created session
     */
    LLMSessionManager.prototype.createSession = function (config) {
        var id = (0, uuid_1.v4)();
        var now = Date.now();
        var session = {
            id: id,
            config: config,
            state: {
                id: id,
                active: false,
                startTime: now,
                lastActivity: now,
                requestCount: 0,
                tokenCount: 0,
                model: config.model,
                provider: config.provider
            },
            createdAt: now,
            messages: []
        };
        this.sessions.set(id, session);
        this.emit('sessionCreated', session);
        return session;
    };
    /**
     * Get a session by ID
     * @param id Session ID
     * @returns The session or undefined if not found
     */
    LLMSessionManager.prototype.getSession = function (id) {
        return this.sessions.get(id);
    };
    /**
     * Get all active sessions
     * @returns Array of active sessions
     */
    LLMSessionManager.prototype.getAllSessions = function () {
        return Array.from(this.sessions.values());
    };
    /**
     * Get the current active session
     * @returns The active session or undefined if none is active
     */
    LLMSessionManager.prototype.getActiveSession = function () {
        if (!this.activeSessionId) {
            return undefined;
        }
        return this.sessions.get(this.activeSessionId);
    };
    /**
     * Activate a session
     * @param id Session ID to activate
     * @returns True if the session was activated
     */
    LLMSessionManager.prototype.activateSession = function (id) {
        var session = this.sessions.get(id);
        if (!session) {
            return false;
        }
        // Deactivate current active session if any
        if (this.activeSessionId && this.activeSessionId !== id) {
            this.deactivateSession(this.activeSessionId);
        }
        // Set as active
        this.activeSessionId = id;
        session.state.active = true;
        this.emit('sessionActivated', session);
        return true;
    };
    /**
     * Deactivate a session
     * @param id Session ID to deactivate
     * @returns True if the session was deactivated
     */
    LLMSessionManager.prototype.deactivateSession = function (id) {
        var session = this.sessions.get(id);
        if (!session) {
            return false;
        }
        session.state.active = false;
        if (this.activeSessionId === id) {
            this.activeSessionId = undefined;
        }
        this.emit('sessionDeactivated', session);
        return true;
    };
    /**
     * Close and remove a session
     * @param id Session ID to close
     * @returns True if the session was closed
     */
    LLMSessionManager.prototype.closeSession = function (id) {
        if (!this.sessions.has(id)) {
            return false;
        }
        if (this.activeSessionId === id) {
            this.activeSessionId = undefined;
        }
        var session = this.sessions.get(id);
        this.sessions.delete(id);
        this.emit('sessionClosed', session);
        return true;
    };
    /**
     * Update a session's configuration
     * @param id Session ID to update
     * @param config New session configuration
     * @returns Updated session or undefined if not found
     */
    LLMSessionManager.prototype.updateSessionConfig = function (id, config) {
        var session = this.sessions.get(id);
        if (!session) {
            return undefined;
        }
        session.config = __assign(__assign({}, session.config), config);
        // Update state if model or provider changed
        if (config.model) {
            session.state.model = config.model;
        }
        if (config.provider) {
            session.state.provider = config.provider;
        }
        this.emit('sessionUpdated', session);
        return session;
    };
    /**
     * Send a prompt to the LLM using the active session
     * @param prompt The prompt to send
     * @returns Promise resolving to the LLM response
     */
    LLMSessionManager.prototype.sendPrompt = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.activeSessionId) {
                    throw new Error('No active session');
                }
                return [2 /*return*/, this.sendPromptWithSession(this.activeSessionId, prompt)];
            });
        });
    };
    /**
     * Send a prompt using a specific session
     * @param sessionId Session ID to use
     * @param prompt The prompt to send
     * @returns Promise resolving to the LLM response
     */
    LLMSessionManager.prototype.sendPromptWithSession = function (sessionId, prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var session, provider, request, response, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.sessions.get(sessionId);
                        if (!session) {
                            throw new Error("Session with ID ".concat(sessionId, " not found"));
                        }
                        if (this.connectionManager.getConnectionStatus() !== LLMConnectionManager_1.ConnectionStatus.Connected) {
                            throw new Error('LLM provider is not connected');
                        }
                        provider = this.connectionManager.getProvider();
                        if (!provider) {
                            throw new Error('No LLM provider available');
                        }
                        // Update session activity timestamp
                        session.state.lastActivity = Date.now();
                        session.state.requestCount++;
                        request = {
                            id: (0, uuid_1.v4)(),
                            prompt: prompt,
                            model: session.config.model,
                            options: session.config.parameters,
                            priority: 'normal', // Default priority
                            timestamp: new Date(),
                            status: 'pending'
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, provider.completePrompt(request)];
                    case 2:
                        response = _a.sent();
                        // Record message
                        session.messages.push({
                            prompt: prompt,
                            response: response.content,
                            timestamp: new Date()
                        });
                        // Update token count if available
                        if (response.tokenUsage) {
                            session.state.tokenCount += response.tokenUsage.totalTokens;
                        }
                        this.emit('promptCompleted', { sessionId: sessionId, request: request, response: response });
                        return [2 /*return*/, response];
                    case 3:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.emit('promptFailed', {
                            sessionId: sessionId,
                            request: request,
                            error: new Error("Failed to complete prompt: ".concat(errorMessage))
                        });
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear message history for a session
     * @param id Session ID
     * @returns True if history was cleared
     */
    LLMSessionManager.prototype.clearSessionHistory = function (id) {
        var session = this.sessions.get(id);
        if (!session) {
            return false;
        }
        session.messages = [];
        this.emit('historyCleared', id);
        return true;
    };
    /**
     * Get session statistics
     * @param id Session ID
     * @returns Session statistics or undefined if session not found
     */
    LLMSessionManager.prototype.getSessionStats = function (id) {
        var session = this.sessions.get(id);
        if (!session) {
            return undefined;
        }
        var errorCount = session.messages.filter(function (m) { return !m.response; }).length;
        var totalRequests = session.state.requestCount;
        var errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
        // Calculate average response time
        var totalResponseTime = 0;
        var responseTimes = 0;
        for (var i = 1; i < session.messages.length; i++) {
            if (session.messages[i].response) {
                totalResponseTime += session.messages[i].timestamp - session.messages[i - 1].timestamp;
                responseTimes++;
            }
        }
        var averageResponseTime = responseTimes > 0
            ? totalResponseTime / responseTimes
            : 0;
        return {
            totalRequests: totalRequests,
            totalTokens: session.state.tokenCount,
            averageResponseTime: averageResponseTime,
            errorRate: errorRate
        };
    };
    /**
     * Set the session timeout period
     * @param timeoutMs Timeout in milliseconds
     */
    LLMSessionManager.prototype.setSessionTimeout = function (timeoutMs) {
        if (timeoutMs < 60000) { // Minimum 1 minute
            throw new Error('Session timeout must be at least 60000ms (1 minute)');
        }
        this.sessionTimeout = timeoutMs;
    };
    /**
     * Start the session cleanup process
     */
    LLMSessionManager.prototype.startSessionCleanup = function () {
        var _this = this;
        this.sessionCheckInterval = setInterval(function () {
            _this.cleanupInactiveSessions();
        }, 60000); // Check every minute
    };
    /**
     * Cleanup inactive sessions
     */
    LLMSessionManager.prototype.cleanupInactiveSessions = function () {
        var now = Date.now();
        var expiredSessionIds = [];
        // Find expired sessions
        for (var _i = 0, _a = this.sessions.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], session = _b[1];
            if (!session.state.active && (now - session.state.lastActivity) > this.sessionTimeout) {
                expiredSessionIds.push(id);
            }
        }
        // Close expired sessions
        for (var _c = 0, expiredSessionIds_1 = expiredSessionIds; _c < expiredSessionIds_1.length; _c++) {
            var id = expiredSessionIds_1[_c];
            this.closeSession(id);
            this.emit('sessionExpired', id);
        }
    };
    LLMSessionManager.prototype.dispose = function () {
        // Clear session cleanup interval
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
        // Close all sessions
        for (var _i = 0, _a = this.sessions.keys(); _i < _a.length; _i++) {
            var id = _a[_i];
            this.closeSession(id);
        }
        this.removeAllListeners();
    };
    return LLMSessionManager;
}(events_1.EventEmitter));
exports.LLMSessionManager = LLMSessionManager;
