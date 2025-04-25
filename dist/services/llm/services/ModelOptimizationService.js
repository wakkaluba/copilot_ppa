"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelOptimizationService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const events_1 = require("events");
let ModelOptimizationService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelOptimizationService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelOptimizationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsService;
        optimizationHistory = new Map();
        activeOptimizations = new Set();
        constructor(logger, metricsService) {
            super();
            this.logger = logger;
            this.metricsService = metricsService;
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
                timestamp: Date.now(),
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
                        timestamp: Date.now(),
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
    return ModelOptimizationService = _classThis;
})();
exports.ModelOptimizationService = ModelOptimizationService;
//# sourceMappingURL=ModelOptimizationService.js.map