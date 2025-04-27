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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMSessionTrackingService = void 0;
var events_1 = require("events");
/**
 * Service for tracking LLM session lifecycle and metrics
 */
var LLMSessionTrackingService = /** @class */ (function (_super) {
    __extends(LLMSessionTrackingService, _super);
    function LLMSessionTrackingService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.activeSessions = new Map();
        _this.sessionHistory = [];
        _this.stats = {
            totalSessions: 0,
            successfulSessions: 0,
            failedSessions: 0,
            abortedSessions: 0,
            averageSessionDuration: 0,
            totalTokensUsed: 0
        };
        return _this;
    }
    /**
     * Start a new session
     */
    LLMSessionTrackingService.prototype.startSession = function (sessionId, config) {
        var session = {
            id: sessionId,
            config: config,
            startTime: Date.now(),
            state: 'active'
        };
        this.activeSessions.set(sessionId, session);
        this.stats.totalSessions++;
        this.emit('sessionStarted', session);
        return session;
    };
    /**
     * End a session
     */
    LLMSessionTrackingService.prototype.endSession = function (sessionId, state) {
        if (state === void 0) { state = 'completed'; }
        var session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.endTime = Date.now();
        session.state = state;
        this.updateStats(session);
        this.sessionHistory.push(session);
        this.activeSessions.delete(sessionId);
        this.emit('sessionEnded', session);
    };
    /**
     * Record a successful response
     */
    LLMSessionTrackingService.prototype.recordSuccess = function (sessionId, response) {
        var _a;
        var session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.response = response;
        session.state = 'completed';
        // Update token usage stats if available
        if ((_a = response.usage) === null || _a === void 0 ? void 0 : _a.totalTokens) {
            this.stats.totalTokensUsed += response.usage.totalTokens;
        }
        this.emit('sessionSuccess', {
            sessionId: sessionId,
            response: response
        });
    };
    /**
     * Record a session error
     */
    LLMSessionTrackingService.prototype.recordError = function (sessionId, error) {
        var session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.error = error instanceof Error ? error : new Error(String(error));
        session.state = 'failed';
        this.emit('sessionError', {
            sessionId: sessionId,
            error: session.error
        });
    };
    /**
     * Stop all active sessions
     */
    LLMSessionTrackingService.prototype.stopAllSessions = function () {
        for (var _i = 0, _a = this.activeSessions.keys(); _i < _a.length; _i++) {
            var sessionId = _a[_i];
            this.endSession(sessionId, 'aborted');
        }
    };
    /**
     * Handle connection error for all active sessions
     */
    LLMSessionTrackingService.prototype.handleError = function (error) {
        for (var _i = 0, _a = this.activeSessions.values(); _i < _a.length; _i++) {
            var session = _a[_i];
            this.recordError(session.id, error);
            this.endSession(session.id, 'failed');
        }
    };
    /**
     * Get session statistics
     */
    LLMSessionTrackingService.prototype.getStats = function () {
        return __assign({}, this.stats);
    };
    /**
     * Get recent session history
     */
    LLMSessionTrackingService.prototype.getSessionHistory = function (limit) {
        if (limit === void 0) { limit = 100; }
        return this.sessionHistory
            .slice(-limit)
            .map(function (session) { return (__assign({}, session)); });
    };
    /**
     * Get active session info
     */
    LLMSessionTrackingService.prototype.getActiveSession = function (sessionId) {
        var session = this.activeSessions.get(sessionId);
        return session ? __assign({}, session) : undefined;
    };
    /**
     * Get all active sessions
     */
    LLMSessionTrackingService.prototype.getActiveSessions = function () {
        return Array.from(this.activeSessions.values())
            .map(function (session) { return (__assign({}, session)); });
    };
    LLMSessionTrackingService.prototype.updateStats = function (session) {
        if (!session.endTime) {
            return;
        }
        var duration = session.endTime - session.startTime;
        switch (session.state) {
            case 'completed':
                this.stats.successfulSessions++;
                break;
            case 'failed':
                this.stats.failedSessions++;
                break;
            case 'aborted':
                this.stats.abortedSessions++;
                break;
        }
        // Update average duration
        var totalSessions = this.stats.successfulSessions + this.stats.failedSessions;
        if (totalSessions > 0) {
            this.stats.averageSessionDuration =
                (this.stats.averageSessionDuration * (totalSessions - 1) + duration) / totalSessions;
        }
    };
    LLMSessionTrackingService.prototype.dispose = function () {
        this.stopAllSessions();
        this.removeAllListeners();
    };
    return LLMSessionTrackingService;
}(events_1.EventEmitter));
exports.LLMSessionTrackingService = LLMSessionTrackingService;
