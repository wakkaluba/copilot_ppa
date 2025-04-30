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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelAutotuneManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
const ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
let ModelAutotuneManager = class ModelAutotuneManager extends events_1.EventEmitter {
    logger;
    benchmarkManager;
    outputChannel;
    optimizationCache = new Map();
    isRunning = false;
    constructor(logger, benchmarkManager) {
        super();
        this.logger = logger;
        this.benchmarkManager = benchmarkManager;
        this.outputChannel = vscode.window.createOutputChannel('Model Autotuning');
    }
    async optimizeModel(model, config = {}) {
        if (this.isRunning) {
            throw new Error('Optimization already in progress');
        }
        try {
            this.isRunning = true;
            this.emit('optimizationStarted', model.id);
            const { maxIterations = 10, convergenceThreshold = 0.01, targetMetric = 'tokensPerSecond', parameterRanges = this.getDefaultParameterRanges(model) } = config;
            let bestParams = { ...model.config };
            let bestScore = await this.evaluateConfiguration(model, bestParams);
            for (let i = 0; i < maxIterations; i++) {
                const candidateParams = this.generateNextParameters(bestParams, parameterRanges, i / maxIterations);
                const score = await this.evaluateConfiguration(model, candidateParams);
                if (score > bestScore * (1 + convergenceThreshold)) {
                    bestParams = candidateParams;
                    bestScore = score;
                    this.emit('betterConfigurationFound', {
                        modelId: model.id,
                        params: bestParams,
                        score: bestScore
                    });
                }
                this.emit('iterationCompleted', {
                    modelId: model.id,
                    iteration: i + 1,
                    currentScore: score,
                    bestScore
                });
            }
            const result = {
                modelId: model.id,
                timestamp: new Date(),
                bestConfiguration: bestParams,
                score: bestScore,
                metrics: await this.gatherOptimizationMetrics(model, bestParams)
            };
            this.optimizationCache.set(model.id, result);
            this.logOptimizationResult(result);
            this.emit('optimizationCompleted', result);
            return result;
        }
        catch (error) {
            this.handleError('Failed to optimize model', error);
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    async evaluateConfiguration(model, params) {
        // Run benchmarks with the given parameters
        const benchmarkResult = await this.benchmarkManager.runBenchmark({ ...model, config: params }, { iterations: 3, warmupRuns: 1 });
        return benchmarkResult.metrics.tokensPerSecond;
    }
    generateNextParameters(currentParams, ranges, progress) {
        const newParams = { ...currentParams };
        const explorationFactor = Math.max(0.1, 1 - progress); // Reduce exploration over time
        for (const [param, [min, max]] of ranges.entries()) {
            const range = max - min;
            const mutation = (Math.random() - 0.5) * range * explorationFactor;
            newParams[param] = Math.max(min, Math.min(max, currentParams[param] + mutation));
        }
        return newParams;
    }
    getDefaultParameterRanges(model) {
        const ranges = new Map();
        ranges.set('temperature', [0.1, 1.0]);
        ranges.set('topP', [0.1, 1.0]);
        ranges.set('frequencyPenalty', [-2.0, 2.0]);
        ranges.set('presencePenalty', [-2.0, 2.0]);
        if (model.config.maxTokens) {
            const maxContextSize = model.contextLength || 4096;
            ranges.set('maxTokens', [256, maxContextSize]);
        }
        return ranges;
    }
    async gatherOptimizationMetrics(model, params) {
        const benchmark = await this.benchmarkManager.runBenchmark({ ...model, config: params }, { iterations: 5, warmupRuns: 2 });
        return {
            averageLatency: benchmark.metrics.averageLatency,
            p95Latency: benchmark.metrics.p95Latency,
            tokensPerSecond: benchmark.metrics.tokensPerSecond,
            memoryUsage: benchmark.metrics.maxRss,
            timestamp: new Date()
        };
    }
    getLastOptimization(modelId) {
        return this.optimizationCache.get(modelId);
    }
    clearOptimizations() {
        this.optimizationCache.clear();
        this.emit('optimizationsCleared');
    }
    logOptimizationResult(result) {
        this.outputChannel.appendLine('\nOptimization Results:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
        this.outputChannel.appendLine(`Best Score: ${result.score.toFixed(2)}`);
        this.outputChannel.appendLine('\nOptimized Configuration:');
        Object.entries(result.bestConfiguration).forEach(([key, value]) => {
            this.outputChannel.appendLine(`${key}: ${value}`);
        });
        this.outputChannel.appendLine('\nPerformance Metrics:');
        this.outputChannel.appendLine(`Average Latency: ${result.metrics.averageLatency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`P95 Latency: ${result.metrics.p95Latency.toFixed(2)}ms`);
        this.outputChannel.appendLine(`Tokens/Second: ${result.metrics.tokensPerSecond.toFixed(2)}`);
        this.outputChannel.appendLine(`Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    handleError(message, error) {
        this.logger.error('[ModelAutotuneManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.optimizationCache.clear();
    }
};
exports.ModelAutotuneManager = ModelAutotuneManager;
exports.ModelAutotuneManager = ModelAutotuneManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelBenchmarkManager_1.ModelBenchmarkManager])
], ModelAutotuneManager);
//# sourceMappingURL=ModelAutotuneManager.js.map