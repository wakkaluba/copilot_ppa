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
exports.ModelOptimizationService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../../utils/logger");
var ModelMetricsService_1 = require("./ModelMetricsService");
var types_1 = require("../types");
var events_1 = require("events");
var ModelOptimizationService = /** @class */ (function (_super) {
    __extends(ModelOptimizationService, _super);
    function ModelOptimizationService(logger, metricsService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsService = metricsService;
        _this.optimizationHistory = new Map();
        _this.activeOptimizations = new Set();
        return _this;
    }
    /**
     * Start an optimization run for a model
     */
    ModelOptimizationService.prototype.optimizeModel = function (modelId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, result, history_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.activeOptimizations.has(modelId)) {
                            throw new Error("Optimization already in progress for model ".concat(modelId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        this.activeOptimizations.add(modelId);
                        this.emit(types_1.ModelEvents.OptimizationStarted, { modelId: modelId, request: request });
                        return [4 /*yield*/, this.metricsService.getMetrics(modelId)];
                    case 2:
                        metrics = _a.sent();
                        if (!metrics) {
                            throw new Error("No metrics available for model ".concat(modelId));
                        }
                        return [4 /*yield*/, this.runOptimization(modelId, request, metrics)];
                    case 3:
                        result = _a.sent();
                        history_1 = this.optimizationHistory.get(modelId) || [];
                        history_1.push(result);
                        this.optimizationHistory.set(modelId, history_1);
                        this.emit(types_1.ModelEvents.OptimizationCompleted, { modelId: modelId, result: result });
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError('Optimization failed', error_1);
                        throw error_1;
                    case 5:
                        this.activeOptimizations.delete(modelId);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get optimization history for a model
     */
    ModelOptimizationService.prototype.getOptimizationHistory = function (modelId) {
        return this.optimizationHistory.get(modelId) || [];
    };
    /**
     * Calculate optimal resource allocation
     */
    ModelOptimizationService.prototype.calculateResourceAllocation = function (metrics) {
        var allocation = {
            maxMemory: this.calculateOptimalMemory(metrics),
            maxThreads: this.calculateOptimalThreads(metrics),
            batchSize: this.calculateOptimalBatchSize(metrics),
            priority: this.calculatePriority(metrics)
        };
        return allocation;
    };
    ModelOptimizationService.prototype.calculateOptimalMemory = function (metrics) {
        // Memory calculation logic based on usage patterns
        var baseMemory = metrics.memoryUsage * 1.2; // 20% overhead
        var peakMemory = metrics.peakMemoryUsage || baseMemory;
        return Math.max(baseMemory, peakMemory);
    };
    ModelOptimizationService.prototype.calculateOptimalThreads = function (metrics) {
        // Thread calculation based on latency and throughput
        var baseThreads = Math.ceil(metrics.averageLatency / 100);
        return Math.min(Math.max(baseThreads, 1), 8); // Limit between 1-8 threads
    };
    ModelOptimizationService.prototype.calculateOptimalBatchSize = function (metrics) {
        // Batch size calculation based on memory and latency
        var baseBatch = Math.ceil(metrics.averageLatency / 50);
        return Math.min(Math.max(baseBatch, 1), 32); // Limit between 1-32
    };
    ModelOptimizationService.prototype.calculatePriority = function (metrics) {
        // Priority calculation based on usage patterns
        return Math.min(Math.max(metrics.requestCount / 1000, 1), 10); // Priority 1-10
    };
    ModelOptimizationService.prototype.runOptimization = function (modelId, request, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var iterations, bestResult, i, allocation, improvements, confidence;
            return __generator(this, function (_a) {
                iterations = request.maxIterations || 5;
                bestResult = {
                    modelId: modelId,
                    timestamp: new Date(),
                    allocation: this.calculateResourceAllocation(metrics),
                    improvements: {},
                    confidence: 0
                };
                for (i = 0; i < iterations; i++) {
                    allocation = this.calculateResourceAllocation(__assign(__assign({}, metrics), { iteration: i }));
                    improvements = this.calculateImprovements(metrics, allocation);
                    confidence = this.calculateConfidence(improvements);
                    if (confidence > bestResult.confidence) {
                        bestResult = {
                            modelId: modelId,
                            timestamp: new Date(),
                            allocation: allocation,
                            improvements: improvements,
                            confidence: confidence
                        };
                    }
                    this.emit(types_1.ModelEvents.OptimizationProgress, {
                        modelId: modelId,
                        iteration: i + 1,
                        totalIterations: iterations,
                        currentBest: bestResult
                    });
                }
                return [2 /*return*/, bestResult];
            });
        });
    };
    ModelOptimizationService.prototype.calculateImprovements = function (metrics, allocation) {
        return {
            latency: this.estimateLatencyImprovement(metrics, allocation),
            throughput: this.estimateThroughputImprovement(metrics, allocation),
            memory: this.estimateMemoryEfficiency(metrics, allocation)
        };
    };
    ModelOptimizationService.prototype.estimateLatencyImprovement = function (metrics, allocation) {
        var baseLatency = metrics.averageLatency;
        var estimatedLatency = baseLatency * (1 - (allocation.maxThreads * 0.1));
        return Math.min(((baseLatency - estimatedLatency) / baseLatency) * 100, 50);
    };
    ModelOptimizationService.prototype.estimateThroughputImprovement = function (metrics, allocation) {
        var baseThroughput = metrics.requestCount / metrics.uptime;
        var estimatedThroughput = baseThroughput * (1 + (allocation.batchSize * 0.05));
        return Math.min(((estimatedThroughput - baseThroughput) / baseThroughput) * 100, 100);
    };
    ModelOptimizationService.prototype.estimateMemoryEfficiency = function (metrics, allocation) {
        var baseMemory = metrics.memoryUsage;
        var estimatedMemory = allocation.maxMemory * 0.8; // Assuming 80% utilization
        return Math.min(((baseMemory - estimatedMemory) / baseMemory) * 100, 30);
    };
    ModelOptimizationService.prototype.calculateConfidence = function (improvements) {
        var weights = {
            latency: 0.4,
            throughput: 0.4,
            memory: 0.2
        };
        return Object.entries(improvements).reduce(function (sum, _a) {
            var key = _a[0], value = _a[1];
            return sum + (value * weights[key]);
        }, 0) / 100;
    };
    ModelOptimizationService.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
    };
    ModelOptimizationService.prototype.dispose = function () {
        this.removeAllListeners();
        this.optimizationHistory.clear();
        this.activeOptimizations.clear();
    };
    var _a;
    ModelOptimizationService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService])
    ], ModelOptimizationService);
    return ModelOptimizationService;
}(events_1.EventEmitter));
exports.ModelOptimizationService = ModelOptimizationService;
