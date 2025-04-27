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
exports.ModelResourceOptimizer = void 0;
var inversify_1 = require("inversify");
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelMetricsService_1 = require("./ModelMetricsService");
var ModelHealthMonitor_1 = require("./ModelHealthMonitor");
var ModelResourceOptimizer = /** @class */ (function (_super) {
    __extends(ModelResourceOptimizer, _super);
    function ModelResourceOptimizer(logger, metricsService, healthMonitor) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsService = metricsService;
        _this.healthMonitor = healthMonitor;
        return _this;
    }
    ModelResourceOptimizer.prototype.optimizeResources = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, recommendations, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.gatherMetrics(modelId)];
                    case 1:
                        metrics = _a.sent();
                        recommendations = this.generateRecommendations(metrics);
                        result = {
                            modelId: modelId,
                            timestamp: new Date(),
                            recommendations: recommendations,
                            metrics: metrics,
                            confidence: this.calculateConfidence(recommendations)
                        };
                        this.emit('optimizationCompleted', result);
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Resource optimization failed', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelResourceOptimizer.prototype.gatherMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, modelMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.metricsService.getLatestMetrics()];
                    case 1:
                        metrics = _a.sent();
                        modelMetrics = metrics.get(modelId);
                        if (!modelMetrics) {
                            throw new Error("No metrics available for model ".concat(modelId));
                        }
                        return [2 /*return*/, {
                                cpuUtilization: modelMetrics.resourceUtilization.cpu,
                                memoryUtilization: modelMetrics.resourceUtilization.memory,
                                gpuUtilization: modelMetrics.resourceUtilization.gpu,
                                latency: modelMetrics.latency,
                                throughput: modelMetrics.throughput,
                                errorRate: modelMetrics.errorRate
                            }];
                }
            });
        });
    };
    ModelResourceOptimizer.prototype.generateRecommendations = function (metrics) {
        var recommendations = [];
        // CPU optimization
        if (metrics.cpuUtilization > 80) {
            recommendations.push({
                type: 'cpu',
                currentValue: metrics.cpuUtilization,
                recommendedValue: metrics.cpuUtilization * 1.5,
                impact: 0.8,
                reason: 'High CPU utilization detected'
            });
        }
        // Memory optimization
        if (metrics.memoryUtilization > 85) {
            recommendations.push({
                type: 'memory',
                currentValue: metrics.memoryUtilization,
                recommendedValue: metrics.memoryUtilization * 1.3,
                impact: 0.7,
                reason: 'High memory usage detected'
            });
        }
        // GPU optimization if available
        if (metrics.gpuUtilization !== undefined && metrics.gpuUtilization < 50) {
            recommendations.push({
                type: 'gpu',
                currentValue: metrics.gpuUtilization,
                recommendedValue: Math.min(metrics.gpuUtilization * 2, 100),
                impact: 0.6,
                reason: 'Low GPU utilization detected'
            });
        }
        // Batch size optimization based on latency and throughput
        if (metrics.latency > 100 && metrics.throughput < 1000) {
            recommendations.push({
                type: 'batch',
                currentValue: this.estimateCurrentBatchSize(metrics),
                recommendedValue: this.calculateOptimalBatchSize(metrics),
                impact: 0.5,
                reason: 'Suboptimal batch size for current load'
            });
        }
        return recommendations;
    };
    ModelResourceOptimizer.prototype.estimateCurrentBatchSize = function (metrics) {
        return Math.ceil(metrics.throughput / (1000 / metrics.latency));
    };
    ModelResourceOptimizer.prototype.calculateOptimalBatchSize = function (metrics) {
        var baseBatch = Math.ceil(metrics.throughput / (500 / metrics.latency));
        return Math.min(Math.max(baseBatch, 1), 32);
    };
    ModelResourceOptimizer.prototype.calculateConfidence = function (recommendations) {
        if (recommendations.length === 0)
            return 1;
        var averageImpact = recommendations.reduce(function (sum, rec) { return sum + rec.impact; }, 0) / recommendations.length;
        return Math.min(Math.max(averageImpact, 0), 1);
    };
    ModelResourceOptimizer.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
        this.emit('error', { message: message, error: error });
    };
    var _a, _b;
    ModelResourceOptimizer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __param(2, (0, inversify_1.inject)(ModelHealthMonitor_1.ModelHealthMonitor)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService, typeof (_b = typeof ModelHealthMonitor_1.ModelHealthMonitor !== "undefined" && ModelHealthMonitor_1.ModelHealthMonitor) === "function" ? _b : Object])
    ], ModelResourceOptimizer);
    return ModelResourceOptimizer;
}(events_1.EventEmitter));
exports.ModelResourceOptimizer = ModelResourceOptimizer;
