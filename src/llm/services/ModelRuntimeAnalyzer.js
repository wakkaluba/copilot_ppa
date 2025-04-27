"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRuntimeAnalyzer = void 0;
var events_1 = require("events");
var vscode = require("vscode");
var inversify_1 = require("inversify");
var logging_1 = require("../../common/logging");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelResourceMonitorV2_1 = require("./ModelResourceMonitorV2");
var ModelHealthMonitorV2_1 = require("./ModelHealthMonitorV2");
var ModelRuntimeAnalyzer = /** @class */ (function (_super) {
    __extends(ModelRuntimeAnalyzer, _super);
    function ModelRuntimeAnalyzer(logger, metricsManager, resourceMonitor, healthMonitor, config) {
        if (config === void 0) { config = {
            analysisInterval: 60000, // 1 minute
            historyRetention: 24 * 60 * 60 * 1000, // 24 hours
            performanceThresholds: {
                responseTime: 5000, // 5 seconds
                errorRate: 0.05, // 5%
                cpuUsage: 80, // 80%
                memoryUsage: 80 // 80%
            }
        }; }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsManager = metricsManager;
        _this.resourceMonitor = resourceMonitor;
        _this.healthMonitor = healthMonitor;
        _this.config = config;
        _this.metricsHistory = new Map();
        _this.analysisIntervals = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Runtime Analysis');
        return _this;
    }
    ModelRuntimeAnalyzer.prototype.startAnalysis = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var interval, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (this.analysisIntervals.has(modelId)) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.initializeAnalysis(modelId)];
                    case 1:
                        _a.sent();
                        interval = setInterval(function () { return _this.analyzeRuntime(modelId); }, this.config.analysisInterval);
                        this.analysisIntervals.set(modelId, interval);
                        this.emit('analysisStarted', { modelId: modelId });
                        this.logger.info("Started runtime analysis for model ".concat(modelId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError("Failed to start analysis for model ".concat(modelId), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelRuntimeAnalyzer.prototype.stopAnalysis = function (modelId) {
        var interval = this.analysisIntervals.get(modelId);
        if (interval) {
            clearInterval(interval);
            this.analysisIntervals.delete(modelId);
            this.emit('analysisStopped', { modelId: modelId });
        }
    };
    ModelRuntimeAnalyzer.prototype.initializeAnalysis = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gatherMetrics(modelId)];
                    case 1:
                        metrics = _a.sent();
                        this.metricsHistory.set(modelId, [metrics]);
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelRuntimeAnalyzer.prototype.analyzeRuntime = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, analysis, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.gatherMetrics(modelId)];
                    case 1:
                        metrics = _a.sent();
                        analysis = this.analyzeMetrics(modelId, metrics);
                        this.updateMetricsHistory(modelId, metrics);
                        this.emit('analysisUpdated', { modelId: modelId, analysis: analysis });
                        this.logAnalysis(modelId, analysis);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError("Failed to analyze runtime for model ".concat(modelId), error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelRuntimeAnalyzer.prototype.gatherMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, performanceMetrics, resourceMetrics;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.metricsManager.getLatestMetrics(modelId),
                            this.resourceMonitor.getLatestMetrics(modelId)
                        ])];
                    case 1:
                        _a = _b.sent(), performanceMetrics = _a[0], resourceMetrics = _a[1];
                        return [2 /*return*/, {
                                timestamp: new Date(),
                                performance: {
                                    responseTime: (performanceMetrics === null || performanceMetrics === void 0 ? void 0 : performanceMetrics.averageResponseTime) || 0,
                                    throughput: (performanceMetrics === null || performanceMetrics === void 0 ? void 0 : performanceMetrics.tokenThroughput) || 0,
                                    errorRate: (performanceMetrics === null || performanceMetrics === void 0 ? void 0 : performanceMetrics.errorRate) || 0
                                },
                                resources: resourceMetrics || {
                                    cpu: { usage: 0 },
                                    memory: { used: 0, total: 0, percent: 0 }
                                }
                            }];
                }
            });
        });
    };
    ModelRuntimeAnalyzer.prototype.analyzeMetrics = function (modelId, current) {
        var history = this.metricsHistory.get(modelId) || [];
        var analysis = {
            performance: this.analyzePerformance(current, history),
            resources: this.analyzeResources(current),
            recommendations: this.generateRecommendations(current)
        };
        return analysis;
    };
    ModelRuntimeAnalyzer.prototype.analyzePerformance = function (current, history) {
        // Analyze response time trends
        var responseTimeTrend = this.calculateTrend(history.map(function (m) { return m.performance.responseTime; }));
        // Analyze throughput trends
        var throughputTrend = this.calculateTrend(history.map(function (m) { return m.performance.throughput; }));
        // Analyze error rate trends
        var errorRateTrend = this.calculateTrend(history.map(function (m) { return m.performance.errorRate; }));
        return {
            current: current.performance,
            trends: {
                responseTime: responseTimeTrend,
                throughput: throughputTrend,
                errorRate: errorRateTrend
            }
        };
    };
    ModelRuntimeAnalyzer.prototype.analyzeResources = function (metrics) {
        var warnings = [];
        if (metrics.resources.cpu.usage > this.config.performanceThresholds.cpuUsage) {
            warnings.push("High CPU usage: ".concat(metrics.resources.cpu.usage, "%"));
        }
        if (metrics.resources.memory.percent > this.config.performanceThresholds.memoryUsage) {
            warnings.push("High memory usage: ".concat(metrics.resources.memory.percent, "%"));
        }
        return {
            current: metrics.resources,
            warnings: warnings
        };
    };
    ModelRuntimeAnalyzer.prototype.generateRecommendations = function (metrics) {
        var recommendations = [];
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
    };
    ModelRuntimeAnalyzer.prototype.calculateTrend = function (values) {
        if (values.length < 2)
            return 0;
        var recent = values.slice(-5);
        var avgChange = recent.slice(1).reduce(function (sum, val, i) {
            return sum + (val - recent[i]);
        }, 0) / (recent.length - 1);
        return avgChange;
    };
    ModelRuntimeAnalyzer.prototype.updateMetricsHistory = function (modelId, metrics) {
        var history = this.metricsHistory.get(modelId) || [];
        history.push(metrics);
        // Maintain history within retention period
        var cutoff = Date.now() - this.config.historyRetention;
        var filtered = history.filter(function (m) { return m.timestamp >= cutoff; });
        this.metricsHistory.set(modelId, filtered);
    };
    ModelRuntimeAnalyzer.prototype.logAnalysis = function (modelId, analysis) {
        var _this = this;
        this.outputChannel.appendLine('\nRuntime Analysis:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine("Time: ".concat(new Date().toISOString()));
        this.outputChannel.appendLine('Performance:');
        this.outputChannel.appendLine(JSON.stringify(analysis.performance, null, 2));
        this.outputChannel.appendLine('Resources:');
        this.outputChannel.appendLine(JSON.stringify(analysis.resources, null, 2));
        if (analysis.recommendations.length > 0) {
            this.outputChannel.appendLine('Recommendations:');
            analysis.recommendations.forEach(function (rec) {
                _this.outputChannel.appendLine("- ".concat(rec));
            });
        }
    };
    ModelRuntimeAnalyzer.prototype.handleError = function (message, error) {
        this.logger.error('[ModelRuntimeAnalyzer]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelRuntimeAnalyzer.prototype.dispose = function () {
        for (var _i = 0, _a = this.analysisIntervals.values(); _i < _a.length; _i++) {
            var timer = _a[_i];
            clearInterval(timer);
        }
        this.analysisIntervals.clear();
        this.metricsHistory.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    };
    var _a;
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
    return ModelRuntimeAnalyzer;
}(events_1.EventEmitter));
exports.ModelRuntimeAnalyzer = ModelRuntimeAnalyzer;
