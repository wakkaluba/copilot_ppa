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
exports.ModelBenchmarkManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let ModelBenchmarkManager = class ModelBenchmarkManager extends events_1.EventEmitter {
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
                timestamp: new Date(),
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
            timestamp: new Date()
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
exports.ModelBenchmarkManager = ModelBenchmarkManager;
exports.ModelBenchmarkManager = ModelBenchmarkManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
], ModelBenchmarkManager);
//# sourceMappingURL=ModelBenchmarkManager.js.map