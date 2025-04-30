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
exports.ModelPerformanceTestService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const ModelMetricsManager_1 = require("./ModelMetricsManager");
const ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
const ModelBenchmarkManager_1 = require("./ModelBenchmarkManager");
let ModelPerformanceTestService = class ModelPerformanceTestService extends events_1.EventEmitter {
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
exports.ModelPerformanceTestService = ModelPerformanceTestService;
exports.ModelPerformanceTestService = ModelPerformanceTestService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
    __param(2, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
    __param(3, (0, inversify_1.inject)(ModelBenchmarkManager_1.ModelBenchmarkManager)),
    __metadata("design:paramtypes", [Object, ModelMetricsManager_1.ModelMetricsManager,
        ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer,
        ModelBenchmarkManager_1.ModelBenchmarkManager])
], ModelPerformanceTestService);
//# sourceMappingURL=ModelPerformanceTestService.js.map