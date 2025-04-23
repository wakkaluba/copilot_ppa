import * as vscode from 'vscode';

export interface ModelMetrics {
    id: string;
    duration: number;
    success: boolean;
}

export class ModelMetricsService implements vscode.Disposable {
    private metrics = new Map<string, ModelMetrics[]>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Model Metrics');
    }

    public recordMetrics(metric: ModelMetrics): void {
        const modelMetrics = this.metrics.get(metric.id) || [];
        modelMetrics.push(metric);
        this.metrics.set(metric.id, modelMetrics);
        
        // Log metric for debugging
        this.outputChannel.appendLine(`[${new Date().toISOString()}] Model ${metric.id}: duration=${metric.duration}ms, success=${metric.success}`);
    }

    public getMetrics(modelId: string): ModelMetrics[] {
        return this.metrics.get(modelId) || [];
    }

    public getAverageSuccessRate(modelId: string): number {
        const modelMetrics = this.metrics.get(modelId);
        if (!modelMetrics || modelMetrics.length === 0) {
            return 0;
        }

        const successCount = modelMetrics.filter(m => m.success).length;
        return successCount / modelMetrics.length;
    }

    public getAverageResponseTime(modelId: string): number {
        const modelMetrics = this.metrics.get(modelId);
        if (!modelMetrics || modelMetrics.length === 0) {
            return 0;
        }

        const totalDuration = modelMetrics.reduce((sum, m) => sum + m.duration, 0);
        return totalDuration / modelMetrics.length;
    }

    public clearMetrics(modelId: string): void {
        this.metrics.delete(modelId);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.metrics.clear();
    }
}