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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMMetricsService = void 0;
var events_1 = require("events");
/**
 * Service for tracking and managing LLM connection metrics
 */
var LLMMetricsService = /** @class */ (function (_super) {
    __extends(LLMMetricsService, _super);
    function LLMMetricsService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.metrics = new Map();
        _this.activeProvider = null;
        _this.startTimes = new Map();
        return _this;
    }
    LLMMetricsService.prototype.initializeMetrics = function (providerName) {
        if (!this.metrics.has(providerName)) {
            this.metrics.set(providerName, {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                lastResponseTime: 0,
                uptime: 0,
                lastError: undefined,
                lastErrorTime: undefined,
                totalTokens: 0,
                errorRates: new Map(),
                resourceUsage: {
                    memory: 0,
                    cpu: 0
                },
                estimatedCost: 0
            });
        }
    };
    LLMMetricsService.prototype.setActiveProvider = function (providerName) {
        this.activeProvider = providerName;
        this.startTimes.set(providerName, Date.now());
        this.updateUptime(providerName);
    };
    LLMMetricsService.prototype.recordRequest = function (providerName, success, responseTime) {
        var metrics = this.getProviderMetrics(providerName);
        metrics.totalRequests++;
        if (success) {
            metrics.successfulRequests++;
        }
        else {
            metrics.failedRequests++;
        }
        metrics.lastResponseTime = responseTime;
        metrics.averageResponseTime = this.calculateNewAverage(metrics.averageResponseTime, responseTime, metrics.totalRequests);
    };
    LLMMetricsService.prototype.recordRequestSuccess = function (providerId, responseTime, tokenCount) {
        var metrics = this.getProviderMetrics(providerId);
        metrics.totalRequests++;
        metrics.successfulRequests++;
        metrics.totalTokens += tokenCount;
        metrics.lastResponseTime = responseTime;
        metrics.averageResponseTime = this.calculateNewAverage(metrics.averageResponseTime, responseTime, metrics.successfulRequests);
        metrics.estimatedCost += this.calculateCost(tokenCount);
        this.updateResourceUsage(providerId);
    };
    LLMMetricsService.prototype.recordRequestFailure = function (providerId, error) {
        var metrics = this.getProviderMetrics(providerId);
        metrics.totalRequests++;
        var errorType = error.name;
        metrics.errorRates.set(errorType, (metrics.errorRates.get(errorType) || 0) + 1);
    };
    LLMMetricsService.prototype.recordError = function (providerName, error) {
        var metrics = this.getProviderMetrics(providerName);
        metrics.lastError = error;
        metrics.lastErrorTime = new Date();
        metrics.failedRequests++;
    };
    LLMMetricsService.prototype.recordConnectionTime = function (providerName, connectionTime) {
        var metrics = this.getProviderMetrics(providerName);
        metrics.lastResponseTime = connectionTime;
        metrics.averageResponseTime = this.calculateNewAverage(metrics.averageResponseTime, connectionTime, metrics.totalRequests + 1);
    };
    LLMMetricsService.prototype.getMetrics = function (providerName) {
        return this.metrics.get(providerName || this.activeProvider || '');
    };
    LLMMetricsService.prototype.getAllMetrics = function () {
        // Update all uptimes before returning
        for (var _i = 0, _a = this.metrics; _i < _a.length; _i++) {
            var providerName = _a[_i][0];
            this.updateUptime(providerName);
        }
        return new Map(this.metrics);
    };
    LLMMetricsService.prototype.getProviderMetrics = function (providerName) {
        if (!this.metrics.has(providerName)) {
            this.initializeMetrics(providerName);
        }
        return this.metrics.get(providerName);
    };
    LLMMetricsService.prototype.calculateNewAverage = function (currentAvg, newValue, totalCount) {
        return (currentAvg * (totalCount - 1) + newValue) / totalCount;
    };
    LLMMetricsService.prototype.calculateCost = function (tokenCount) {
        // Implement cost calculation based on provider pricing
        return tokenCount * 0.0001; // Example rate
    };
    LLMMetricsService.prototype.updateResourceUsage = function (providerId) {
        var metrics = this.getProviderMetrics(providerId);
        var usage = process.memoryUsage();
        metrics.resourceUsage = {
            memory: usage.heapUsed,
            cpu: process.cpuUsage().user
        };
    };
    LLMMetricsService.prototype.updateUptime = function (providerName) {
        var startTime = this.startTimes.get(providerName);
        if (startTime && this.activeProvider === providerName) {
            var metrics = this.getProviderMetrics(providerName);
            metrics.uptime = Date.now() - startTime;
        }
    };
    LLMMetricsService.prototype.resetMetrics = function (providerName) {
        this.metrics.set(providerName, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastResponseTime: 0,
            uptime: 0,
            lastError: undefined,
            lastErrorTime: undefined,
            totalTokens: 0,
            errorRates: new Map(),
            resourceUsage: {
                memory: 0,
                cpu: 0
            },
            estimatedCost: 0
        });
        this.startTimes.delete(providerName);
    };
    LLMMetricsService.prototype.dispose = function () {
        this.metrics.clear();
        this.startTimes.clear();
        this.activeProvider = null;
    };
    return LLMMetricsService;
}(events_1.EventEmitter));
exports.LLMMetricsService = LLMMetricsService;
