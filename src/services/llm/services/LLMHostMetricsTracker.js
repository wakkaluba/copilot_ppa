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
exports.LLMHostMetricsTracker = void 0;
var events_1 = require("events");
var LLMHostMetricsTracker = /** @class */ (function (_super) {
    __extends(LLMHostMetricsTracker, _super);
    function LLMHostMetricsTracker() {
        var _this = _super.call(this) || this;
        _this.metrics = {
            totalStarts: 0,
            totalErrors: 0,
            uptime: 0,
            averageCpuUsage: 0,
            averageMemoryUsage: 0,
            lastStartTime: null,
            lastErrorTime: null
        };
        _this.processStartTimes = new Map();
        _this.metricsInterval = null;
        _this.updateInterval = 60000; // 1 minute
        _this.startMetricsUpdate();
        return _this;
    }
    LLMHostMetricsTracker.prototype.recordStart = function (info) {
        this.metrics.totalStarts++;
        this.metrics.lastStartTime = Date.now();
        this.processStartTimes.set(info.pid, Date.now());
        this.updateMetrics();
    };
    LLMHostMetricsTracker.prototype.recordStop = function (info) {
        this.processStartTimes.delete(info.pid);
        this.updateMetrics();
    };
    LLMHostMetricsTracker.prototype.startMetricsUpdate = function () {
        var _this = this;
        this.metricsInterval = setInterval(function () {
            _this.updateMetrics();
        }, this.updateInterval);
    };
    LLMHostMetricsTracker.prototype.updateMetrics = function () {
        var totalUptime = 0;
        var now = Date.now();
        for (var _i = 0, _a = this.processStartTimes.values(); _i < _a.length; _i++) {
            var startTime = _a[_i];
            totalUptime += now - startTime;
        }
        this.metrics.uptime = totalUptime;
        this.emit('metrics:updated', this.getCurrentMetrics());
    };
    LLMHostMetricsTracker.prototype.getCurrentMetrics = function () {
        return __assign({}, this.metrics);
    };
    LLMHostMetricsTracker.prototype.dispose = function () {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.removeAllListeners();
    };
    return LLMHostMetricsTracker;
}(events_1.EventEmitter));
exports.LLMHostMetricsTracker = LLMHostMetricsTracker;
