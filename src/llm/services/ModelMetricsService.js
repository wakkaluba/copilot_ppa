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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.ModelMetricsService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
var ModelMetricsService = /** @class */ (function (_super) {
    __extends(ModelMetricsService, _super);
    function ModelMetricsService(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsByModel = new Map();
        _this.latestMetrics = new Map();
        _this.metricsRetentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        _this.logger.info('ModelMetricsService initialized');
        // Set up periodic cleanup of old metrics
        _this.cleanupInterval = setInterval(function () { return _this.cleanupOldMetrics(); }, _this.metricsRetentionPeriod);
        return _this;
    }
    /**
     * Record new metrics for a model
     */
    ModelMetricsService.prototype.recordMetrics = function (metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, modelMetrics;
            return __generator(this, function (_a) {
                try {
                    modelId = metrics.modelId;
                    if (!modelId) {
                        throw new Error('Model ID is required for metrics recording');
                    }
                    // Ensure we have a metrics array for this model
                    if (!this.metricsByModel.has(modelId)) {
                        this.metricsByModel.set(modelId, []);
                    }
                    // Add timestamp if not present
                    if (!metrics.timestamp) {
                        metrics.timestamp = Date.now();
                    }
                    modelMetrics = this.metricsByModel.get(modelId);
                    modelMetrics.push(metrics);
                    // Update latest metrics
                    this.latestMetrics.set(modelId, metrics);
                    // Emit event
                    this.emit('metrics.recorded', { modelId: modelId, metrics: metrics });
                    this.logger.info("Recorded metrics for model ".concat(modelId), metrics);
                }
                catch (error) {
                    this.logger.error('Error recording model metrics', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get metrics history for a model
     */
    ModelMetricsService.prototype.getMetricsHistory = function (modelId, timeRange) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, cutoffTime_1;
            return __generator(this, function (_a) {
                try {
                    metrics = this.metricsByModel.get(modelId) || [];
                    if (!timeRange) {
                        return [2 /*return*/, metrics];
                    }
                    cutoffTime_1 = Date.now() - timeRange;
                    return [2 /*return*/, metrics.filter(function (m) { return m.timestamp >= cutoffTime_1; })];
                }
                catch (error) {
                    this.logger.error("Error getting metrics history for model ".concat(modelId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the latest metrics for all models
     */
    ModelMetricsService.prototype.getLatestMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Map(this.latestMetrics)];
            });
        });
    };
    /**
     * Get the latest metrics for a specific model
     */
    ModelMetricsService.prototype.getLatestMetricsForModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.latestMetrics.get(modelId) || null];
            });
        });
    };
    /**
     * Calculate aggregated metrics for a model over a time period
     */
    ModelMetricsService.prototype.getAggregateMetrics = function (modelId, timeRange) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, totalResponseTime, totalRequests, totalErrors, totalTokens, totalPromptTokens, totalCompletionTokens, responseTimes, _i, metrics_1, metric, p95Index, p95ResponseTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getMetricsHistory(modelId, timeRange)];
                    case 1:
                        metrics = _a.sent();
                        if (metrics.length === 0) {
                            return [2 /*return*/, null];
                        }
                        totalResponseTime = 0;
                        totalRequests = 0;
                        totalErrors = 0;
                        totalTokens = 0;
                        totalPromptTokens = 0;
                        totalCompletionTokens = 0;
                        responseTimes = [];
                        for (_i = 0, metrics_1 = metrics; _i < metrics_1.length; _i++) {
                            metric = metrics_1[_i];
                            totalResponseTime += metric.averageResponseTime;
                            totalRequests += metric.successfulRequests + metric.failedRequests;
                            totalErrors += metric.failedRequests;
                            totalTokens += metric.totalTokens;
                            totalPromptTokens += metric.promptTokens;
                            totalCompletionTokens += metric.completionTokens;
                            // Store response times for percentile calculation
                            responseTimes.push(metric.averageResponseTime);
                        }
                        // Sort for percentile
                        responseTimes.sort(function (a, b) { return a - b; });
                        p95Index = Math.floor(responseTimes.length * 0.95);
                        p95ResponseTime = responseTimes[p95Index] || 0;
                        return [2 /*return*/, {
                                modelId: modelId,
                                averageResponseTime: totalRequests > 0 ? totalResponseTime / metrics.length : 0,
                                p95ResponseTime: p95ResponseTime,
                                requestRate: totalRequests / (timeRange / 1000), // Requests per second
                                errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
                                successfulRequests: totalRequests - totalErrors,
                                failedRequests: totalErrors,
                                totalTokens: totalTokens,
                                promptTokens: totalPromptTokens,
                                completionTokens: totalCompletionTokens,
                                timestamp: new Date()
                            }];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error("Error calculating aggregate metrics for model ".concat(modelId), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old metrics beyond retention period
     */
    ModelMetricsService.prototype.cleanupOldMetrics = function () {
        try {
            var cutoffTime_2 = Date.now() - this.metricsRetentionPeriod;
            for (var _i = 0, _a = this.metricsByModel.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], modelId = _b[0], metrics = _b[1];
                var filteredMetrics = metrics.filter(function (m) { return m.timestamp >= cutoffTime_2; });
                if (filteredMetrics.length !== metrics.length) {
                    this.metricsByModel.set(modelId, filteredMetrics);
                    this.logger.info("Cleaned up old metrics for model ".concat(modelId), {
                        removed: metrics.length - filteredMetrics.length,
                        remaining: filteredMetrics.length
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error during metrics cleanup', error);
        }
    };
    /**
     * Dispose of resources
     */
    ModelMetricsService.prototype.dispose = function () {
        clearInterval(this.cleanupInterval);
        this.removeAllListeners();
        this.metricsByModel.clear();
        this.latestMetrics.clear();
        this.logger.info('ModelMetricsService disposed');
    };
    var _a;
    ModelMetricsService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
    ], ModelMetricsService);
    return ModelMetricsService;
}(events_1.EventEmitter));
exports.ModelMetricsService = ModelMetricsService;
