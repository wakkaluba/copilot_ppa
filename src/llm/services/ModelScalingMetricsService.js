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
exports.ModelScalingMetricsService = void 0;
var inversify_1 = require("inversify");
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelScalingMetricsService = /** @class */ (function (_super) {
    __extends(ModelScalingMetricsService, _super);
    function ModelScalingMetricsService(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsHistory = new Map();
        _this.thresholds = new Map();
        _this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        _this.aggregationInterval = 60 * 1000; // 1 minute
        _this.cleanupTimer = setInterval(function () { return _this.cleanupOldMetrics(); }, _this.retentionPeriod);
        _this.initializeDefaultThresholds();
        return _this;
    }
    ModelScalingMetricsService.prototype.initializeDefaultThresholds = function () {
        var defaultThresholds = {
            performance: {
                maxResponseTime: 2000,
                minThroughput: 10,
                maxErrorRate: 0.05,
                maxRequestRate: 1000
            },
            resources: {
                maxCPU: 80,
                maxMemory: 85,
                maxGPU: 90,
                maxNetworkIO: 80
            },
            scaling: {
                maxQueueLength: 100,
                maxBacklog: 50,
                minAvailableNodes: 2
            }
        };
        this.thresholds.set('default', defaultThresholds);
    };
    // Add methods needed by the tests
    ModelScalingMetricsService.prototype.updateMetrics = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.storeMetrics(modelId, metrics)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.checkThresholds(modelId, metrics)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError("Failed to update metrics for model ".concat(modelId), error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelScalingMetricsService.prototype.getMetricsHistory = function (modelId, duration) {
        var history = this.metricsHistory.get(modelId) || [];
        if (!duration) {
            return history;
        }
        var cutoff = Date.now() - duration;
        return history.filter(function (m) { return m.timestamp >= cutoff; });
    };
    ModelScalingMetricsService.prototype.analyzePerformanceTrend = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var history, latest, previous, recommendations, degrading;
            return __generator(this, function (_a) {
                history = this.getMetricsHistory(modelId);
                if (history.length < 2) {
                    return [2 /*return*/, { degrading: false, recommendations: ['Not enough data for analysis'] }];
                }
                // Sort by timestamp to ensure correct order
                history.sort(function (a, b) { return a.timestamp - b.timestamp; });
                latest = history[history.length - 1];
                previous = history[history.length - 2];
                recommendations = [];
                degrading = false;
                // Check response time trend
                if (latest.performance.responseTime > previous.performance.responseTime * 1.2) {
                    degrading = true;
                    recommendations.push('Response time increasing significantly');
                }
                // Check error rate trend
                if (latest.performance.errorRate > previous.performance.errorRate * 1.5) {
                    degrading = true;
                    recommendations.push('Error rate increasing significantly');
                }
                // Check resource utilization
                if (latest.resources.cpu > 75 || latest.resources.memory > 80) {
                    recommendations.push('Consider scaling up');
                    degrading = true;
                }
                return [2 /*return*/, {
                        degrading: degrading,
                        recommendations: recommendations
                    }];
            });
        });
    };
    ModelScalingMetricsService.prototype.storeMetrics = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var history;
            return __generator(this, function (_a) {
                history = this.metricsHistory.get(modelId) || [];
                history.push(metrics);
                this.metricsHistory.set(modelId, history);
                this.emit('metricsCollected', {
                    modelId: modelId,
                    metrics: metrics
                });
                return [2 /*return*/];
            });
        });
    };
    ModelScalingMetricsService.prototype.checkThresholds = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var thresholds, violations;
            return __generator(this, function (_a) {
                thresholds = this.thresholds.get(modelId) || this.thresholds.get('default');
                violations = [];
                // Check performance thresholds
                if (metrics.performance.responseTime > thresholds.performance.maxResponseTime) {
                    violations.push("Response time ".concat(metrics.performance.responseTime, "ms exceeds threshold ").concat(thresholds.performance.maxResponseTime, "ms"));
                }
                if (metrics.performance.throughput < thresholds.performance.minThroughput) {
                    violations.push("Throughput ".concat(metrics.performance.throughput, " below threshold ").concat(thresholds.performance.minThroughput));
                }
                // Check resource thresholds
                if (metrics.resources.cpu > thresholds.resources.maxCPU) {
                    violations.push("CPU usage ".concat(metrics.resources.cpu, "% exceeds threshold ").concat(thresholds.resources.maxCPU, "%"));
                }
                if (violations.length > 0) {
                    this.emit('thresholdViolation', {
                        modelId: modelId,
                        violations: violations,
                        metrics: metrics
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    ModelScalingMetricsService.prototype.cleanupOldMetrics = function () {
        var cutoff = Date.now() - this.retentionPeriod;
        for (var _i = 0, _a = this.metricsHistory.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], modelId = _b[0], history_1 = _b[1];
            var filteredHistory = history_1.filter(function (m) { return m.timestamp >= cutoff; });
            if (filteredHistory.length !== history_1.length) {
                this.metricsHistory.set(modelId, filteredHistory);
                this.emit('metricsCleanup', {
                    modelId: modelId,
                    removed: history_1.length - filteredHistory.length
                });
            }
        }
    };
    ModelScalingMetricsService.prototype.setThresholds = function (modelId, thresholds) {
        this.thresholds.set(modelId, thresholds);
        this.emit('thresholdsUpdated', {
            modelId: modelId,
            thresholds: thresholds
        });
    };
    ModelScalingMetricsService.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
        this.emit('error', { message: message, error: error });
    };
    ModelScalingMetricsService.prototype.dispose = function () {
        clearInterval(this.cleanupTimer);
        this.removeAllListeners();
        this.metricsHistory.clear();
        this.thresholds.clear();
    };
    var _a;
    ModelScalingMetricsService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
    ], ModelScalingMetricsService);
    return ModelScalingMetricsService;
}(events_1.EventEmitter));
exports.ModelScalingMetricsService = ModelScalingMetricsService;
