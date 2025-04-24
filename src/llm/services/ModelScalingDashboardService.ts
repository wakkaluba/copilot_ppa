import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ModelScalingMetricsService, ScalingMetrics } from './ModelScalingMetricsService';

@injectable()
export class ModelScalingDashboardService implements vscode.Disposable {
    private readonly panels = new Map<string, vscode.WebviewPanel>();
    private readonly updateInterval: NodeJS.Timer;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelScalingMetricsService) private readonly metricsService: ModelScalingMetricsService
    ) {
        this.updateInterval = setInterval(() => this.updateAllPanels(), 5000);
        this.metricsService.on('metricsCollected', this.handleMetricsUpdate.bind(this));
    }

    public async showDashboard(modelId: string): Promise<void> {
        try {
            let panel = this.panels.get(modelId);
            
            if (!panel) {
                panel = vscode.window.createWebviewPanel(
                    'scalingDashboard',
                    `Scaling Dashboard: ${modelId}`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                panel.onDidDispose(() => {
                    this.panels.delete(modelId);
                });

                this.panels.set(modelId, panel);
            }

            const metrics = await this.getMetricsData(modelId);
            panel.webview.html = this.generateDashboardHtml(modelId, metrics);
            panel.reveal();

        } catch (error) {
            this.handleError('Failed to show dashboard', error);
        }
    }

    private async updateAllPanels(): Promise<void> {
        for (const [modelId, panel] of this.panels.entries()) {
            try {
                const metrics = await this.getMetricsData(modelId);
                panel.webview.html = this.generateDashboardHtml(modelId, metrics);
            } catch (error) {
                this.handleError(`Failed to update dashboard for ${modelId}`, error);
            }
        }
    }

    private async getMetricsData(modelId: string): Promise<ScalingMetrics[]> {
        return this.metricsService.getMetricsHistory(modelId, 3600000); // Last hour
    }

    private handleMetricsUpdate({ modelId }: { modelId: string }): void {
        const panel = this.panels.get(modelId);
        if (panel) {
            this.updateAllPanels();
        }
    }

    private generateDashboardHtml(modelId: string, metrics: ScalingMetrics[]): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Scaling Dashboard - ${modelId}</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                    }
                    .chart-container {
                        margin-bottom: 30px;
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                        padding: 10px;
                    }
                    .metrics-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .metric-card {
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                        padding: 15px;
                    }
                    h2 {
                        color: var(--vscode-editor-foreground);
                        margin-top: 0;
                    }
                </style>
            </head>
            <body>
                <h1>Scaling Dashboard - ${modelId}</h1>
                
                <div class="metrics-grid">
                    ${this.generateCurrentMetricsHtml(metrics[metrics.length - 1])}
                </div>

                <div class="chart-container">
                    <h2>Performance Metrics</h2>
                    <canvas id="performanceChart"></canvas>
                </div>

                <div class="chart-container">
                    <h2>Resource Utilization</h2>
                    <canvas id="resourceChart"></canvas>
                </div>

                <div class="chart-container">
                    <h2>Scaling Metrics</h2>
                    <canvas id="scalingChart"></canvas>
                </div>

                <script>
                    ${this.generateChartsScript(metrics)}
                </script>
            </body>
            </html>
        `;
    }

    private generateCurrentMetricsHtml(metrics: ScalingMetrics): string {
        if (!metrics) return '';

        return `
            <div class="metric-card">
                <h3>Performance</h3>
                <p>Response Time: ${metrics.performance.responseTime.toFixed(2)}ms</p>
                <p>Throughput: ${metrics.performance.throughput.toFixed(2)}/s</p>
                <p>Error Rate: ${(metrics.performance.errorRate * 100).toFixed(2)}%</p>
            </div>
            <div class="metric-card">
                <h3>Resources</h3>
                <p>CPU: ${metrics.resources.cpu.toFixed(1)}%</p>
                <p>Memory: ${metrics.resources.memory.toFixed(1)}%</p>
                ${metrics.resources.gpu ? `<p>GPU: ${metrics.resources.gpu.toFixed(1)}%</p>` : ''}
            </div>
            <div class="metric-card">
                <h3>Scaling</h3>
                <p>Nodes: ${metrics.scaling.currentNodes}</p>
                <p>Active Connections: ${metrics.scaling.activeConnections}</p>
                <p>Queue Length: ${metrics.scaling.queueLength}</p>
            </div>
            <div class="metric-card">
                <h3>Availability</h3>
                <p>Success Rate: ${(metrics.availability.successRate * 100).toFixed(2)}%</p>
                <p>Uptime: ${this.formatUptime(metrics.availability.uptime)}</p>
                <p>Degraded Periods: ${metrics.availability.degradedPeriods}</p>
            </div>
        `;
    }

    private generateChartsScript(metrics: ScalingMetrics[]): string {
        const labels = metrics.map(m => new Date(m.timestamp).toLocaleTimeString());
        
        return `
            const ctx1 = document.getElementById('performanceChart').getContext('2d');
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: ${JSON.stringify(metrics.map(m => m.performance.responseTime))},
                        borderColor: '#2196F3'
                    }, {
                        label: 'Throughput',
                        data: ${JSON.stringify(metrics.map(m => m.performance.throughput))},
                        borderColor: '#4CAF50'
                    }]
                },
                options: {
                    responsive: true,
                    animation: false
                }
            });

            const ctx2 = document.getElementById('resourceChart').getContext('2d');
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                        label: 'CPU %',
                        data: ${JSON.stringify(metrics.map(m => m.resources.cpu))},
                        borderColor: '#FF9800'
                    }, {
                        label: 'Memory %',
                        data: ${JSON.stringify(metrics.map(m => m.resources.memory))},
                        borderColor: '#E91E63'
                    }]
                },
                options: {
                    responsive: true,
                    animation: false
                }
            });

            const ctx3 = document.getElementById('scalingChart').getContext('2d');
            new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                        label: 'Nodes',
                        data: ${JSON.stringify(metrics.map(m => m.scaling.currentNodes))},
                        borderColor: '#9C27B0'
                    }, {
                        label: 'Queue Length',
                        data: ${JSON.stringify(metrics.map(m => m.scaling.queueLength))},
                        borderColor: '#FF5722'
                    }]
                },
                options: {
                    responsive: true,
                    animation: false
                }
            });
        `;
    }

    private formatUptime(uptimeMs: number): string {
        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        void vscode.window.showErrorMessage(`${message}: ${error instanceof Error ? error.message : String(error)}`);
    }

    public dispose(): void {
        clearInterval(this.updateInterval);
        for (const panel of this.panels.values()) {
            panel.dispose();
        }
        this.panels.clear();
    }
}
