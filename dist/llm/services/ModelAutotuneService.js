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
exports.ModelAutotuneService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelAutotuneService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelAutotuneService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelAutotuneService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsManager;
        benchmarkManager;
        performanceAnalyzer;
        tuningHistory = new Map();
        activeTuning = new Set();
        outputChannel;
        constructor(logger, metricsManager, benchmarkManager, performanceAnalyzer) {
            super();
            this.logger = logger;
            this.metricsManager = metricsManager;
            this.benchmarkManager = benchmarkManager;
            this.performanceAnalyzer = performanceAnalyzer;
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
                timestamp: Date.now(),
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
    return ModelAutotuneService = _classThis;
})();
exports.ModelAutotuneService = ModelAutotuneService;
//# sourceMappingURL=ModelAutotuneService.js.map