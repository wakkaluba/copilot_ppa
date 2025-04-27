"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelOptimizationService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../../utils/logger");
const ModelMetricsService_1 = require("./ModelMetricsService");
const types_1 = require("../types");
const events_1 = require("events");
let ModelOptimizationService = class ModelOptimizationService extends events_1.EventEmitter {
    constructor(logger, metricsService) {
        super();
        this.logger = logger;
        this.metricsService = metricsService;
        this.optimizationHistory = new Map();
        this.activeOptimizations = new Set();
    }
    /**
     * Start an optimization run for a model
     */
    async optimizeModel(modelId, request) {
        if (this.activeOptimizations.has(modelId)) {
            throw new Error(`Optimization already in progress for model ${modelId}`);
        }
        try {
            this.activeOptimizations.add(modelId);
            this.emit(types_1.ModelEvents.OptimizationStarted, { modelId, request });
            const metrics = await this.metricsService.getMetrics(modelId);
            if (!metrics) {
                throw new Error(`No metrics available for model ${modelId}`);
            }
            const result = await this.runOptimization(modelId, request, metrics);
            // Store optimization history
            const history = this.optimizationHistory.get(modelId) || [];
            history.push(result);
            this.optimizationHistory.set(modelId, history);
            this.emit(types_1.ModelEvents.OptimizationCompleted, { modelId, result });
            return result;
        }
        catch (error) {
            this.handleError('Optimization failed', error);
            throw error;
        }
        finally {
            this.activeOptimizations.delete(modelId);
        }
    }
    /**
     * Get optimization history for a model
     */
    getOptimizationHistory(modelId) {
        return this.optimizationHistory.get(modelId) || [];
    }
    /**
     * Calculate optimal resource allocation
     */
    calculateResourceAllocation(metrics) {
        const allocation = {
            maxMemory: this.calculateOptimalMemory(metrics),
            maxThreads: this.calculateOptimalThreads(metrics),
            batchSize: this.calculateOptimalBatchSize(metrics),
            priority: this.calculatePriority(metrics)
        };
        return allocation;
    }
    calculateOptimalMemory(metrics) {
        // Memory calculation logic based on usage patterns
        const baseMemory = metrics.memoryUsage * 1.2; // 20% overhead
        const peakMemory = metrics.peakMemoryUsage || baseMemory;
        return Math.max(baseMemory, peakMemory);
    }
    calculateOptimalThreads(metrics) {
        // Thread calculation based on latency and throughput
        const baseThreads = Math.ceil(metrics.averageLatency / 100);
        return Math.min(Math.max(baseThreads, 1), 8); // Limit between 1-8 threads
    }
    calculateOptimalBatchSize(metrics) {
        // Batch size calculation based on memory and latency
        const baseBatch = Math.ceil(metrics.averageLatency / 50);
        return Math.min(Math.max(baseBatch, 1), 32); // Limit between 1-32
    }
    calculatePriority(metrics) {
        // Priority calculation based on usage patterns
        return Math.min(Math.max(metrics.requestCount / 1000, 1), 10); // Priority 1-10
    }
    async runOptimization(modelId, request, metrics) {
        // Run optimization iterations
        const iterations = request.maxIterations || 5;
        let bestResult = {
            modelId,
            timestamp: new Date(),
            allocation: this.calculateResourceAllocation(metrics),
            improvements: {},
            confidence: 0
        };
        for (let i = 0; i < iterations; i++) {
            const allocation = this.calculateResourceAllocation({
                ...metrics,
                iteration: i
            });
            // Calculate improvements
            const improvements = this.calculateImprovements(metrics, allocation);
            const confidence = this.calculateConfidence(improvements);
            if (confidence > bestResult.confidence) {
                bestResult = {
                    modelId,
                    timestamp: new Date(),
                    allocation,
                    improvements,
                    confidence
                };
            }
            this.emit(types_1.ModelEvents.OptimizationProgress, {
                modelId,
                iteration: i + 1,
                totalIterations: iterations,
                currentBest: bestResult
            });
        }
        return bestResult;
    }
    calculateImprovements(metrics, allocation) {
        return {
            latency: this.estimateLatencyImprovement(metrics, allocation),
            throughput: this.estimateThroughputImprovement(metrics, allocation),
            memory: this.estimateMemoryEfficiency(metrics, allocation)
        };
    }
    estimateLatencyImprovement(metrics, allocation) {
        const baseLatency = metrics.averageLatency;
        const estimatedLatency = baseLatency * (1 - (allocation.maxThreads * 0.1));
        return Math.min(((baseLatency - estimatedLatency) / baseLatency) * 100, 50);
    }
    estimateThroughputImprovement(metrics, allocation) {
        const baseThroughput = metrics.requestCount / metrics.uptime;
        const estimatedThroughput = baseThroughput * (1 + (allocation.batchSize * 0.05));
        return Math.min(((estimatedThroughput - baseThroughput) / baseThroughput) * 100, 100);
    }
    estimateMemoryEfficiency(metrics, allocation) {
        const baseMemory = metrics.memoryUsage;
        const estimatedMemory = allocation.maxMemory * 0.8; // Assuming 80% utilization
        return Math.min(((baseMemory - estimatedMemory) / baseMemory) * 100, 30);
    }
    calculateConfidence(improvements) {
        const weights = {
            latency: 0.4,
            throughput: 0.4,
            memory: 0.2
        };
        return Object.entries(improvements).reduce((sum, [key, value]) => {
            return sum + (value * weights[key]);
        }, 0) / 100;
    }
    handleError(message, error) {
        this.logger.error(message, { error });
    }
    dispose() {
        this.removeAllListeners();
        this.optimizationHistory.clear();
        this.activeOptimizations.clear();
    }
};
ModelOptimizationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService])
], ModelOptimizationService);
exports.ModelOptimizationService = ModelOptimizationService;
//# sourceMappingURL=ModelOptimizationService.js.map