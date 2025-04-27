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
exports.ModelMetricsManager = void 0;
var vscode = require("vscode");
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelMetricsManager = /** @class */ (function (_super) {
    __extends(ModelMetricsManager, _super);
    function ModelMetricsManager() {
        var _this = _super.call(this) || this;
        _this.metricsHistory = new Map();
        _this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        _this.samplingInterval = 60 * 1000; // 1 minute
        _this.cleanupInterval = null;
        _this.logger = new logger_1.Logger();
        _this.outputChannel = vscode.window.createOutputChannel('Model Metrics');
        _this.startPeriodicCleanup();
        return _this;
    }
    ModelMetricsManager.prototype.trackMetrics = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    this.addMetricsSnapshot(modelId, metrics);
                    this.analyzePerformanceTrends(modelId);
                    this.emitMetricsUpdate(modelId, metrics);
                    this.logMetricsUpdate(modelId, metrics);
                }
                catch (error) {
                    this.handleError('Failed to track metrics', error);
                }
                return [2 /*return*/];
            });
        });
    };
    ModelMetricsManager.prototype.getMetricsHistory = function (modelId) {
        return this.metricsHistory.get(modelId) || [];
    };
    ModelMetricsManager.prototype.getLatestSnapshot = function (history) {
        return history.length > 0 ? history[history.length - 1] : undefined;
    };
    ModelMetricsManager.prototype.getLatestMetrics = function (modelId) {
        var _a;
        var history = this.getMetricsHistory(modelId);
        return (_a = this.getLatestSnapshot(history)) === null || _a === void 0 ? void 0 : _a.metrics;
    };
    ModelMetricsManager.prototype.getAggregateMetrics = function (modelId) {
        var history = this.getMetricsHistory(modelId);
        var latest = this.getLatestSnapshot(history);
        if (!latest) {
            return undefined;
        }
        return {
            averageResponseTime: this.calculateAverageResponseTime(history),
            tokenThroughput: this.calculateAverageThroughput(history),
            errorRate: this.calculateAverageErrorRate(history),
            totalRequests: this.calculateTotalRequests(history),
            totalTokens: this.calculateTotalTokens(history),
            lastUsed: new Date(latest.timestamp)
        };
    };
    ModelMetricsManager.prototype.addMetricsSnapshot = function (modelId, metrics) {
        var history = this.metricsHistory.get(modelId) || [];
        history.push({
            timestamp: new Date(),
            metrics: __assign({}, metrics)
        });
        this.metricsHistory.set(modelId, history);
    };
    ModelMetricsManager.prototype.analyzePerformanceTrends = function (modelId) {
        var history = this.getMetricsHistory(modelId);
        if (history.length < 2) {
            return;
        }
        var recentSnapshots = history.slice(-10); // Analyze last 10 snapshots
        // Analyze response time trend
        var responseTimeTrend = this.calculateTrend(recentSnapshots.map(function (s) { return s.metrics.averageResponseTime; }));
        // Analyze throughput trend
        var throughputTrend = this.calculateTrend(recentSnapshots.map(function (s) { return s.metrics.tokenThroughput; }));
        // Analyze error rate trend
        var errorRateTrend = this.calculateTrend(recentSnapshots.map(function (s) { return s.metrics.errorRate; }));
        this.emit('performanceTrend', {
            modelId: modelId,
            responseTimeTrend: responseTimeTrend,
            throughputTrend: throughputTrend,
            errorRateTrend: errorRateTrend
        });
        this.logPerformanceTrends(modelId, {
            responseTimeTrend: responseTimeTrend,
            throughputTrend: throughputTrend,
            errorRateTrend: errorRateTrend
        });
    };
    ModelMetricsManager.prototype.calculateTrend = function (values) {
        if (values.length < 2) {
            return 0;
        }
        var n = values.length;
        var sumX = values.reduce(function (sum, _, i) { return sum + i; }, 0);
        var sumY = values.reduce(function (sum, value) { return sum + value; }, 0);
        var sumXY = values.reduce(function (sum, value, i) { return sum + i * value; }, 0);
        var sumXX = values.reduce(function (sum, _, i) { return sum + i * i; }, 0);
        // Calculate slope of linear regression
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    };
    ModelMetricsManager.prototype.calculateAverageResponseTime = function (history) {
        return this.calculateAverage(history.map(function (s) { return s.metrics.averageResponseTime; }));
    };
    ModelMetricsManager.prototype.calculateAverageThroughput = function (history) {
        return this.calculateAverage(history.map(function (s) { return s.metrics.tokenThroughput; }));
    };
    ModelMetricsManager.prototype.calculateAverageErrorRate = function (history) {
        return this.calculateAverage(history.map(function (s) { return s.metrics.errorRate; }));
    };
    ModelMetricsManager.prototype.calculateTotalRequests = function (history) {
        return history.reduce(function (sum, s) { return sum + s.metrics.totalRequests; }, 0);
    };
    ModelMetricsManager.prototype.calculateTotalTokens = function (history) {
        return history.reduce(function (sum, s) { return sum + s.metrics.totalTokens; }, 0);
    };
    ModelMetricsManager.prototype.calculateAverage = function (values) {
        if (values.length === 0) {
            return 0;
        }
        return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
    };
    ModelMetricsManager.prototype.emitMetricsUpdate = function (modelId, metrics) {
        this.emit('metricsUpdated', { modelId: modelId, metrics: metrics });
    };
    ModelMetricsManager.prototype.startPeriodicCleanup = function () {
        var _this = this;
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cleanupInterval = setInterval(function () {
            try {
                _this.cleanupOldMetrics();
            }
            catch (error) {
                _this.handleError('Failed to cleanup metrics', error);
            }
        }, this.samplingInterval);
    };
    ModelMetricsManager.prototype.cleanupOldMetrics = function () {
        var cutoffTime = Date.now() - this.retentionPeriod;
        for (var _i = 0, _a = this.metricsHistory.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], modelId = _b[0], history_1 = _b[1];
            var filteredHistory = history_1.filter(function (s) { return s.timestamp >= cutoffTime; });
            if (filteredHistory.length !== history_1.length) {
                this.metricsHistory.set(modelId, filteredHistory);
                this.logMetricsCleanup(modelId, history_1.length - filteredHistory.length);
            }
        }
    };
    ModelMetricsManager.prototype.logMetricsUpdate = function (modelId, metrics) {
        this.outputChannel.appendLine('\nMetrics Update:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine("Response Time: ".concat(metrics.averageResponseTime.toFixed(2), "ms"));
        this.outputChannel.appendLine("Throughput: ".concat(metrics.tokenThroughput.toFixed(2), " tokens/sec"));
        this.outputChannel.appendLine("Error Rate: ".concat((metrics.errorRate * 100).toFixed(1), "%"));
    };
    ModelMetricsManager.prototype.logPerformanceTrends = function (modelId, trends) {
        var _this = this;
        this.outputChannel.appendLine('\nPerformance Trends:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        Object.entries(trends).forEach(function (_a) {
            var metric = _a[0], trend = _a[1];
            var direction = trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
            _this.outputChannel.appendLine("".concat(metric, ": ").concat(direction, " (").concat(Math.abs(trend).toFixed(4), ")"));
        });
    };
    ModelMetricsManager.prototype.logMetricsCleanup = function (modelId, removedCount) {
        this.outputChannel.appendLine("\nCleaned up ".concat(removedCount, " old metrics for model ").concat(modelId));
    };
    ModelMetricsManager.prototype.handleError = function (message, error) {
        this.logger.error("[ModelMetricsManager] ".concat(message, ": ").concat(error.message));
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelMetricsManager.prototype.dispose = function () {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.clear();
    };
    return ModelMetricsManager;
}(events_1.EventEmitter));
exports.ModelMetricsManager = ModelMetricsManager;
