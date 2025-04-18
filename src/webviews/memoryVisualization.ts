import { MemoryMetrics } from '../performance/memoryMetrics';

export class MemoryVisualizationPanel {
    private static createChartScript(metrics: MemoryMetrics[]): string {
        const labels = metrics.map(m => new Date(m.timestamp).toLocaleTimeString());
        const heapData = metrics.map(m => m.heapUsed / 1024 / 1024); // Convert to MB
        
        return `
            const ctx = document.getElementById('memoryChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                        label: 'Heap Usage (MB)',
                        data: ${JSON.stringify(heapData)},
                        borderColor: '#007acc',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Memory Usage (MB)'
                            }
                        }
                    }
                }
            });
        `;
    }

    public static getWebviewContent(metrics: MemoryMetrics[]): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    .chart-container {
                        width: 100%;
                        height: 400px;
                        padding: 20px;
                    }
                    .metrics-summary {
                        padding: 20px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                </style>
            </head>
            <body>
                <div class="metrics-summary">
                    <h2>Memory Optimization Summary</h2>
                    <p>Total Optimizations: ${metrics[metrics.length - 1]?.optimizationCount || 0}</p>
                    <p>Average Optimization Time: ${(metrics[metrics.length - 1]?.averageOptimizationTime || 0).toFixed(2)}ms</p>
                </div>
                <div class="chart-container">
                    <canvas id="memoryChart"></canvas>
                </div>
                <script>
                    ${this.createChartScript(metrics)}
                </script>
            </body>
            </html>
        `;
    }
}