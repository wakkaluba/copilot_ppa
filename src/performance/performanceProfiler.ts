import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { PerformanceSessionService } from './services/PerformanceSessionService';
import { MetricsCaptureService } from './services/MetricsCaptureService';
import { PersistenceService } from './services/PersistenceService';
import { BottleneckDetectionService } from './services/BottleneckDetectionService';
import { CachingService } from './services/CachingService';

/**
 * PerformanceProfiler measures, collects, and analyzes performance data
 * for various operations in the extension
 */
export class PerformanceProfiler {
    private static instance: PerformanceProfiler;
    private sessionService: PerformanceSessionService;
    private captureService: MetricsCaptureService;
    private persistenceService: PersistenceService;
    private bottleneckService: BottleneckDetectionService;
    private cacheService: CachingService;

    private constructor(context: vscode.ExtensionContext) {
        this.sessionService = new PerformanceSessionService(context);
        this.captureService = new MetricsCaptureService();
        this.persistenceService = new PersistenceService(context);
        this.bottleneckService = new BottleneckDetectionService();
        this.cacheService = new CachingService();
    }

    public static getInstance(context: vscode.ExtensionContext): PerformanceProfiler {
        if (!PerformanceProfiler.instance) {
            PerformanceProfiler.instance = new PerformanceProfiler(context);
        }
        return PerformanceProfiler.instance;
    }

    public setEnabled(enabled: boolean): void {
        this.sessionService.enableProfiling(enabled);
    }

    public startOperation(id: string): void {
        this.sessionService.startSession(id);
    }

    public endOperation(id: string, note?: string): void {
        const metrics = this.captureService.capture(id);
        this.sessionService.recordMetrics(id, metrics, note);
        this.bottleneckService.analyze(id, metrics);
    }

    public getStats(id: string) {
        return this.sessionService.getStats(id);
    }

    public getTrend(id: string) {
        return this.sessionService.getTrend(id);
    }

    public getResourceStats(id: string) {
        return this.sessionService.getResourceStats(id);
    }

    public resetStats(): void {
        this.sessionService.reset(id);
    }

    public async clearStoredMetrics(): Promise<void> {
        await this.persistenceService.clear();
    }

    public dispose(): void {
        this.persistenceService.persistAll();
    }
}
