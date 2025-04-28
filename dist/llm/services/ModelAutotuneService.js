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
exports.ModelAutotuneService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const ModelMetricsManager_1 = require("./ModelMetricsManager");
const ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
const ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
let ModelAutotuneService = class ModelAutotuneService extends events_1.EventEmitter {
    constructor(logger, metricsManager, benchmarkManager, performanceAnalyzer) {
        super();
        this.logger = logger;
        this.metricsManager = metricsManager;
        this.benchmarkManager = benchmarkManager;
        this.performanceAnalyzer = performanceAnalyzer;
        this.tuningHistory = new Map();
        this.activeTuning = new Set();
        this.outputChannel = vscode.window.createOutputChannel('Model Auto-tuning');
    }
    async startAutotuning(modelId) {
        if (this.activeTuning.has(modelId)) {
            throw new Error('Auto-tuning already in progress');
        }
        try {
            this.activeTuning.add(modelId);
            this.emit('autotuningStarted', { modelId });
            await this.runAutotuningCycle(modelId);
        }
        catch (error) {
            this.handleError(`Auto-tuning failed for model ${modelId}`, error);
            throw error;
        }
        finally {
            this.activeTuning.delete(modelId);
        }
    }
    async runAutotuningCycle(modelId) {
        const baseMetrics = await this.gatherBaselineMetrics(modelId);
        const parameterRanges = this.defineParameterSpace(baseMetrics);
        let currentParams = this.getCurrentParameters(modelId);
        for (let i = 0; i < 10; i++) { // Run 10 optimization iterations
            const candidateParams = this.generateNextParameters(currentParams, parameterRanges, i / 10);
            const result = await this.evaluateParameters(modelId, candidateParams);
            if (this.isBetterResult(result, this.getBestResult(modelId))) {
                currentParams = candidateParams;
                this.recordTuningResult(result);
                this.emit('betterParametersFound', result);
            }
            this.emit('iterationCompleted', {
                modelId,
                iteration: i + 1,
                currentParams,
                metrics: result.metrics
            });
        }
    }
    async gatherBaselineMetrics(modelId) {
        const metrics = await this.metricsManager.getLatestMetrics(modelId);
        if (!metrics) {
            throw new Error('No baseline metrics available');
        }
        return metrics;
    }
    defineParameterSpace(baseMetrics) {
        const ranges = new Map();
        ranges.set('temperature', [0.1, 1.0]);
        ranges.set('topP', [0.1, 1.0]);
        ranges.set('maxTokens', [256, 4096]);
        ranges.set('frequencyPenalty', [-2.0, 2.0]);
        ranges.set('presencePenalty', [-2.0, 2.0]);
        return ranges;
    }
    generateNextParameters(current, ranges, progress) {
        const params = { ...current };
        const explorationFactor = Math.max(0.1, 1 - progress);
        for (const [param, [min, max]] of ranges.entries()) {
            const range = max - min;
            const mutation = (Math.random() - 0.5) * range * explorationFactor;
            params[param] = Math.max(min, Math.min(max, (current[param] || (min + max) / 2) + mutation));
        }
        return params;
    }
    async evaluateParameters(modelId, parameters) {
        const benchmark = await this.benchmarkManager.runBenchmark({ id: modelId, parameters }, { iterations: 3, warmupRuns: 1 });
        return {
            modelId,
            timestamp: new Date(),
            parameters,
            metrics: {
                latency: benchmark.metrics.averageLatency,
                throughput: benchmark.metrics.tokensPerSecond,
                errorRate: 0, // Would come from error tracking
                memoryUsage: benchmark.metrics.maxRss
            },
            confidence: this.calculateConfidence(benchmark.metrics)
        };
    }
    calculateConfidence(metrics) {
        // Normalize and weight different metrics
        const latencyScore = Math.max(0, 1 - metrics.averageLatency / 1000);
        const throughputScore = Math.min(metrics.tokensPerSecond / 100, 1);
        return (latencyScore * 0.4 + throughputScore * 0.6);
    }
    isBetterResult(current, previous) {
        if (!previous)
            return true;
        return current.confidence > previous.confidence;
    }
    getBestResult(modelId) {
        const history = this.tuningHistory.get(modelId) || [];
        return history.length > 0 ? history[history.length - 1] : undefined;
    }
    recordTuningResult(result) {
        const history = this.tuningHistory.get(result.modelId) || [];
        history.push(result);
        this.tuningHistory.set(result.modelId, history);
        this.logTuningResult(result);
    }
    getCurrentParameters(modelId) {
        const lastResult = this.getBestResult(modelId);
        return lastResult?.parameters || {
            temperature: 0.7,
            topP: 1.0,
            maxTokens: 2048,
            frequencyPenalty: 0,
            presencePenalty: 0
        };
    }
    logTuningResult(result) {
        this.outputChannel.appendLine('\nTuning Result:');
        this.outputChannel.appendLine(`Model: ${result.modelId}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
        this.outputChannel.appendLine(`Confidence: ${result.confidence.toFixed(4)}`);
        this.outputChannel.appendLine('\nParameters:');
        Object.entries(result.parameters).forEach(([key, value]) => {
            this.outputChannel.appendLine(`${key}: ${value}`);
        });
        this.outputChannel.appendLine('\nMetrics:');
        Object.entries(result.metrics).forEach(([key, value]) => {
            this.outputChannel.appendLine(`${key}: ${value}`);
        });
    }
    handleError(message, error) {
        this.logger.error(message, error);
        this.emit('error', { message, error });
    }
    dispose() {
        this.outputChannel.dispose();
        this.tuningHistory.clear();
        this.activeTuning.clear();
        this.removeAllListeners();
    }
};
exports.ModelAutotuneService = ModelAutotuneService;
exports.ModelAutotuneService = ModelAutotuneService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
    __param(2, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
    __param(3, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
    __metadata("design:paramtypes", [Object, ModelMetricsManager_1.ModelMetricsManager,
        ModelBenchmarkManager_1.ModelBenchmarkManager,
        ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer])
], ModelAutotuneService);
//# sourceMappingURL=ModelAutotuneService.js.map