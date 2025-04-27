"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryVisualizationPanel = void 0;
var MemoryVisualizationPanel = /** @class */ (function () {
    function MemoryVisualizationPanel() {
    }
    MemoryVisualizationPanel.createChartScript = function (metrics) {
        var labels = metrics.map(function (m) { return new Date(m.timestamp).toLocaleTimeString(); });
        var heapData = metrics.map(function (m) { return m.heapUsed / 1024 / 1024; }); // Convert to MB
        return "\n            const ctx = document.getElementById('memoryChart').getContext('2d');\n            new Chart(ctx, {\n                type: 'line',\n                data: {\n                    labels: ".concat(JSON.stringify(labels), ",\n                    datasets: [{\n                        label: 'Heap Usage (MB)',\n                        data: ").concat(JSON.stringify(heapData), ",\n                        borderColor: '#007acc',\n                        tension: 0.1\n                    }]\n                },\n                options: {\n                    responsive: true,\n                    scales: {\n                        y: {\n                            beginAtZero: true,\n                            title: {\n                                display: true,\n                                text: 'Memory Usage (MB)'\n                            }\n                        }\n                    }\n                }\n            });\n        ");
    };
    MemoryVisualizationPanel.getWebviewContent = function (metrics) {
        var _a, _b;
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n                <style>\n                    .chart-container {\n                        width: 100%;\n                        height: 400px;\n                        padding: 20px;\n                    }\n                    .metrics-summary {\n                        padding: 20px;\n                        background-color: var(--vscode-editor-background);\n                        color: var(--vscode-editor-foreground);\n                    }\n                </style>\n            </head>\n            <body>\n                <div class=\"metrics-summary\">\n                    <h2>Memory Optimization Summary</h2>\n                    <p>Total Optimizations: ".concat(((_a = metrics[metrics.length - 1]) === null || _a === void 0 ? void 0 : _a.optimizationCount) || 0, "</p>\n                    <p>Average Optimization Time: ").concat((((_b = metrics[metrics.length - 1]) === null || _b === void 0 ? void 0 : _b.averageOptimizationTime) || 0).toFixed(2), "ms</p>\n                </div>\n                <div class=\"chart-container\">\n                    <canvas id=\"memoryChart\"></canvas>\n                </div>\n                <script>\n                    ").concat(this.createChartScript(metrics), "\n                </script>\n            </body>\n            </html>\n        ");
    };
    return MemoryVisualizationPanel;
}());
exports.MemoryVisualizationPanel = MemoryVisualizationPanel;
