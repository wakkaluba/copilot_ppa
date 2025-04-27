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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRuntimeAnalyzer = void 0;
const events_1 = require("events");
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const logging_1 = require("../../common/logging");
const ModelMetricsManager_1 = require("./ModelMetricsManager");
const ModelResourceMonitorV2_1 = require("./ModelResourceMonitorV2");
const ModelHealthMonitorV2_1 = require("./ModelHealthMonitorV2");
let ModelRuntimeAnalyzer = class ModelRuntimeAnalyzer extends events_1.EventEmitter {
    constructor(logger, metricsManager, resourceMonitor, healthMonitor, config = {
        analysisInterval: 60000,
        historyRetention: 24 * 60 * 60 * 1000,
        performanceThresholds: {
            responseTime: 5000,
            errorRate: 0.05,
            cpuUsage: 80,
            memoryUsage: 80 // 80%
        }
    }) {
        super();
        this.logger = logger;
        this.metricsManager = metricsManager;
        this.resourceMonitor = resourceMonitor;
        this.healthMonitor = healthMonitor;
        this.config = config;
        this.metricsHistory = new Map();
        this.analysisIntervals = new Map();
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
            timestamp: new Date(),
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
ModelRuntimeAnalyzer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
    __param(2, (0, inversify_1.inject)(ModelResourceMonitorV2_1.ModelResourceMonitorV2)),
    __param(3, (0, inversify_1.inject)(ModelHealthMonitorV2_1.ModelHealthMonitorV2)),
    __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager,
        ModelResourceMonitorV2_1.ModelResourceMonitorV2,
        ModelHealthMonitorV2_1.ModelHealthMonitorV2, Object])
], ModelRuntimeAnalyzer);
exports.ModelRuntimeAnalyzer = ModelRuntimeAnalyzer;
//# sourceMappingURL=ModelRuntimeAnalyzer.js.map