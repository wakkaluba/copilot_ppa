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
exports.ModelVisualizationService = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../../types");
var ModelMetricsManager_1 = require("./ModelMetricsManager");
var ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
var ModelVisualizationService = /** @class */ (function (_super) {
    __extends(ModelVisualizationService, _super);
    function ModelVisualizationService(logger, metricsManager, performanceAnalyzer) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsManager = metricsManager;
        _this.performanceAnalyzer = performanceAnalyzer;
        _this.webviewPanels = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Visualization');
        return _this;
    }
    ModelVisualizationService.prototype.showPerformanceDashboard = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var panel, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createWebviewPanel("performance-".concat(modelId), "Performance Dashboard - ".concat(modelId))];
                    case 1:
                        panel = _a.sent();
                        return [4 /*yield*/, this.updateDashboard(panel, modelId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError('Failed to show performance dashboard', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelVisualizationService.prototype.createWebviewPanel = function (id, title) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            var _this = this;
            return __generator(this, function (_a) {
                panel = this.webviewPanels.get(id);
                if (!panel) {
                    panel = vscode.window.createWebviewPanel('modelPerformance', title, vscode.ViewColumn.One, {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    });
                    panel.onDidDispose(function () {
                        _this.webviewPanels.delete(id);
                    });
                    this.webviewPanels.set(id, panel);
                }
                return [2 /*return*/, panel];
            });
        });
    };
    ModelVisualizationService.prototype.updateDashboard = function (panel, modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, performanceData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.metricsManager.getMetricsHistory(modelId)];
                    case 1:
                        metrics = _a.sent();
                        if (!metrics || metrics.length === 0) {
                            panel.webview.html = this.generateEmptyDashboard();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.preparePerformanceData(modelId)];
                    case 2:
                        performanceData = _a.sent();
                        panel.webview.html = this.generateDashboardHtml(performanceData);
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelVisualizationService.prototype.preparePerformanceData = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, timestamps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.metricsManager.getMetricsHistory(modelId)];
                    case 1:
                        metrics = _a.sent();
                        timestamps = metrics.map(function (m) { return new Date(m.timestamp).toLocaleTimeString(); });
                        return [2 /*return*/, {
                                responseTime: {
                                    labels: timestamps,
                                    datasets: [{
                                            label: 'Response Time (ms)',
                                            data: metrics.map(function (m) { return m.metrics.averageResponseTime; }),
                                            borderColor: '#2196F3',
                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                            fill: true
                                        }]
                                },
                                throughput: {
                                    labels: timestamps,
                                    datasets: [{
                                            label: 'Tokens/Second',
                                            data: metrics.map(function (m) { return m.metrics.tokenThroughput; }),
                                            borderColor: '#4CAF50',
                                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                            fill: true
                                        }]
                                },
                                errorRate: {
                                    labels: timestamps,
                                    datasets: [{
                                            label: 'Error Rate (%)',
                                            data: metrics.map(function (m) { return m.metrics.errorRate * 100; }),
                                            borderColor: '#F44336',
                                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                            fill: true
                                        }]
                                }
                            }];
                }
            });
        });
    };
    ModelVisualizationService.prototype.generateDashboardHtml = function (data) {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n                <style>\n                    body {\n                        padding: 20px;\n                        background-color: var(--vscode-editor-background);\n                        color: var(--vscode-editor-foreground);\n                    }\n                    .chart-container {\n                        width: 100%;\n                        height: 300px;\n                        margin-bottom: 30px;\n                        background-color: var(--vscode-panel-background);\n                        border-radius: 5px;\n                        padding: 20px;\n                    }\n                    h2 {\n                        color: var(--vscode-editor-foreground);\n                        margin-bottom: 15px;\n                    }\n                </style>\n            </head>\n            <body>\n                <div class=\"chart-container\">\n                    <h2>Response Time</h2>\n                    <canvas id=\"responseTimeChart\"></canvas>\n                </div>\n                <div class=\"chart-container\">\n                    <h2>Throughput</h2>\n                    <canvas id=\"throughputChart\"></canvas>\n                </div>\n                <div class=\"chart-container\">\n                    <h2>Error Rate</h2>\n                    <canvas id=\"errorRateChart\"></canvas>\n                </div>\n\n                <script>\n                    const charts = {\n                        responseTime: ".concat(JSON.stringify(data.responseTime), ",\n                        throughput: ").concat(JSON.stringify(data.throughput), ",\n                        errorRate: ").concat(JSON.stringify(data.errorRate), "\n                    };\n\n                    function createChart(elementId, data, options = {}) {\n                        const ctx = document.getElementById(elementId).getContext('2d');\n                        return new Chart(ctx, {\n                            type: 'line',\n                            data: data,\n                            options: {\n                                responsive: true,\n                                maintainAspectRatio: false,\n                                plugins: {\n                                    legend: {\n                                        display: true,\n                                        position: 'top',\n                                        labels: {\n                                            color: getComputedStyle(document.body).color\n                                        }\n                                    }\n                                },\n                                scales: {\n                                    x: {\n                                        grid: {\n                                            color: 'rgba(255, 255, 255, 0.1)'\n                                        },\n                                        ticks: {\n                                            color: getComputedStyle(document.body).color\n                                        }\n                                    },\n                                    y: {\n                                        grid: {\n                                            color: 'rgba(255, 255, 255, 0.1)'\n                                        },\n                                        ticks: {\n                                            color: getComputedStyle(document.body).color\n                                        }\n                                    }\n                                },\n                                ...options\n                            }\n                        });\n                    }\n\n                    createChart('responseTimeChart', charts.responseTime);\n                    createChart('throughputChart', charts.throughput);\n                    createChart('errorRateChart', charts.errorRate);\n                </script>\n            </body>\n            </html>\n        ");
    };
    ModelVisualizationService.prototype.generateEmptyDashboard = function () {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <style>\n                    body {\n                        padding: 20px;\n                        display: flex;\n                        justify-content: center;\n                        align-items: center;\n                        min-height: 300px;\n                        background-color: var(--vscode-editor-background);\n                        color: var(--vscode-editor-foreground);\n                    }\n                    .message {\n                        text-align: center;\n                        font-size: 1.2em;\n                    }\n                </style>\n            </head>\n            <body>\n                <div class=\"message\">\n                    <p>No performance data available.</p>\n                    <p>Run some operations to generate metrics.</p>\n                </div>\n            </body>\n            </html>\n        ";
    };
    ModelVisualizationService.prototype.handleError = function (message, error) {
        this.logger.error(message, error);
        this.emit('error', { message: message, error: error });
        vscode.window.showErrorMessage("".concat(message, ": ").concat(error.message));
    };
    ModelVisualizationService.prototype.dispose = function () {
        for (var _i = 0, _a = this.webviewPanels.values(); _i < _a.length; _i++) {
            var panel = _a[_i];
            panel.dispose();
        }
        this.webviewPanels.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    };
    var _a;
    ModelVisualizationService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
        __param(2, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager,
            ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer])
    ], ModelVisualizationService);
    return ModelVisualizationService;
}(events_1.EventEmitter));
exports.ModelVisualizationService = ModelVisualizationService;
