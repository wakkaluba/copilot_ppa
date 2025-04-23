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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelAutotuneManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelAutotuneManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelAutotuneManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelAutotuneManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                    timestamp: Date.now(),
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
                timestamp: Date.now()
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
    return ModelAutotuneManager = _classThis;
})();
exports.ModelAutotuneManager = ModelAutotuneManager;
//# sourceMappingURL=ModelAutotuneManager.js.map