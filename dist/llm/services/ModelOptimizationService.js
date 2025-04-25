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
exports.ModelOptimizationService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
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
        metricsManager;
        performanceAnalyzer;
        benchmarkManager;
        optimizationHistory = new Map();
        activeOptimizations = new Set();
        outputChannel;
        constructor(logger, metricsManager, performanceAnalyzer, benchmarkManager) {
            super();
            this.logger = logger;
            this.metricsManager = metricsManager;
            this.performanceAnalyzer = performanceAnalyzer;
            this.benchmarkManager = benchmarkManager;
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
                timestamp: Date.now(),
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
                timestamp: Date.now()
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
    return ModelOptimizationService = _classThis;
})();
exports.ModelOptimizationService = ModelOptimizationService;
//# sourceMappingURL=ModelOptimizationService.js.map