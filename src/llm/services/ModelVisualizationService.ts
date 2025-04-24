import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../types';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelPerformanceAnalyzer } from './ModelPerformanceAnalyzer';

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        fill: boolean;
    }[];
}

export interface ChartOptions {
    type: 'line' | 'bar' | 'radar';
    title: string;
    yAxisLabel: string;
    showLegend?: boolean;
}

@injectable()
export class ModelVisualizationService extends EventEmitter implements vscode.Disposable {
    private readonly webviewPanels = new Map<string, vscode.WebviewPanel>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager,
        @inject(ModelPerformanceAnalyzer) private readonly performanceAnalyzer: ModelPerformanceAnalyzer
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Visualization');
    }

    public async showPerformanceDashboard(modelId: string): Promise<void> {
        try {
            const panel = await this.createWebviewPanel(`performance-${modelId}`, `Performance Dashboard - ${modelId}`);
            await this.updateDashboard(panel, modelId);
        } catch (error) {
            this.handleError('Failed to show performance dashboard', error as Error);
        }
    }

    private async createWebviewPanel(id: string, title: string): Promise<vscode.WebviewPanel> {
        let panel = this.webviewPanels.get(id);
        
        if (!panel) {
            panel = vscode.window.createWebviewPanel(
                'modelPerformance',
                title,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.onDidDispose(() => {
                this.webviewPanels.delete(id);
            });

            this.webviewPanels.set(id, panel);
        }

        return panel;
    }

    private async updateDashboard(panel: vscode.WebviewPanel, modelId: string): Promise<void> {
        const metrics = await this.metricsManager.getMetricsHistory(modelId);
        if (!metrics || metrics.length === 0) {
            panel.webview.html = this.generateEmptyDashboard();
            return;
        }

        const performanceData = await this.preparePerformanceData(modelId);
        panel.webview.html = this.generateDashboardHtml(performanceData);
    }

    private async preparePerformanceData(modelId: string): Promise<{[key: string]: ChartData}> {
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

    private generateDashboardHtml(data: {[key: string]: ChartData}): string {
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

    private generateEmptyDashboard(): string {
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

    private handleError(message: string, error: Error): void {
        this.logger.error(message, error);
        this.emit('error', { message, error });
        vscode.window.showErrorMessage(`${message}: ${error.message}`);
    }

    public dispose(): void {
        for (const panel of this.webviewPanels.values()) {
            panel.dispose();
        }
        this.webviewPanels.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
