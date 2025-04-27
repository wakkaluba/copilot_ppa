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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPerformanceAnalyzer = void 0;
var inversify_1 = require("inversify");
var events_1 = require("events");
var vscode = require("vscode");
var logging_1 = require("../../common/logging");
var ModelResourceMonitorV2_1 = require("./ModelResourceMonitorV2");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelPerformanceAnalyzer = /** @class */ (function (_super) {
    __extends(ModelPerformanceAnalyzer, _super);
    function ModelPerformanceAnalyzer(logger, resourceMonitor, metricsManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.resourceMonitor = resourceMonitor;
        _this.metricsManager = metricsManager;
        _this.metricsHistory = new Map();
        _this.analysisIntervals = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Performance Analyzer');
        return _this;
    }
    ModelPerformanceAnalyzer.prototype.startAnalysis = function (modelId) {
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
                        interval = setInterval(function () { return _this.analyze(modelId); }, 60000);
                        this.analysisIntervals.set(modelId, interval);
                        this.emit('analysisStarted', { modelId: modelId });
                        this.logger.info("Started performance analysis for model ".concat(modelId));
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
    ModelPerformanceAnalyzer.prototype.stopAnalysis = function (modelId) {
        try {
            var interval = this.analysisIntervals.get(modelId);
            if (interval) {
                clearInterval(interval);
                this.analysisIntervals.delete(modelId);
                this.emit('analysisStopped', { modelId: modelId });
                this.logger.info("Stopped performance analysis for model ".concat(modelId));
            }
        }
        catch (error) {
            this.handleError("Failed to stop analysis for model ".concat(modelId), error);
        }
    };
    ModelPerformanceAnalyzer.prototype.initializeAnalysis = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var initialMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gatherPerformanceMetrics(modelId)];
                    case 1:
                        initialMetrics = _a.sent();
                        this.metricsHistory.set(modelId, [initialMetrics]);
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelPerformanceAnalyzer.prototype.analyze = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, history_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.gatherPerformanceMetrics(modelId)];
                    case 1:
                        metrics = _a.sent();
                        history_1 = this.metricsHistory.get(modelId) || [];
                        history_1.push(metrics);
                        // Keep last 24 hours of metrics (1440 samples at 1-minute interval)
                        while (history_1.length > 1440) {
                            history_1.shift();
                        }
                        this.metricsHistory.set(modelId, history_1);
                        return [4 /*yield*/, this.analyzePerformanceTrends(modelId, history_1)];
                    case 2:
                        _a.sent();
                        this.emit('metricsUpdated', { modelId: modelId, metrics: metrics });
                        this.logMetrics(modelId, metrics);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.handleError("Failed to analyze performance for model ".concat(modelId), error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelPerformanceAnalyzer.prototype.gatherPerformanceMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceMetrics, modelMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.resourceMonitor.getLatestMetrics(modelId)];
                    case 1:
                        resourceMetrics = _a.sent();
                        return [4 /*yield*/, this.metricsManager.getMetrics(modelId)];
                    case 2:
                        modelMetrics = _a.sent();
                        return [2 /*return*/, {
                                timestamp: new Date(),
                                responseTime: modelMetrics.averageResponseTime,
                                tokensPerSecond: modelMetrics.tokensPerSecond,
                                requestsPerMinute: modelMetrics.requestsPerMinute,
                                errorRate: modelMetrics.errorRate,
                                resourceUtilization: __assign({ cpu: (resourceMetrics === null || resourceMetrics === void 0 ? void 0 : resourceMetrics.cpu.usage) || 0, memory: (resourceMetrics === null || resourceMetrics === void 0 ? void 0 : resourceMetrics.memory.percent) || 0 }, ((resourceMetrics === null || resourceMetrics === void 0 ? void 0 : resourceMetrics.gpu) ? { gpu: resourceMetrics.gpu.usage } : {}))
                            }];
                }
            });
        });
    };
    ModelPerformanceAnalyzer.prototype.analyzePerformanceTrends = function (modelId, history) {
        return __awaiter(this, void 0, void 0, function () {
            var current, previous, responseTimeDelta, throughputDelta;
            return __generator(this, function (_a) {
                if (history.length < 2)
                    return [2 /*return*/];
                current = history[history.length - 1];
                previous = history[history.length - 2];
                responseTimeDelta = ((current.responseTime - previous.responseTime) / previous.responseTime) * 100;
                if (responseTimeDelta > 10) {
                    this.emit('performanceWarning', {
                        modelId: modelId,
                        metric: 'responseTime',
                        message: "Response time increased by ".concat(responseTimeDelta.toFixed(1), "%")
                    });
                }
                throughputDelta = ((current.tokensPerSecond - previous.tokensPerSecond) / previous.tokensPerSecond) * 100;
                if (throughputDelta < -10) {
                    this.emit('performanceWarning', {
                        modelId: modelId,
                        metric: 'throughput',
                        message: "Throughput decreased by ".concat(Math.abs(throughputDelta).toFixed(1), "%")
                    });
                }
                // Analyze error rate trend
                if (current.errorRate > previous.errorRate && current.errorRate > 0.05) {
                    this.emit('performanceWarning', {
                        modelId: modelId,
                        metric: 'errorRate',
                        message: "Error rate increased to ".concat((current.errorRate * 100).toFixed(1), "%")
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    ModelPerformanceAnalyzer.prototype.getPerformanceHistory = function (modelId) {
        return __spreadArray([], (this.metricsHistory.get(modelId) || []), true);
    };
    ModelPerformanceAnalyzer.prototype.getLatestPerformance = function (modelId) {
        var history = this.metricsHistory.get(modelId);
        return history === null || history === void 0 ? void 0 : history[history.length - 1];
    };
    ModelPerformanceAnalyzer.prototype.logMetrics = function (modelId, metrics) {
        this.outputChannel.appendLine('\nPerformance Metrics:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date(metrics.timestamp).toISOString()));
        this.outputChannel.appendLine("Response Time: ".concat(metrics.responseTime.toFixed(2), "ms"));
        this.outputChannel.appendLine("Tokens/s: ".concat(metrics.tokensPerSecond.toFixed(1)));
        this.outputChannel.appendLine("Requests/min: ".concat(metrics.requestsPerMinute.toFixed(1)));
        this.outputChannel.appendLine("Error Rate: ".concat((metrics.errorRate * 100).toFixed(1), "%"));
        this.outputChannel.appendLine('Resource Utilization:');
        this.outputChannel.appendLine("  CPU: ".concat(metrics.resourceUtilization.cpu.toFixed(1), "%"));
        this.outputChannel.appendLine("  Memory: ".concat(metrics.resourceUtilization.memory.toFixed(1), "%"));
        if (metrics.resourceUtilization.gpu !== undefined) {
            this.outputChannel.appendLine("  GPU: ".concat(metrics.resourceUtilization.gpu.toFixed(1), "%"));
        }
    };
    ModelPerformanceAnalyzer.prototype.handleError = function (message, error) {
        this.logger.error('[ModelPerformanceAnalyzer]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelPerformanceAnalyzer.prototype.dispose = function () {
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
    ModelPerformanceAnalyzer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelResourceMonitorV2_1.ModelResourceMonitorV2)),
        __param(2, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelResourceMonitorV2_1.ModelResourceMonitorV2,
            ModelMetricsManager_1.ModelMetricsManager])
    ], ModelPerformanceAnalyzer);
    return ModelPerformanceAnalyzer;
}(events_1.EventEmitter));
exports.ModelPerformanceAnalyzer = ModelPerformanceAnalyzer;
