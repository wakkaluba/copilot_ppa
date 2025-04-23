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
exports.ModelOptimizer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelOptimizer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelOptimizer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelOptimizer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        outputChannel;
        optimizationHistory = new Map();
        systemInfo;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Optimization');
        }
        async optimizeModel(modelId, currentMetrics) {
            try {
                await this.ensureSystemInfo();
                const result = await this.generateOptimization(modelId, currentMetrics);
                this.trackOptimizationResult(modelId, result);
                return result;
            }
            catch (error) {
                this.handleError('Failed to optimize model', error);
                throw error;
            }
        }
        async generateOptimization(modelId, metrics) {
            const history = this.optimizationHistory.get(modelId) || [];
            // Analyze performance patterns
            const patterns = this.analyzePerformancePatterns(metrics, history);
            // Generate optimization parameters
            const parameters = await this.generateOptimizedParameters(patterns);
            // Predict improvements
            const predictedMetrics = this.predictPerformanceMetrics(metrics, parameters);
            return {
                parameters,
                metrics: predictedMetrics,
                recommendation: this.generateRecommendation(patterns, parameters),
                confidence: this.calculateConfidence(patterns, history)
            };
        }
        analyzePerformancePatterns(metrics, history) {
            const patterns = {
                responseTimePattern: this.analyzeResponseTimePattern(metrics, history),
                throughputPattern: this.analyzeThroughputPattern(metrics, history),
                errorRatePattern: this.analyzeErrorRatePattern(metrics, history)
            };
            this.logPatternAnalysis(patterns);
            return patterns;
        }
        async generateOptimizedParameters(patterns) {
            const parameters = {};
            // Adjust batch size based on throughput pattern
            if (patterns.throughputPattern < 0.7) {
                parameters.batchSize = this.calculateOptimalBatchSize();
            }
            // Adjust context length based on response time pattern
            if (patterns.responseTimePattern > 1.2) {
                parameters.contextLength = this.calculateOptimalContextLength();
            }
            // Adjust cache size based on memory availability
            parameters.cacheSize = this.calculateOptimalCacheSize();
            return parameters;
        }
        predictPerformanceMetrics(current, parameters) {
            return {
                averageResponseTime: this.predictResponseTime(current.averageResponseTime, parameters),
                tokenThroughput: this.predictThroughput(current.tokenThroughput, parameters),
                errorRate: current.errorRate,
                totalRequests: current.totalRequests,
                totalTokens: current.totalTokens,
                lastUsed: current.lastUsed
            };
        }
        predictResponseTime(current, parameters) {
            let predicted = current;
            if (parameters.batchSize) {
                predicted *= 0.9; // Estimated 10% improvement
            }
            if (parameters.contextLength) {
                predicted *= 0.95; // Estimated 5% improvement
            }
            return predicted;
        }
        predictThroughput(current, parameters) {
            let predicted = current;
            if (parameters.batchSize) {
                predicted *= 1.2; // Estimated 20% improvement
            }
            if (parameters.cacheSize) {
                predicted *= 1.1; // Estimated 10% improvement
            }
            return predicted;
        }
        calculateOptimalBatchSize() {
            if (!this.systemInfo)
                return 1;
            // Calculate based on available memory and CPU cores
            const memoryFactor = this.systemInfo.totalMemoryGB / 8; // Base on 8GB reference
            const coreFactor = this.systemInfo.cpuCores / 4; // Base on 4 cores reference
            return Math.max(1, Math.min(32, Math.floor(Math.min(memoryFactor, coreFactor) * 8)));
        }
        calculateOptimalContextLength() {
            if (!this.systemInfo)
                return 2048;
            // Calculate based on available memory
            const memoryFactor = this.systemInfo.totalMemoryGB / 16; // Base on 16GB reference
            return Math.max(2048, Math.min(8192, Math.floor(memoryFactor * 4096)));
        }
        calculateOptimalCacheSize() {
            if (!this.systemInfo)
                return 1024;
            // Calculate based on available memory
            const memoryMB = this.systemInfo.totalMemoryGB * 1024;
            return Math.max(1024, Math.min(8192, Math.floor(memoryMB * 0.1))); // Use up to 10% of memory
        }
        generateRecommendation(patterns, parameters) {
            const recommendations = [];
            if (parameters.batchSize) {
                recommendations.push(`Adjust batch size to ${parameters.batchSize} for improved throughput`);
            }
            if (parameters.contextLength) {
                recommendations.push(`Set context length to ${parameters.contextLength} for better response times`);
            }
            if (parameters.cacheSize) {
                recommendations.push(`Configure cache size to ${parameters.cacheSize}MB for improved performance`);
            }
            return recommendations.join('. ');
        }
        calculateConfidence(patterns, history) {
            // Base confidence on pattern strength and history
            const patternConfidence = Object.values(patterns).reduce((acc, val) => acc + Math.abs(1 - val), 0) / 3;
            const historyConfidence = Math.min(1, history.length / 10); // Max confidence after 10 optimizations
            return (patternConfidence + historyConfidence) / 2;
        }
        analyzeResponseTimePattern(metrics, history) {
            if (history.length === 0)
                return 1;
            const previous = history[history.length - 1].metrics.averageResponseTime;
            return metrics.averageResponseTime / previous;
        }
        analyzeThroughputPattern(metrics, history) {
            if (history.length === 0)
                return 1;
            const previous = history[history.length - 1].metrics.tokenThroughput;
            return metrics.tokenThroughput / previous;
        }
        analyzeErrorRatePattern(metrics, history) {
            if (history.length === 0)
                return 1;
            const previous = history[history.length - 1].metrics.errorRate;
            return metrics.errorRate / previous;
        }
        async ensureSystemInfo() {
            if (this.systemInfo)
                return;
            this.systemInfo = await this.getSystemInfo();
        }
        async getSystemInfo() {
            return {
                totalMemoryGB: 16, // Example value
                freeDiskSpaceGB: 100, // Example value
                cpuCores: 8, // Example value
                cudaAvailable: false
            };
        }
        trackOptimizationResult(modelId, result) {
            const history = this.optimizationHistory.get(modelId) || [];
            history.push(result);
            this.optimizationHistory.set(modelId, history);
            this.logOptimizationResult(modelId, result);
        }
        logPatternAnalysis(patterns) {
            this.outputChannel.appendLine('\nPerformance Pattern Analysis:');
            Object.entries(patterns).forEach(([key, value]) => {
                this.outputChannel.appendLine(`${key}: ${value.toFixed(2)}`);
            });
        }
        logOptimizationResult(modelId, result) {
            this.outputChannel.appendLine('\nOptimization Result:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(`Parameters: ${JSON.stringify(result.parameters, null, 2)}`);
            this.outputChannel.appendLine(`Recommendation: ${result.recommendation}`);
            this.outputChannel.appendLine(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        }
        handleError(message, error) {
            this.logger.error('[ModelOptimizer]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.optimizationHistory.clear();
        }
    };
    return ModelOptimizer = _classThis;
})();
exports.ModelOptimizer = ModelOptimizer;
//# sourceMappingURL=ModelOptimizer.js.map