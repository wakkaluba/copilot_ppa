"use strict";
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
exports.PerformanceManager = void 0;
var vscode = require("vscode");
var PerformanceAnalyzerService_1 = require("./services/PerformanceAnalyzerService");
var PerformanceStatusService_1 = require("./services/PerformanceStatusService");
var PerformanceDiagnosticsService_1 = require("./services/PerformanceDiagnosticsService");
var PerformanceFileMonitorService_1 = require("./services/PerformanceFileMonitorService");
var PerformanceConfigService_1 = require("./services/PerformanceConfigService");
var performanceProfiler_1 = require("./performanceProfiler");
var bottleneckDetector_1 = require("./bottleneckDetector");
var events_1 = require("events");
var cachingService_1 = require("./cachingService");
var asyncOptimizer_1 = require("./asyncOptimizer");
var logger_1 = require("../utils/logger");
/**
 * Central manager for all performance-related functionality in the extension.
 * Coordinates analysis, profiling, monitoring and reporting of performance metrics.
 */
var PerformanceManager = /** @class */ (function () {
    function PerformanceManager(extensionContext) {
        var _this = this;
        this.eventEmitter = new events_1.EventEmitter();
        this.configService = new PerformanceConfigService_1.PerformanceConfigService();
        this.analyzerService = new PerformanceAnalyzerService_1.PerformanceAnalyzerService(this.configService);
        this.statusService = new PerformanceStatusService_1.PerformanceStatusService();
        this.diagnosticsService = new PerformanceDiagnosticsService_1.PerformanceDiagnosticsService();
        this.fileMonitorService = new PerformanceFileMonitorService_1.PerformanceFileMonitorService();
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance(extensionContext);
        this.bottleneckDetector = bottleneckDetector_1.BottleneckDetector.getInstance();
        this.cachingService = cachingService_1.CachingService.getInstance();
        this.asyncOptimizer = asyncOptimizer_1.AsyncOptimizer.getInstance();
        this.logger = new logger_1.LoggerImpl();
        this.setupEventListeners();
        this.initializeServices().catch(function (error) {
            _this.logger.error('Failed to initialize performance services:', error);
            vscode.window.showErrorMessage('Failed to initialize performance services');
        });
    }
    PerformanceManager.getInstance = function (context) {
        if (!PerformanceManager.instance) {
            if (!context) {
                throw new Error('Context required for PerformanceManager initialization');
            }
            PerformanceManager.instance = new PerformanceManager(context);
        }
        return PerformanceManager.instance;
    };
    PerformanceManager.prototype.initializeServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cachingOptions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.configService.initialize()];
                    case 1:
                        _a.sent();
                        this.profiler.setEnabled(this.configService.isProfilingEnabled());
                        this.bottleneckDetector.setEnabled(this.configService.isBottleneckDetectionEnabled());
                        cachingOptions = this.configService.getCachingOptions();
                        this.cachingService.setMaxCacheSize(cachingOptions.maxSize);
                        this.asyncOptimizer.setConfig(this.configService.getAsyncOptions());
                        this.eventEmitter.emit('servicesInitialized');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Failed to initialize performance services:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes the performance of the entire workspace.
     * This includes analyzing all relevant files and collecting workspace-wide metrics.
     */
    PerformanceManager.prototype.analyzeWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var operationId, error_2, message;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!vscode.workspace.workspaceFolders) {
                            throw new Error('No workspace folders found');
                        }
                        operationId = 'workspace-analysis';
                        this.profiler.startOperation(operationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Analyzing workspace performance",
                                cancellable: true
                            }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var files, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.fileMonitorService.findAnalyzableFiles()];
                                        case 1:
                                            files = _a.sent();
                                            return [4 /*yield*/, this.analyzerService.analyzeWorkspace(files, progress, token)];
                                        case 2:
                                            result = _a.sent();
                                            if (token.isCancellationRequested) {
                                                throw new Error('Analysis cancelled by user');
                                            }
                                            this.eventEmitter.emit('workspaceAnalysisComplete', result);
                                            return [4 /*yield*/, this.updateWorkspaceMetrics(result)];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Workspace analysis failed:', error_2);
                        message = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        vscode.window.showErrorMessage("Workspace analysis failed: ".concat(message));
                        throw error_2;
                    case 4:
                        this.profiler.endOperation(operationId);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes a specific file for performance issues.
     * @param document The document to analyze
     */
    PerformanceManager.prototype.analyzeFile = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var operationId, result, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operationId = "file-analysis-".concat(document.uri.fsPath);
                        this.profiler.startOperation(operationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, this.analyzerService.analyzeFile(document)];
                    case 2:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 4];
                        this.statusService.updateStatusBar(result);
                        this.diagnosticsService.updateDiagnostics(document, result);
                        this.bottleneckDetector.analyzeOperation(operationId);
                        this.eventEmitter.emit('fileAnalysisComplete', result);
                        return [4 /*yield*/, this.updateFileMetrics(document.uri, result)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, result];
                    case 5:
                        error_3 = _a.sent();
                        this.logger.error("File analysis failed for ".concat(document.uri.fsPath, ":"), error_3);
                        message = error_3 instanceof Error ? error_3.message : 'Unknown error';
                        vscode.window.showErrorMessage("File analysis failed: ".concat(message));
                        return [2 /*return*/, null];
                    case 6:
                        this.profiler.endOperation(operationId);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes the currently active file in the editor.
     */
    PerformanceManager.prototype.analyzeCurrentFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, this.analyzeFile(editor.document)];
            });
        });
    };
    /**
     * Generates a performance report with current metrics and bottleneck analysis.
     */
    PerformanceManager.prototype.generatePerformanceReport = function () {
        var operationStats = this.profiler.getStats('all');
        var bottleneckAnalysis = this.bottleneckDetector.analyzeAll();
        var cacheStats = this.cachingService.getCacheStats();
        var asyncStats = this.asyncOptimizer.getStats();
        this.logger.info('Performance Report:');
        this.logger.info("Operations analyzed: ".concat((operationStats === null || operationStats === void 0 ? void 0 : operationStats.length) || 0));
        this.logger.info("Critical bottlenecks detected: ".concat(bottleneckAnalysis.critical.length));
        this.logger.info("Performance warnings detected: ".concat(bottleneckAnalysis.warnings.length));
        this.logger.info("Cache hits: ".concat(cacheStats.hits, ", misses: ").concat(cacheStats.misses, ", evictions: ").concat(cacheStats.evictions));
        this.logger.info("Async operations optimized: ".concat(asyncStats.optimizedCount));
        this.eventEmitter.emit('performanceReport', {
            operationStats: operationStats,
            bottleneckAnalysis: bottleneckAnalysis,
            cacheStats: cacheStats,
            asyncStats: asyncStats
        });
    };
    PerformanceManager.prototype.setupEventListeners = function () {
        var _this = this;
        this.fileMonitorService.onDocumentSaved(function (document) {
            return _this.handleDocumentChange(document);
        });
        this.fileMonitorService.onActiveEditorChanged(function (editor) {
            if (editor) {
                _this.analyzeFile(editor.document).catch(function (error) {
                    _this.logger.error('Failed to analyze active editor:', error);
                });
            }
        });
        vscode.workspace.onDidChangeConfiguration(function (e) {
            if (e.affectsConfiguration('performance')) {
                _this.initializeServices().catch(function (error) {
                    _this.logger.error('Failed to reinitialize services:', error);
                });
            }
        });
    };
    PerformanceManager.prototype.handleDocumentChange = function (document) {
        var _this = this;
        this.fileMonitorService.throttleDocumentChange(document, function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeFile(document)];
                    case 1:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 3];
                        this.statusService.updateStatusBar(result);
                        this.diagnosticsService.updateDiagnostics(document, result);
                        return [4 /*yield*/, this.updateFileMetrics(document.uri, result)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    PerformanceManager.prototype.updateWorkspaceMetrics = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var operationId, stats, _i, _a, fileResult, fileStats;
            return __generator(this, function (_b) {
                try {
                    operationId = 'workspace-analysis';
                    stats = this.profiler.getStats(operationId);
                    if (stats) {
                        stats.metadata = {
                            filesAnalyzed: result.summary.filesAnalyzed,
                            totalIssues: result.summary.totalIssues,
                            criticalIssues: result.summary.criticalIssues,
                            highIssues: result.summary.highIssues
                        };
                    }
                    // Update bottleneck tracking
                    for (_i = 0, _a = result.fileResults; _i < _a.length; _i++) {
                        fileResult = _a[_i];
                        fileStats = this.profiler.getStats("file-analysis-".concat(fileResult.filePath));
                        this.bottleneckDetector.analyzeOperation("file-".concat(fileResult.filePath), {
                            stats: fileStats,
                            issues: fileResult.issues.length,
                            metrics: fileResult.metrics
                        });
                    }
                    this.eventEmitter.emit('workspaceMetricsUpdated', result.summary);
                }
                catch (error) {
                    this.logger.error('Failed to update workspace metrics:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    PerformanceManager.prototype.updateFileMetrics = function (uri, result) {
        return __awaiter(this, void 0, void 0, function () {
            var operationId, stats;
            return __generator(this, function (_a) {
                try {
                    operationId = "file-analysis-".concat(uri.fsPath);
                    stats = this.profiler.getStats(operationId);
                    if (stats) {
                        stats.metadata = __assign({ issues: result.issues.length }, result.metrics);
                    }
                    // Update bottleneck tracking
                    this.bottleneckDetector.analyzeOperation("file-".concat(uri.fsPath), {
                        stats: this.profiler.getStats(operationId),
                        issues: result.issues.length,
                        metrics: result.metrics
                    });
                    this.eventEmitter.emit('fileMetricsUpdated', { uri: uri, metrics: result.metrics });
                }
                catch (error) {
                    this.logger.error("Failed to update metrics for ".concat(uri.fsPath, ":"), error);
                }
                return [2 /*return*/];
            });
        });
    };
    PerformanceManager.prototype.getProfiler = function () {
        return this.profiler;
    };
    PerformanceManager.prototype.getBottleneckDetector = function () {
        return this.bottleneckDetector;
    };
    PerformanceManager.prototype.getCachingService = function () {
        return this.cachingService;
    };
    PerformanceManager.prototype.getAsyncOptimizer = function () {
        return this.asyncOptimizer;
    };
    PerformanceManager.prototype.on = function (event, listener) {
        this.eventEmitter.on(event, listener);
    };
    PerformanceManager.prototype.off = function (event, listener) {
        this.eventEmitter.off(event, listener);
    };
    PerformanceManager.prototype.dispose = function () {
        this.statusService.dispose();
        this.diagnosticsService.dispose();
        this.fileMonitorService.dispose();
        this.cachingService.dispose();
        this.asyncOptimizer.dispose();
        this.eventEmitter.removeAllListeners();
    };
    return PerformanceManager;
}());
exports.PerformanceManager = PerformanceManager;
