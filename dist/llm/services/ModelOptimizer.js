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
exports.ModelOptimizer = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
/**
 * Service for optimizing model performance and resource usage
 */
let ModelOptimizer = class ModelOptimizer extends events_1.EventEmitter {
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
ModelOptimizer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
], ModelOptimizer);
exports.ModelOptimizer = ModelOptimizer;
//# sourceMappingURL=ModelOptimizer.js.map