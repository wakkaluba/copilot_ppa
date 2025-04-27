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
exports.ConnectionMetricsTracker = void 0;
var events_1 = require("events");
var interfaces_1 = require("./interfaces");
var errors_1 = require("./errors");
/**
 * Default metrics state
 */
var DEFAULT_METRICS = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatency: 0,
    averageLatency: 0,
    maxLatency: 0,
    minLatency: Infinity,
    errors: {},
    requestsInLastMinute: 0,
    requestsInLastHour: 0,
    lastUpdated: Date.now()
};
/**
 * Tracks performance metrics for LLM connections
 */
var ConnectionMetricsTracker = /** @class */ (function (_super) {
    __extends(ConnectionMetricsTracker, _super);
    function ConnectionMetricsTracker() {
        var _this = _super.call(this) || this;
        _this.metrics = __assign({}, DEFAULT_METRICS);
        _this.recentRequests = [];
        _this.MINUTE = 60 * 1000;
        _this.HOUR = 60 * 60 * 1000;
        _this.startPeriodicCleanup();
        return _this;
    }
    /**
     * Record a successful connection
     */
    ConnectionMetricsTracker.prototype.recordConnectionSuccess = function () {
        this.updateMetrics({
            type: 'connection',
            success: true
        });
    };
    /**
     * Record a successful request with timing
     */
    ConnectionMetricsTracker.prototype.recordRequest = function (durationMs) {
        this.updateMetrics({
            type: 'request',
            success: true,
            duration: durationMs
        });
    };
    /**
     * Record a failed request
     */
    ConnectionMetricsTracker.prototype.recordRequestFailure = function (error) {
        this.updateMetrics({
            type: 'request',
            success: false,
            error: error
        });
    };
    /**
     * Get current metrics
     */
    ConnectionMetricsTracker.prototype.getMetrics = function () {
        this.updateTimeBasedMetrics();
        return __assign({}, this.metrics);
    };
    /**
     * Reset metrics
     */
    ConnectionMetricsTracker.prototype.reset = function () {
        this.metrics = __assign({}, DEFAULT_METRICS);
        this.recentRequests = [];
        this.emit('metricsReset');
    };
    ConnectionMetricsTracker.prototype.updateMetrics = function (event) {
        var now = Date.now();
        this.metrics.lastUpdated = now;
        this.metrics.totalRequests++;
        if (event.success) {
            this.metrics.successfulRequests++;
            if (event.duration !== undefined) {
                this.updateLatencyMetrics(event.duration);
                this.recentRequests.push({
                    timestamp: now,
                    duration: event.duration
                });
            }
        }
        else {
            this.metrics.failedRequests++;
            if (event.error) {
                this.recordError(event.error);
            }
        }
        this.updateTimeBasedMetrics();
        this.emit('metricsUpdated', this.getMetrics());
    };
    ConnectionMetricsTracker.prototype.updateLatencyMetrics = function (duration) {
        this.metrics.totalLatency += duration;
        this.metrics.averageLatency = this.metrics.totalLatency / this.metrics.successfulRequests;
        this.metrics.maxLatency = Math.max(this.metrics.maxLatency, duration);
        this.metrics.minLatency = Math.min(this.metrics.minLatency, duration);
    };
    ConnectionMetricsTracker.prototype.recordError = function (error) {
        var errorType = 'unknown';
        if (error instanceof errors_1.LLMConnectionError) {
            errorType = interfaces_1.ConnectionErrorCode[error.code] || 'unknown';
        }
        else {
            errorType = error.constructor.name;
        }
        this.metrics.errors[errorType] = (this.metrics.errors[errorType] || 0) + 1;
    };
    ConnectionMetricsTracker.prototype.updateTimeBasedMetrics = function () {
        var now = Date.now();
        var minuteAgo = now - this.MINUTE;
        var hourAgo = now - this.HOUR;
        // Update recent request counts
        this.recentRequests = this.recentRequests.filter(function (r) { return r.timestamp >= hourAgo; });
        this.metrics.requestsInLastMinute = this.recentRequests.filter(function (r) { return r.timestamp >= minuteAgo; }).length;
        this.metrics.requestsInLastHour = this.recentRequests.length;
    };
    ConnectionMetricsTracker.prototype.startPeriodicCleanup = function () {
        var _this = this;
        setInterval(function () {
            var now = Date.now();
            var hourAgo = now - _this.HOUR;
            // Remove requests older than an hour
            _this.recentRequests = _this.recentRequests.filter(function (r) { return r.timestamp >= hourAgo; });
            // Update time-based metrics
            _this.updateTimeBasedMetrics();
        }, this.MINUTE); // Clean up every minute
    };
    ConnectionMetricsTracker.prototype.dispose = function () {
        this.removeAllListeners();
    };
    return ConnectionMetricsTracker;
}(events_1.EventEmitter));
exports.ConnectionMetricsTracker = ConnectionMetricsTracker;
