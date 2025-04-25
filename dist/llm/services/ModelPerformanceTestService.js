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
exports.ModelPerformanceTestService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelPerformanceTestService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelPerformanceTestService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelPerformanceTestService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsManager;
        performanceAnalyzer;
        benchmarkManager;
        testResults = new Map();
        outputChannel;
        isRunning = false;
        constructor(logger, metricsManager, performanceAnalyzer, benchmarkManager) {
            super();
            this.logger = logger;
            this.metricsManager = metricsManager;
            this.performanceAnalyzer = performanceAnalyzer;
            this.benchmarkManager = benchmarkManager;
            this.outputChannel = vscode.window.createOutputChannel('Model Performance Tests');
        }
        async runTestScenario(modelId, scenario) {
            if (this.isRunning) {
                throw new Error('Test already in progress');
            }
            try {
                this.isRunning = true;
                this.emit('testStarted', { modelId, scenario });
                const result = {
                    scenarioName: scenario.name,
                    metrics: {
                        averageLatency: 0,
                        p95Latency: 0,
                        successRate: 0,
                        tokensPerSecond: 0,
                        memoryUsage: 0
                    },
                    timestamps: [],
                    errors: []
                };
                const latencies = [];
                const tokenRates = [];
                let successCount = 0;
                // Warm up runs
                await this.runWarmup(modelId, scenario);
                // Main test runs
                for (let i = 0; i < scenario.config.repetitions; i++) {
                    for (const prompt of scenario.prompts) {
                        try {
                            const startTime = process.hrtime();
                            const startMem = process.memoryUsage().heapUsed;
                            // Run model inference with timeout
                            const response = await Promise.race([
                                this.performanceAnalyzer.analyzeModelResponse(modelId, prompt, scenario.config),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), scenario.config.timeoutMs))
                            ]);
                            const [seconds, nanoseconds] = process.hrtime(startTime);
                            const latency = seconds * 1000 + nanoseconds / 1000000;
                            const memoryUsed = process.memoryUsage().heapUsed - startMem;
                            latencies.push(latency);
                            tokenRates.push(response.tokens / (latency / 1000));
                            result.timestamps.push(Date.now());
                            if (this.validateResponse(response.content, scenario.expectedPatterns)) {
                                successCount++;
                            }
                            this.emit('iterationCompleted', {
                                modelId,
                                scenario: scenario.name,
                                iteration: i + 1,
                                latency,
                                memoryUsed,
                                success: true
                            });
                        }
                        catch (error) {
                            result.errors.push(error);
                            this.handleError('Test iteration failed', error);
                            this.emit('iterationCompleted', {
                                modelId,
                                scenario: scenario.name,
                                iteration: i + 1,
                                success: false,
                                error
                            });
                        }
                    }
                }
                // Calculate final metrics
                const totalIterations = scenario.config.repetitions * scenario.prompts.length;
                result.metrics = {
                    averageLatency: this.calculateAverage(latencies),
                    p95Latency: this.calculateP95(latencies),
                    successRate: (successCount / totalIterations) * 100,
                    tokensPerSecond: this.calculateAverage(tokenRates),
                    memoryUsage: process.memoryUsage().heapUsed
                };
                // Store and log results
                this.testResults.get(modelId)?.push(result) ?? this.testResults.set(modelId, [result]);
                this.logTestResult(modelId, result);
                this.emit('testCompleted', { modelId, scenario, result });
                return result;
            }
            catch (error) {
                this.handleError('Test scenario failed', error);
                throw error;
            }
            finally {
                this.isRunning = false;
            }
        }
        async runWarmup(modelId, scenario) {
            const warmupRuns = 2;
            const warmupPrompt = scenario.prompts[0];
            for (let i = 0; i < warmupRuns; i++) {
                try {
                    await this.performanceAnalyzer.analyzeModelResponse(modelId, warmupPrompt, scenario.config);
                }
                catch (error) {
                    this.logger.warn('Warmup run failed', error);
                }
            }
        }
        validateResponse(content, patterns) {
            if (!patterns || patterns.length === 0) {
                return true;
            }
            return patterns.some(pattern => pattern.test(content));
        }
        calculateAverage(numbers) {
            return numbers.reduce((a, b) => a + b, 0) / numbers.length;
        }
        calculateP95(numbers) {
            const sorted = [...numbers].sort((a, b) => a - b);
            const index = Math.ceil(numbers.length * 0.95) - 1;
            return sorted[index];
        }
        logTestResult(modelId, result) {
            this.outputChannel.appendLine('\nTest Results:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(`Scenario: ${result.scenarioName}`);
            this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
            this.outputChannel.appendLine('\nMetrics:');
            this.outputChannel.appendLine(`Average Latency: ${result.metrics.averageLatency.toFixed(2)}ms`);
            this.outputChannel.appendLine(`P95 Latency: ${result.metrics.p95Latency.toFixed(2)}ms`);
            this.outputChannel.appendLine(`Success Rate: ${result.metrics.successRate.toFixed(2)}%`);
            this.outputChannel.appendLine(`Tokens/Second: ${result.metrics.tokensPerSecond.toFixed(2)}`);
            this.outputChannel.appendLine(`Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
            if (result.errors.length > 0) {
                this.outputChannel.appendLine('\nErrors:');
                result.errors.forEach(error => {
                    this.outputChannel.appendLine(`- ${error.message}`);
                });
            }
        }
        handleError(message, error) {
            this.logger.error(message, error);
            this.emit('error', { message, error });
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        getTestResults(modelId) {
            return this.testResults.get(modelId) || [];
        }
        clearTestResults(modelId) {
            if (modelId) {
                this.testResults.delete(modelId);
            }
            else {
                this.testResults.clear();
            }
            this.emit('resultsCleared', { modelId });
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.testResults.clear();
        }
    };
    return ModelPerformanceTestService = _classThis;
})();
exports.ModelPerformanceTestService = ModelPerformanceTestService;
//# sourceMappingURL=ModelPerformanceTestService.js.map