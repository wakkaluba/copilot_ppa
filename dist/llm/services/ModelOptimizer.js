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
exports.ModelOptimizer = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
/**
 * Service for optimizing model performance and resource usage
 */
let ModelOptimizer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelOptimizer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelOptimizer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        constructor(logger) {
            super();
            this.logger = logger;
            this.logger.info('ModelOptimizer initialized');
        }
        /**
         * Optimize a model based on current metrics
         */
        async optimizeModel(modelId, currentMetrics) {
            try {
                this.logger.info(`Starting optimization for model ${modelId}`);
                // Validate input
                if (!modelId) {
                    throw new Error('Model ID is required');
                }
                if (!currentMetrics) {
                    throw new Error('Current metrics are required for optimization');
                }
                // Analyze metrics and generate optimization recommendations
                const result = this.analyzeMetrics(modelId, currentMetrics);
                if (result.success) {
                    this.emit('optimization.success', {
                        modelId,
                        recommendations: result.recommendations
                    });
                    this.logger.info(`Model ${modelId} optimization successful`, result);
                }
                else {
                    this.emit('optimization.failure', {
                        modelId,
                        error: result.error
                    });
                    this.logger.warn(`Model ${modelId} optimization failed: ${result.error}`);
                }
                return result;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Error optimizing model ${modelId}`, error);
                this.emit('optimization.error', { modelId, error });
                return {
                    success: false,
                    modelId,
                    metrics: {
                        latency: 0,
                        throughput: 0,
                        errorRate: 0,
                        costEfficiency: 0
                    },
                    recommendations: {},
                    error: errorMessage
                };
            }
        }
        /**
         * Analyze metrics and generate optimization recommendations
         */
        analyzeMetrics(modelId, metrics) {
            try {
                // Extract metrics
                const responseTime = metrics.averageResponseTime || 0;
                const throughput = metrics.requestRate || 0;
                const errorRate = metrics.errorRate || 0;
                // Default result
                const result = {
                    success: true,
                    modelId,
                    metrics: {
                        latency: responseTime,
                        throughput,
                        errorRate,
                        costEfficiency: this.calculateCostEfficiency(responseTime, throughput, errorRate)
                    },
                    recommendations: {}
                };
                // High latency optimization
                if (responseTime > 500) {
                    result.recommendations.batchSize = Math.max(1, Math.floor((responseTime / 500) * 4));
                    result.recommendations.maxTokens = 1024;
                    result.recommendations.quantization = 'int8';
                }
                // Low latency, can potentially improve quality
                else if (responseTime < 100) {
                    result.recommendations.temperature = 0.7;
                    result.recommendations.topP = 0.9;
                }
                // Error rate optimization
                if (errorRate > 0.05) {
                    result.recommendations.temperature = 0.3;
                    result.recommendations.maxTokens = 2048;
                }
                // Throughput optimization
                if (throughput > 100) {
                    result.recommendations.batchSize = 8;
                    result.recommendations.quantization = 'int8';
                    result.recommendations.pruning = 0.3;
                }
                return result;
            }
            catch (error) {
                this.logger.error(`Error analyzing metrics for model ${modelId}`, error);
                return {
                    success: false,
                    modelId,
                    metrics: {
                        latency: 0,
                        throughput: 0,
                        errorRate: 0,
                        costEfficiency: 0
                    },
                    recommendations: {},
                    error: error instanceof Error ? error.message : 'Unknown error during metrics analysis'
                };
            }
        }
        /**
         * Calculate cost efficiency score
         */
        calculateCostEfficiency(latency, throughput, errorRate) {
            // Simple cost efficiency formula: throughput / (latency * (1 + errorRate))
            // Higher is better, normalized to 0-100 scale
            if (latency <= 0 || throughput <= 0) {
                return 0;
            }
            const rawScore = throughput / (latency * (1 + errorRate));
            return Math.min(100, Math.max(0, rawScore * 100));
        }
        /**
         * Dispose of resources
         */
        dispose() {
            this.removeAllListeners();
            this.logger.info('ModelOptimizer disposed');
        }
    };
    return ModelOptimizer = _classThis;
})();
exports.ModelOptimizer = ModelOptimizer;
//# sourceMappingURL=ModelOptimizer.js.map