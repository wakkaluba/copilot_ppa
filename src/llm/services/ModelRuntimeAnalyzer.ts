import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../common/logging';
import { ModelMetricsManager } from './ModelMetricsManager';
import { ModelResourceMonitorV2 } from './ModelResourceMonitorV2';
import { ModelHealthMonitorV2 } from './ModelHealthMonitorV2';

interface RuntimeMetrics {
    timestamp: number;
    performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
    };
    resources: {
        cpu: {
            usage: number;
            temperature?: number;
        };
        memory: {
            used: number;
            total: number;
            percent: number;
        };
        gpu?: {
            usage: number;
            memory: {
                used: number;
                total: number;
            };
        };
    };
}

@injectable()
export class ModelRuntimeAnalyzer extends EventEmitter implements vscode.Disposable {
    private readonly metricsHistory = new Map<string, RuntimeMetrics[]>();
    private readonly analysisIntervals = new Map<string, NodeJS.Timer>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager,
        @inject(ModelResourceMonitorV2) private readonly resourceMonitor: ModelResourceMonitorV2,
        @inject(ModelHealthMonitorV2) private readonly healthMonitor: ModelHealthMonitorV2,
        private readonly config = {
            analysisInterval: 60000, // 1 minute
            historyRetention: 24 * 60 * 60 * 1000, // 24 hours
            performanceThresholds: {
                responseTime: 5000, // 5 seconds
                errorRate: 0.05, // 5%
                cpuUsage: 80, // 80%
                memoryUsage: 80 // 80%
            }
        }
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Runtime Analysis');
    }

    public async startAnalysis(modelId: string): Promise<void> {
        try {
            if (this.analysisIntervals.has(modelId)) {
                return;
            }

            await this.initializeAnalysis(modelId);
            const interval = setInterval(
                () => this.analyzeRuntime(modelId),
                this.config.analysisInterval
            );
            this.analysisIntervals.set(modelId, interval);

            this.emit('analysisStarted', { modelId });
            this.logger.info(`Started runtime analysis for model ${modelId}`);

        } catch (error) {
            this.handleError(`Failed to start analysis for model ${modelId}`, error as Error);
            throw error;
        }
    }

    public stopAnalysis(modelId: string): void {
        const interval = this.analysisIntervals.get(modelId);
        if (interval) {
            clearInterval(interval);
            this.analysisIntervals.delete(modelId);
            this.emit('analysisStopped', { modelId });
        }
    }

    private async initializeAnalysis(modelId: string): Promise<void> {
        const metrics = await this.gatherMetrics(modelId);
        this.metricsHistory.set(modelId, [metrics]);
    }

    private async analyzeRuntime(modelId: string): Promise<void> {
        try {
            const metrics = await this.gatherMetrics(modelId);
            const analysis = this.analyzeMetrics(modelId, metrics);
            
            this.updateMetricsHistory(modelId, metrics);
            this.emit('analysisUpdated', { modelId, analysis });
            this.logAnalysis(modelId, analysis);

        } catch (error) {
            this.handleError(`Failed to analyze runtime for model ${modelId}`, error as Error);
        }
    }

    private async gatherMetrics(modelId: string): Promise<RuntimeMetrics> {
        const [performanceMetrics, resourceMetrics] = await Promise.all([
            this.metricsManager.getLatestMetrics(modelId),
            this.resourceMonitor.getLatestMetrics(modelId)
        ]);

        return {
            timestamp: Date.now(),
            performance: {
                responseTime: performanceMetrics?.averageResponseTime || 0,
                throughput: performanceMetrics?.tokenThroughput || 0,
                errorRate: performanceMetrics?.errorRate || 0
            },
            resources: resourceMetrics || {
                cpu: { usage: 0 },
                memory: { used: 0, total: 0, percent: 0 }
            }
        };
    }

    private analyzeMetrics(modelId: string, current: RuntimeMetrics): any {
        const history = this.metricsHistory.get(modelId) || [];
        const analysis = {
            performance: this.analyzePerformance(current, history),
            resources: this.analyzeResources(current),
            recommendations: this.generateRecommendations(current)
        };

        return analysis;
    }

    private analyzePerformance(current: RuntimeMetrics, history: RuntimeMetrics[]): any {
        // Analyze response time trends
        const responseTimeTrend = this.calculateTrend(
            history.map(m => m.performance.responseTime)
        );

        // Analyze throughput trends
        const throughputTrend = this.calculateTrend(
            history.map(m => m.performance.throughput)
        );

        // Analyze error rate trends
        const errorRateTrend = this.calculateTrend(
            history.map(m => m.performance.errorRate)
        );

        return {
            current: current.performance,
            trends: {
                responseTime: responseTimeTrend,
                throughput: throughputTrend,
                errorRate: errorRateTrend
            }
        };
    }

    private analyzeResources(metrics: RuntimeMetrics): any {
        const warnings = [];
        
        if (metrics.resources.cpu.usage > this.config.performanceThresholds.cpuUsage) {
            warnings.push(`High CPU usage: ${metrics.resources.cpu.usage}%`);
        }

        if (metrics.resources.memory.percent > this.config.performanceThresholds.memoryUsage) {
            warnings.push(`High memory usage: ${metrics.resources.memory.percent}%`);
        }

        return {
            current: metrics.resources,
            warnings
        };
    }

    private generateRecommendations(metrics: RuntimeMetrics): string[] {
        const recommendations = [];

        if (metrics.performance.responseTime > this.config.performanceThresholds.responseTime) {
            recommendations.push('Consider reducing model size or batch size to improve response time');
        }

        if (metrics.performance.errorRate > this.config.performanceThresholds.errorRate) {
            recommendations.push('Investigate error patterns and implement retry mechanisms');
        }

        if (metrics.resources.cpu.usage > this.config.performanceThresholds.cpuUsage) {
            recommendations.push('Consider scaling horizontally or optimizing resource allocation');
        }

        return recommendations;
    }

    private calculateTrend(values: number[]): number {
        if (values.length < 2) return 0;
        
        const recent = values.slice(-5);
        const avgChange = recent.slice(1).reduce((sum, val, i) => {
            return sum + (val - recent[i]);
        }, 0) / (recent.length - 1);

        return avgChange;
    }

    private updateMetricsHistory(modelId: string, metrics: RuntimeMetrics): void {
        const history = this.metricsHistory.get(modelId) || [];
        history.push(metrics);

        // Maintain history within retention period
        const cutoff = Date.now() - this.config.historyRetention;
        const filtered = history.filter(m => m.timestamp >= cutoff);
        
        this.metricsHistory.set(modelId, filtered);
    }

    private logAnalysis(modelId: string, analysis: any): void {
        this.outputChannel.appendLine('\nRuntime Analysis:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Time: ${new Date().toISOString()}`);
        this.outputChannel.appendLine('Performance:');
        this.outputChannel.appendLine(JSON.stringify(analysis.performance, null, 2));
        this.outputChannel.appendLine('Resources:');
        this.outputChannel.appendLine(JSON.stringify(analysis.resources, null, 2));
        if (analysis.recommendations.length > 0) {
            this.outputChannel.appendLine('Recommendations:');
            analysis.recommendations.forEach((rec: string) => {
                this.outputChannel.appendLine(`- ${rec}`);
            });
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelRuntimeAnalyzer]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        for (const timer of this.analysisIntervals.values()) {
            clearInterval(timer);
        }
        this.analysisIntervals.clear();
        this.metricsHistory.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
