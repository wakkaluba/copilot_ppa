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
exports.ModelVisualizationService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelVisualizationService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelVisualizationService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelVisualizationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
    return ModelVisualizationService = _classThis;
})();
exports.ModelVisualizationService = ModelVisualizationService;
//# sourceMappingURL=ModelVisualizationService.js.map