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
exports.ModelVisualizationService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const ModelMetricsManager_1 = require("./ModelMetricsManager");
const ModelPerformanceAnalyzer_1 = require("./ModelPerformanceAnalyzer");
let ModelVisualizationService = class ModelVisualizationService extends events_1.EventEmitter {
    logger;
    metricsManager;
    performanceAnalyzer;
    webviewPanels = new Map();
    outputChannel;
    constructor(logger, metricsManager, performanceAnalyzer) {
        super();
        this.logger = logger;
        this.metricsManager = metricsManager;
        this.performanceAnalyzer = performanceAnalyzer;
        this.outputChannel = vscode.window.createOutputChannel('Model Visualization');
    }
    async showPerformanceDashboard(modelId) {
        try {
            const panel = await this.createWebviewPanel(`performance-${modelId}`, `Performance Dashboard - ${modelId}`);
            await this.updateDashboard(panel, modelId);
        }
        catch (error) {
            this.handleError('Failed to show performance dashboard', error);
        }
    }
    async createWebviewPanel(id, title) {
        let panel = this.webviewPanels.get(id);
        if (!panel) {
            panel = vscode.window.createWebviewPanel('modelPerformance', title, vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            panel.onDidDispose(() => {
                this.webviewPanels.delete(id);
            });
            this.webviewPanels.set(id, panel);
        }
        return panel;
    }
    async updateDashboard(panel, modelId) {
        const metrics = await this.metricsManager.getMetricsHistory(modelId);
        if (!metrics || metrics.length === 0) {
            panel.webview.html = this.generateEmptyDashboard();
            return;
        }
        const performanceData = await this.preparePerformanceData(modelId);
        panel.webview.html = this.generateDashboardHtml(performanceData);
    }
    async preparePerformanceData(modelId) {
        const metrics = await this.metricsManager.getMetricsHistory(modelId);
        const timestamps = metrics.map(m => new Date(m.timestamp).toLocaleTimeString());
        return {
            responseTime: {
                labels: timestamps,
                datasets: [{
                        label: 'Response Time (ms)',
                        data: metrics.map(m => m.metrics.averageResponseTime),
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true
                    }]
            },
            throughput: {
                labels: timestamps,
                datasets: [{
                        label: 'Tokens/Second',
                        data: metrics.map(m => m.metrics.tokenThroughput),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true
                    }]
            },
            errorRate: {
                labels: timestamps,
                datasets: [{
                        label: 'Error Rate (%)',
                        data: metrics.map(m => m.metrics.errorRate * 100),
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        fill: true
                    }]
            }
        };
    }
    generateDashboardHtml(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    body {
                        padding: 20px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    .chart-container {
                        width: 100%;
                        height: 300px;
                        margin-bottom: 30px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                        padding: 20px;
                    }
                    h2 {
                        color: var(--vscode-editor-foreground);
                        margin-bottom: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="chart-container">
                    <h2>Response Time</h2>
                    <canvas id="responseTimeChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Throughput</h2>
                    <canvas id="throughputChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Error Rate</h2>
                    <canvas id="errorRateChart"></canvas>
                </div>

                <script>
                    const charts = {
                        responseTime: ${JSON.stringify(data.responseTime)},
                        throughput: ${JSON.stringify(data.throughput)},
                        errorRate: ${JSON.stringify(data.errorRate)}
                    };

                    function createChart(elementId, data, options = {}) {
                        const ctx = document.getElementById(elementId).getContext('2d');
                        return new Chart(ctx, {
                            type: 'line',
                            data: data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top',
                                        labels: {
                                            color: getComputedStyle(document.body).color
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        grid: {
                                            color: 'rgba(255, 255, 255, 0.1)'
                                        },
                                        ticks: {
                                            color: getComputedStyle(document.body).color
                                        }
                                    },
                                    y: {
                                        grid: {
                                            color: 'rgba(255, 255, 255, 0.1)'
                                        },
                                        ticks: {
                                            color: getComputedStyle(document.body).color
                                        }
                                    }
                                },
                                ...options
                            }
                        });
                    }

                    createChart('responseTimeChart', charts.responseTime);
                    createChart('throughputChart', charts.throughput);
                    createChart('errorRateChart', charts.errorRate);
                </script>
            </body>
            </html>
        `;
    }
    generateEmptyDashboard() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 300px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    .message {
                        text-align: center;
                        font-size: 1.2em;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <p>No performance data available.</p>
                    <p>Run some operations to generate metrics.</p>
                </div>
            </body>
            </html>
        `;
    }
    handleError(message, error) {
        this.logger.error(message, error);
        this.emit('error', { message, error });
        vscode.window.showErrorMessage(`${message}: ${error.message}`);
    }
    dispose() {
        for (const panel of this.webviewPanels.values()) {
            panel.dispose();
        }
        this.webviewPanels.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
};
exports.ModelVisualizationService = ModelVisualizationService;
exports.ModelVisualizationService = ModelVisualizationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
    __param(2, (0, inversify_1.inject)(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer)),
    __metadata("design:paramtypes", [Object, ModelMetricsManager_1.ModelMetricsManager,
        ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer])
], ModelVisualizationService);
//# sourceMappingURL=ModelVisualizationService.js.map