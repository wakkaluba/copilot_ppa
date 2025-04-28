"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelOptimizationService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const ModelMetricsManager_1 = require("./ModelMetricsManager");
const ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
const ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
let ModelOptimizationService = class ModelOptimizationService extends events_1.EventEmitter {
    constructor(logger, metricsManager, performanceAnalyzer, benchmarkManager) {
        super();
        this.logger = logger;
        this.metricsManager = metricsManager;
        this.performanceAnalyzer = performanceAnalyzer;
        this.benchmarkManager = benchmarkManager;
        this.optimizationHistory = new Map();
        this.activeOptimizations = new Set();
        this.outputChannel = vscode.window.createOutputChannel('Model Optimization');
    }
    async optimizeModel(modelId, currentMetrics) {
        if (this.activeOptimizations.has(modelId)) {
            throw new Error('Optimization already in progress');
        }
        try {
            this.activeOptimizations.add(modelId);
            this.emit('optimizationStarted', { modelId, metrics: currentMetrics });
            const strategy = await this.determineOptimizationStrategy(modelId, currentMetrics);
            const result = await this.applyOptimization(modelId, strategy, currentMetrics);
            this.trackOptimizationResult(modelId, result);
            return result;
        }
        catch (error) {
            this.handleError('Failed to optimize model', error);
            throw error;
        }
        finally {
            this.activeOptimizations.delete(modelId);
        }
    }
    async determineOptimizationStrategy(modelId, metrics) {
        const strategies = await this.generateOptimizationStrategies(metrics);
        return this.selectBestStrategy(strategies, metrics);
    }
    async generateOptimizationStrategies(metrics) {
        const strategies = [];
        // Memory optimization strategy
        if (metrics.memoryUsage > 85) {
            strategies.push({
                name: 'Memory Optimization',
                description: 'Reduce memory usage through batch size and context length adjustments',
                priority: metrics.memoryUsage > 90 ? 1 : 2,
                parameters: {
                    batchSize: this.calculateOptimalBatchSize(metrics),
                    memoryLimit: this.calculateOptimalMemoryLimit(metrics),
                    maxContextLength: this.calculateOptimalContextLength(metrics)
                }
            });
        }
        // Throughput optimization strategy
        if (metrics.throughput < this.getTargetThroughput()) {
            strategies.push({
                name: 'Throughput Optimization',
                description: 'Improve processing speed through parallel processing and caching',
                priority: 2,
                parameters: {
                    threads: this.calculateOptimalThreads(metrics),
                    batchSize: this.calculateOptimalBatchSize(metrics) * 1.2
                }
            });
        }
        // GPU utilization strategy
        if (metrics.gpuUsage !== undefined && metrics.gpuUsage < 60) {
            strategies.push({
                name: 'GPU Optimization',
                description: 'Improve GPU utilization for better performance',
                priority: 3,
                parameters: {
                    gpuMemoryLimit: this.calculateOptimalGpuMemory(metrics),
                    batchSize: this.calculateOptimalBatchSize(metrics) * 1.5
                }
            });
        }
        return strategies;
    }
    selectBestStrategy(strategies, metrics) {
        return strategies.sort((a, b) => {
            // Sort by priority first
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            // Then by expected impact
            return this.calculateExpectedImpact(b, metrics) - this.calculateExpectedImpact(a, metrics);
        })[0];
    }
    calculateExpectedImpact(strategy, metrics) {
        let impact = 0;
        if (strategy.parameters.batchSize) {
            impact += 0.3 * (1 - metrics.throughput / this.getTargetThroughput());
        }
        if (strategy.parameters.threads) {
            impact += 0.3 * (1 - metrics.cpuUsage / 100);
        }
        if (strategy.parameters.memoryLimit) {
            impact += 0.4 * (metrics.memoryUsage / 100);
        }
        return impact;
    }
    async applyOptimization(modelId, strategy, currentMetrics) {
        this.logOptimizationStrategy(strategy);
        // Apply the optimization parameters
        await this.benchmarkManager.configureModel(modelId, strategy.parameters);
        // Measure the impact
        const newMetrics = await this.gatherMetrics(modelId);
        const improvements = this.calculateImprovements(currentMetrics, newMetrics);
        return {
            modelId,
            timestamp: new Date(),
            strategy,
            metrics: newMetrics,
            improvements,
            confidence: this.calculateConfidence(improvements)
        };
    }
    getTargetThroughput() {
        return 100; // tokens/second - would be configurable in practice
    }
    calculateOptimalBatchSize(metrics) {
        const baseBatch = Math.ceil(1000 / metrics.latency);
        return Math.min(Math.max(baseBatch, 1), 32);
    }
    calculateOptimalMemoryLimit(metrics) {
        return Math.floor(metrics.memoryUsage * 0.8); // 80% of current usage
    }
    calculateOptimalContextLength(metrics) {
        const baseContext = 2048;
        const memoryFactor = 1 - (metrics.memoryUsage / 100);
        return Math.floor(baseContext * memoryFactor);
    }
    calculateOptimalThreads(metrics) {
        const baseThreads = Math.ceil(metrics.cpuUsage / 25);
        return Math.min(Math.max(baseThreads, 1), 8);
    }
    calculateOptimalGpuMemory(metrics) {
        if (!metrics.gpuUsage) {
            return 0;
        }
        return Math.floor(metrics.gpuUsage * 0.9); // 90% of available GPU memory
    }
    async gatherMetrics(modelId) {
        const performance = await this.performanceAnalyzer.analyzeModel(modelId);
        const metrics = await this.metricsManager.getMetrics(modelId);
        return {
            latency: performance.averageLatency,
            throughput: performance.tokensPerSecond,
            memoryUsage: metrics.memoryUsage,
            cpuUsage: metrics.cpuUsage,
            gpuUsage: metrics.gpuUsage,
            errorRate: metrics.errorRate,
            timestamp: new Date()
        };
    }
    calculateImprovements(before, after) {
        return {
            latency: ((before.latency - after.latency) / before.latency) * 100,
            throughput: ((after.throughput - before.throughput) / before.throughput) * 100,
            memoryUsage: ((before.memoryUsage - after.memoryUsage) / before.memoryUsage) * 100,
            errorRate: ((before.errorRate - after.errorRate) / before.errorRate) * 100
        };
    }
    calculateConfidence(improvements) {
        const weights = {
            latency: 0.3,
            throughput: 0.3,
            memoryUsage: 0.2,
            errorRate: 0.2
        };
        let confidence = 0;
        let totalWeight = 0;
        for (const [metric, value] of Object.entries(improvements)) {
            if (value !== undefined) {
                confidence += (value * weights[metric]);
                totalWeight += weights[metric];
            }
        }
        return Math.max(0, Math.min(1, confidence / (totalWeight * 100)));
    }
    trackOptimizationResult(modelId, result) {
        const history = this.optimizationHistory.get(modelId) || [];
        history.push(result);
        this.optimizationHistory.set(modelId, history);
        this.logOptimizationResult(result);
        this.emit('optimizationCompleted', result);
    }
    logOptimizationStrategy(strategy) {
        this.outputChannel.appendLine('\nApplying Optimization Strategy:');
        this.outputChannel.appendLine(`Name: ${strategy.name}`);
        this.outputChannel.appendLine(`Description: ${strategy.description}`);
        this.outputChannel.appendLine(`Priority: ${strategy.priority}`);
        this.outputChannel.appendLine('Parameters:');
        Object.entries(strategy.parameters).forEach(([key, value]) => {
            this.outputChannel.appendLine(`  ${key}: ${value}`);
        });
    }
    logOptimizationResult(result) {
        this.outputChannel.appendLine('\nOptimization Result:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Strategy: ${result.strategy.name}`);
        this.outputChannel.appendLine('\nImprovements:');
        Object.entries(result.improvements).forEach(([metric, value]) => {
            if (value !== undefined) {
                this.outputChannel.appendLine(`${metric}: ${value.toFixed(2)}%`);
            }
        });
        this.outputChannel.appendLine(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
    }
    handleError(message, error) {
        this.logger.error('[ModelOptimizationService]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    getOptimizationHistory(modelId) {
        return this.optimizationHistory.get(modelId) || [];
    }
    clearOptimizationHistory(modelId) {
        if (modelId) {
            this.optimizationHistory.delete(modelId);
        }
        else {
            this.optimizationHistory.clear();
        }
    }
    dispose() {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.optimizationHistory.clear();
        this.activeOptimizations.clear();
    }
};
exports.ModelOptimizationService = ModelOptimizationService;
exports.ModelOptimizationService = ModelOptimizationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
    __param(2, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
    __param(3, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
    __metadata("design:paramtypes", [Object, ModelMetricsManager_1.ModelMetricsManager,
        ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer,
        ModelBenchmarkManager_1.ModelBenchmarkManager])
], ModelOptimizationService);
//# sourceMappingURL=ModelOptimizationService.js.map