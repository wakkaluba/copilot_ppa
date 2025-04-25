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
exports.ModelRuntimeAnalyzer = void 0;
const events_1 = require("events");
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
let ModelRuntimeAnalyzer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelRuntimeAnalyzer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelRuntimeAnalyzer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsManager;
        resourceMonitor;
        healthMonitor;
        config;
        metricsHistory = new Map();
        analysisIntervals = new Map();
        outputChannel;
        constructor(logger, metricsManager, resourceMonitor, healthMonitor, config = {
            analysisInterval: 60000, // 1 minute
            historyRetention: 24 * 60 * 60 * 1000, // 24 hours
            performanceThresholds: {
                responseTime: 5000, // 5 seconds
                errorRate: 0.05, // 5%
                cpuUsage: 80, // 80%
                memoryUsage: 80 // 80%
            }
        }) {
            super();
            this.logger = logger;
            this.metricsManager = metricsManager;
            this.resourceMonitor = resourceMonitor;
            this.healthMonitor = healthMonitor;
            this.config = config;
            this.outputChannel = vscode.window.createOutputChannel('Model Runtime Analysis');
        }
        async startAnalysis(modelId) {
            try {
                if (this.analysisIntervals.has(modelId)) {
                    return;
                }
                await this.initializeAnalysis(modelId);
                const interval = setInterval(() => this.analyzeRuntime(modelId), this.config.analysisInterval);
                this.analysisIntervals.set(modelId, interval);
                this.emit('analysisStarted', { modelId });
                this.logger.info(`Started runtime analysis for model ${modelId}`);
            }
            catch (error) {
                this.handleError(`Failed to start analysis for model ${modelId}`, error);
                throw error;
            }
        }
        stopAnalysis(modelId) {
            const interval = this.analysisIntervals.get(modelId);
            if (interval) {
                clearInterval(interval);
                this.analysisIntervals.delete(modelId);
                this.emit('analysisStopped', { modelId });
            }
        }
        async initializeAnalysis(modelId) {
            const metrics = await this.gatherMetrics(modelId);
            this.metricsHistory.set(modelId, [metrics]);
        }
        async analyzeRuntime(modelId) {
            try {
                const metrics = await this.gatherMetrics(modelId);
                const analysis = this.analyzeMetrics(modelId, metrics);
                this.updateMetricsHistory(modelId, metrics);
                this.emit('analysisUpdated', { modelId, analysis });
                this.logAnalysis(modelId, analysis);
            }
            catch (error) {
                this.handleError(`Failed to analyze runtime for model ${modelId}`, error);
            }
        }
        async gatherMetrics(modelId) {
            const [performanceMetrics, resourceMetrics] = await Promise.all([
                this.metricsManager.getLatestMetrics(modelId),
                this.resourceMonitor.getLatestMetrics(modelId)
            ]);
            return {
                timestamp: Date.now(),
                performance: {
                    responseTime: performanceMetrics?.averageResponseTime || 0,
                    throughput: performanceMetrics?.tokenThroughput || 0,
                    errorRate: performanceMetrics?.errorRate || 0
                },
                resources: resourceMetrics || {
                    cpu: { usage: 0 },
                    memory: { used: 0, total: 0, percent: 0 }
                }
            };
        }
        analyzeMetrics(modelId, current) {
            const history = this.metricsHistory.get(modelId) || [];
            const analysis = {
                performance: this.analyzePerformance(current, history),
                resources: this.analyzeResources(current),
                recommendations: this.generateRecommendations(current)
            };
            return analysis;
        }
        analyzePerformance(current, history) {
            // Analyze response time trends
            const responseTimeTrend = this.calculateTrend(history.map(m => m.performance.responseTime));
            // Analyze throughput trends
            const throughputTrend = this.calculateTrend(history.map(m => m.performance.throughput));
            // Analyze error rate trends
            const errorRateTrend = this.calculateTrend(history.map(m => m.performance.errorRate));
            return {
                current: current.performance,
                trends: {
                    responseTime: responseTimeTrend,
                    throughput: throughputTrend,
                    errorRate: errorRateTrend
                }
            };
        }
        analyzeResources(metrics) {
            const warnings = [];
            if (metrics.resources.cpu.usage > this.config.performanceThresholds.cpuUsage) {
                warnings.push(`High CPU usage: ${metrics.resources.cpu.usage}%`);
            }
            if (metrics.resources.memory.percent > this.config.performanceThresholds.memoryUsage) {
                warnings.push(`High memory usage: ${metrics.resources.memory.percent}%`);
            }
            return {
                current: metrics.resources,
                warnings
            };
        }
        generateRecommendations(metrics) {
            const recommendations = [];
            if (metrics.performance.responseTime > this.config.performanceThresholds.responseTime) {
                recommendations.push('Consider reducing model size or batch size to improve response time');
            }
            if (metrics.performance.errorRate > this.config.performanceThresholds.errorRate) {
                recommendations.push('Investigate error patterns and implement retry mechanisms');
            }
            if (metrics.resources.cpu.usage > this.config.performanceThresholds.cpuUsage) {
                recommendations.push('Consider scaling horizontally or optimizing resource allocation');
            }
            return recommendations;
        }
        calculateTrend(values) {
            if (values.length < 2)
                return 0;
            const recent = values.slice(-5);
            const avgChange = recent.slice(1).reduce((sum, val, i) => {
                return sum + (val - recent[i]);
            }, 0) / (recent.length - 1);
            return avgChange;
        }
        updateMetricsHistory(modelId, metrics) {
            const history = this.metricsHistory.get(modelId) || [];
            history.push(metrics);
            // Maintain history within retention period
            const cutoff = Date.now() - this.config.historyRetention;
            const filtered = history.filter(m => m.timestamp >= cutoff);
            this.metricsHistory.set(modelId, filtered);
        }
        logAnalysis(modelId, analysis) {
            this.outputChannel.appendLine('\nRuntime Analysis:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(`Time: ${new Date().toISOString()}`);
            this.outputChannel.appendLine('Performance:');
            this.outputChannel.appendLine(JSON.stringify(analysis.performance, null, 2));
            this.outputChannel.appendLine('Resources:');
            this.outputChannel.appendLine(JSON.stringify(analysis.resources, null, 2));
            if (analysis.recommendations.length > 0) {
                this.outputChannel.appendLine('Recommendations:');
                analysis.recommendations.forEach((rec) => {
                    this.outputChannel.appendLine(`- ${rec}`);
                });
            }
        }
        handleError(message, error) {
            this.logger.error('[ModelRuntimeAnalyzer]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            for (const timer of this.analysisIntervals.values()) {
                clearInterval(timer);
            }
            this.analysisIntervals.clear();
            this.metricsHistory.clear();
            this.outputChannel.dispose();
            this.removeAllListeners();
        }
    };
    return ModelRuntimeAnalyzer = _classThis;
})();
exports.ModelRuntimeAnalyzer = ModelRuntimeAnalyzer;
//# sourceMappingURL=ModelRuntimeAnalyzer.js.map