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
exports.ModelBenchmarkManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelBenchmarkManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelBenchmarkManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelBenchmarkManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        benchmarkCache = new Map();
        outputChannel;
        isRunning = false;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Benchmarks');
        }
        async runBenchmark(model, options = {}) {
            if (this.isRunning) {
                throw new Error('Benchmark already in progress');
            }
            try {
                this.isRunning = true;
                this.emit('benchmarkStarted', model.id);
                const { promptSizes = [128, 512, 1024], iterations = 5, warmupRuns = 2, timeoutMs = 30000 } = options;
                // Run warmup to stabilize performance
                for (let i = 0; i < warmupRuns; i++) {
                    await this.runSingleIteration(model, 256);
                }
                const metrics = await this.collectBenchmarkMetrics(model, promptSizes, iterations, timeoutMs);
                const result = {
                    modelId: model.id,
                    timestamp: Date.now(),
                    metrics,
                    systemInfo: await this.getSystemInfo()
                };
                this.benchmarkCache.set(model.id, result);
                this.logBenchmarkResult(result);
                this.emit('benchmarkCompleted', result);
                return result;
            }
            catch (error) {
                this.handleError('Failed to run benchmark', error);
                throw error;
            }
            finally {
                this.isRunning = false;
            }
        }
        async collectBenchmarkMetrics(model, promptSizes, iterations, timeoutMs) {
            const metrics = {
                averageLatency: 0,
                p95Latency: 0,
                maxRss: 0,
                tokensPerSecond: 0,
                promptSizeMetrics: new Map()
            };
            for (const size of promptSizes) {
                const latencies = [];
                const memoryUsage = [];
                const tokenRates = [];
                for (let i = 0; i < iterations; i++) {
                    const iterationMetrics = await this.runSingleIteration(model, size, timeoutMs);
                    latencies.push(iterationMetrics.latency);
                    memoryUsage.push(iterationMetrics.memoryUsage);
                    tokenRates.push(iterationMetrics.tokensPerSecond);
                    this.emit('iterationCompleted', {
                        modelId: model.id,
                        size,
                        iteration: i + 1,
                        metrics: iterationMetrics
                    });
                }
                metrics.promptSizeMetrics.set(size, {
                    avgLatency: this.calculateAverage(latencies),
                    p95Latency: this.calculateP95(latencies),
                    avgMemoryUsage: this.calculateAverage(memoryUsage),
                    avgTokensPerSecond: this.calculateAverage(tokenRates)
                });
            }
            // Calculate aggregate metrics
            metrics.averageLatency = this.calculateOverallAverage(Array.from(metrics.promptSizeMetrics.values()), m => m.avgLatency);
            metrics.p95Latency = this.calculateOverallP95(Array.from(metrics.promptSizeMetrics.values()), m => m.avgLatency);
            metrics.maxRss = process.memoryUsage().heapUsed;
            metrics.tokensPerSecond = this.calculateOverallAverage(Array.from(metrics.promptSizeMetrics.values()), m => m.avgTokensPerSecond);
            return metrics;
        }
        async runSingleIteration(model, promptSize, timeoutMs = 30000) {
            const prompt = 'A'.repeat(promptSize);
            const startTime = process.hrtime();
            const startMem = process.memoryUsage().heapUsed;
            try {
                // Run model inference with timeout
                await Promise.race([
                    model.provider.generateText(prompt),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Benchmark timeout')), timeoutMs))
                ]);
                const [seconds, nanoseconds] = process.hrtime(startTime);
                const latency = seconds * 1000 + nanoseconds / 1000000;
                const memoryUsage = process.memoryUsage().heapUsed - startMem;
                const tokensPerSecond = promptSize / (latency / 1000);
                return { latency, memoryUsage, tokensPerSecond };
            }
            catch (error) {
                this.handleError('Failed to run iteration', error);
                throw error;
            }
        }
        getLastBenchmark(modelId) {
            return this.benchmarkCache.get(modelId);
        }
        clearBenchmarks() {
            this.benchmarkCache.clear();
            this.emit('benchmarksCleared');
        }
        async getSystemInfo() {
            return {
                platform: process.platform,
                cpuCores: require('os').cpus().length,
                totalMemory: require('os').totalmem(),
                nodeVersion: process.version,
                timestamp: Date.now()
            };
        }
        calculateAverage(numbers) {
            return numbers.reduce((a, b) => a + b, 0) / numbers.length;
        }
        calculateP95(numbers) {
            const sorted = [...numbers].sort((a, b) => a - b);
            const index = Math.ceil(numbers.length * 0.95) - 1;
            return sorted[index];
        }
        calculateOverallAverage(items, selector) {
            return this.calculateAverage(items.map(selector));
        }
        calculateOverallP95(items, selector) {
            return this.calculateP95(items.map(selector));
        }
        logBenchmarkResult(result) {
            this.outputChannel.appendLine('\nBenchmark Results:');
            this.outputChannel.appendLine(`Model: ${result.modelId}`);
            this.outputChannel.appendLine(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
            this.outputChannel.appendLine('\nAggregate Metrics:');
            this.outputChannel.appendLine(`Average Latency: ${result.metrics.averageLatency.toFixed(2)}ms`);
            this.outputChannel.appendLine(`P95 Latency: ${result.metrics.p95Latency.toFixed(2)}ms`);
            this.outputChannel.appendLine(`Max RSS: ${(result.metrics.maxRss / 1024 / 1024).toFixed(2)}MB`);
            this.outputChannel.appendLine(`Tokens/Second: ${result.metrics.tokensPerSecond.toFixed(2)}`);
            this.outputChannel.appendLine('\nDetailed Metrics by Prompt Size:');
            result.metrics.promptSizeMetrics.forEach((metrics, size) => {
                this.outputChannel.appendLine(`\nPrompt Size: ${size} chars`);
                this.outputChannel.appendLine(`  Avg Latency: ${metrics.avgLatency.toFixed(2)}ms`);
                this.outputChannel.appendLine(`  P95 Latency: ${metrics.p95Latency.toFixed(2)}ms`);
                this.outputChannel.appendLine(`  Avg Memory: ${(metrics.avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
                this.outputChannel.appendLine(`  Tokens/Second: ${metrics.avgTokensPerSecond.toFixed(2)}`);
            });
            this.outputChannel.appendLine('\nSystem Info:');
            this.outputChannel.appendLine(`Platform: ${result.systemInfo.platform}`);
            this.outputChannel.appendLine(`CPU Cores: ${result.systemInfo.cpuCores}`);
            this.outputChannel.appendLine(`Total Memory: ${(result.systemInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB`);
            this.outputChannel.appendLine(`Node Version: ${result.systemInfo.nodeVersion}`);
        }
        handleError(message, error) {
            this.logger.error('[ModelBenchmarkManager]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.benchmarkCache.clear();
        }
    };
    return ModelBenchmarkManager = _classThis;
})();
exports.ModelBenchmarkManager = ModelBenchmarkManager;
//# sourceMappingURL=ModelBenchmarkManager.js.map