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
exports.ModelPerformanceAnalyzer = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const vscode = __importStar(require("vscode"));
let ModelPerformanceAnalyzer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelPerformanceAnalyzer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelPerformanceAnalyzer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        resourceMonitor;
        metricsManager;
        metricsHistory = new Map();
        analysisIntervals = new Map();
        outputChannel;
        constructor(logger, resourceMonitor, metricsManager) {
            super();
            this.logger = logger;
            this.resourceMonitor = resourceMonitor;
            this.metricsManager = metricsManager;
            this.outputChannel = vscode.window.createOutputChannel('Model Performance Analyzer');
        }
        async startAnalysis(modelId) {
            try {
                if (this.analysisIntervals.has(modelId)) {
                    return;
                }
                await this.initializeAnalysis(modelId);
                const interval = setInterval(() => this.analyze(modelId), 60000); // Analyze every minute
                this.analysisIntervals.set(modelId, interval);
                this.emit('analysisStarted', { modelId });
                this.logger.info(`Started performance analysis for model ${modelId}`);
            }
            catch (error) {
                this.handleError(`Failed to start analysis for model ${modelId}`, error);
                throw error;
            }
        }
        stopAnalysis(modelId) {
            try {
                const interval = this.analysisIntervals.get(modelId);
                if (interval) {
                    clearInterval(interval);
                    this.analysisIntervals.delete(modelId);
                    this.emit('analysisStopped', { modelId });
                    this.logger.info(`Stopped performance analysis for model ${modelId}`);
                }
            }
            catch (error) {
                this.handleError(`Failed to stop analysis for model ${modelId}`, error);
            }
        }
        async initializeAnalysis(modelId) {
            const initialMetrics = await this.gatherPerformanceMetrics(modelId);
            this.metricsHistory.set(modelId, [initialMetrics]);
        }
        async analyze(modelId) {
            try {
                const metrics = await this.gatherPerformanceMetrics(modelId);
                const history = this.metricsHistory.get(modelId) || [];
                history.push(metrics);
                // Keep last 24 hours of metrics (1440 samples at 1-minute interval)
                while (history.length > 1440) {
                    history.shift();
                }
                this.metricsHistory.set(modelId, history);
                await this.analyzePerformanceTrends(modelId, history);
                this.emit('metricsUpdated', { modelId, metrics });
                this.logMetrics(modelId, metrics);
            }
            catch (error) {
                this.handleError(`Failed to analyze performance for model ${modelId}`, error);
            }
        }
        async gatherPerformanceMetrics(modelId) {
            const resourceMetrics = await this.resourceMonitor.getLatestMetrics(modelId);
            const modelMetrics = await this.metricsManager.getMetrics(modelId);
            return {
                timestamp: Date.now(),
                responseTime: modelMetrics.averageResponseTime,
                tokensPerSecond: modelMetrics.tokensPerSecond,
                requestsPerMinute: modelMetrics.requestsPerMinute,
                errorRate: modelMetrics.errorRate,
                resourceUtilization: {
                    cpu: resourceMetrics?.cpu.usage || 0,
                    memory: resourceMetrics?.memory.percent || 0,
                    ...(resourceMetrics?.gpu ? { gpu: resourceMetrics.gpu.usage } : {})
                }
            };
        }
        async analyzePerformanceTrends(modelId, history) {
            if (history.length < 2)
                return;
            const current = history[history.length - 1];
            const previous = history[history.length - 2];
            // Analyze response time trend
            const responseTimeDelta = ((current.responseTime - previous.responseTime) / previous.responseTime) * 100;
            if (responseTimeDelta > 10) {
                this.emit('performanceWarning', {
                    modelId,
                    metric: 'responseTime',
                    message: `Response time increased by ${responseTimeDelta.toFixed(1)}%`
                });
            }
            // Analyze throughput trend
            const throughputDelta = ((current.tokensPerSecond - previous.tokensPerSecond) / previous.tokensPerSecond) * 100;
            if (throughputDelta < -10) {
                this.emit('performanceWarning', {
                    modelId,
                    metric: 'throughput',
                    message: `Throughput decreased by ${Math.abs(throughputDelta).toFixed(1)}%`
                });
            }
            // Analyze error rate trend
            if (current.errorRate > previous.errorRate && current.errorRate > 0.05) {
                this.emit('performanceWarning', {
                    modelId,
                    metric: 'errorRate',
                    message: `Error rate increased to ${(current.errorRate * 100).toFixed(1)}%`
                });
            }
        }
        getPerformanceHistory(modelId) {
            return [...(this.metricsHistory.get(modelId) || [])];
        }
        getLatestPerformance(modelId) {
            const history = this.metricsHistory.get(modelId);
            return history?.[history.length - 1];
        }
        logMetrics(modelId, metrics) {
            this.outputChannel.appendLine('\nPerformance Metrics:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(`Timestamp: ${new Date(metrics.timestamp).toISOString()}`);
            this.outputChannel.appendLine(`Response Time: ${metrics.responseTime.toFixed(2)}ms`);
            this.outputChannel.appendLine(`Tokens/s: ${metrics.tokensPerSecond.toFixed(1)}`);
            this.outputChannel.appendLine(`Requests/min: ${metrics.requestsPerMinute.toFixed(1)}`);
            this.outputChannel.appendLine(`Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
            this.outputChannel.appendLine('Resource Utilization:');
            this.outputChannel.appendLine(`  CPU: ${metrics.resourceUtilization.cpu.toFixed(1)}%`);
            this.outputChannel.appendLine(`  Memory: ${metrics.resourceUtilization.memory.toFixed(1)}%`);
            if (metrics.resourceUtilization.gpu !== undefined) {
                this.outputChannel.appendLine(`  GPU: ${metrics.resourceUtilization.gpu.toFixed(1)}%`);
            }
        }
        handleError(message, error) {
            this.logger.error('[ModelPerformanceAnalyzer]', message, error);
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
    return ModelPerformanceAnalyzer = _classThis;
})();
exports.ModelPerformanceAnalyzer = ModelPerformanceAnalyzer;
//# sourceMappingURL=ModelPerformanceAnalyzer.js.map