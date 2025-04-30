import { MemoryMetrics } from '../performance/memoryMetrics';
export declare class MemoryVisualizationPanel {
    private static createChartScript;
    static getWebviewContent(metrics: MemoryMetrics[]): string;
}
