import * as vscode from 'vscode';
import { LLMProviderStatus, ConnectionMetrics } from '../types';

/**
 * Service for tracking and managing LLM connection metrics
 */
export class LLMMetricsService implements vscode.Disposable {
    private metrics: Map<string, ConnectionMetrics> = new Map();
    private activeProvider: string | null = null;
    private startTimes: Map<string, number> = new Map();

    public initializeMetrics(providerName: string): void {
        if (!this.metrics.has(providerName)) {
            this.metrics.set(providerName, {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                lastResponseTime: 0,
                uptime: 0,
                lastError: undefined,
                lastErrorTime: undefined
            });
        }
    }

    public setActiveProvider(providerName: string): void {
        this.activeProvider = providerName;
        this.startTimes.set(providerName, Date.now());
        this.updateUptime(providerName);
    }

    public recordRequest(providerName: string, success: boolean, responseTime: number): void {
        const metrics = this.getProviderMetrics(providerName);
        metrics.totalRequests++;
        
        if (success) {
            metrics.successfulRequests++;
        } else {
            metrics.failedRequests++;
        }

        metrics.lastResponseTime = responseTime;
        metrics.averageResponseTime = this.calculateNewAverage(
            metrics.averageResponseTime,
            responseTime,
            metrics.totalRequests
        );
    }

    public recordError(providerName: string, error: Error): void {
        const metrics = this.getProviderMetrics(providerName);
        metrics.lastError = error;
        metrics.lastErrorTime = new Date();
        metrics.failedRequests++;
    }

    public recordConnectionTime(providerName: string, connectionTime: number): void {
        const metrics = this.getProviderMetrics(providerName);
        metrics.lastResponseTime = connectionTime;
        metrics.averageResponseTime = this.calculateNewAverage(
            metrics.averageResponseTime,
            connectionTime,
            metrics.totalRequests + 1
        );
    }

    public getMetrics(providerName?: string): ConnectionMetrics | undefined {
        return this.metrics.get(providerName || this.activeProvider || '');
    }

    public getAllMetrics(): Map<string, ConnectionMetrics> {
        // Update all uptimes before returning
        for (const [providerName] of this.metrics) {
            this.updateUptime(providerName);
        }
        return new Map(this.metrics);
    }

    private getProviderMetrics(providerName: string): ConnectionMetrics {
        if (!this.metrics.has(providerName)) {
            this.initializeMetrics(providerName);
        }
        return this.metrics.get(providerName)!;
    }

    private calculateNewAverage(currentAvg: number, newValue: number, totalCount: number): number {
        return (currentAvg * (totalCount - 1) + newValue) / totalCount;
    }

    private updateUptime(providerName: string): void {
        const startTime = this.startTimes.get(providerName);
        if (startTime && this.activeProvider === providerName) {
            const metrics = this.getProviderMetrics(providerName);
            metrics.uptime = Date.now() - startTime;
        }
    }

    public resetMetrics(providerName: string): void {
        this.metrics.set(providerName, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastResponseTime: 0,
            uptime: 0,
            lastError: undefined,
            lastErrorTime: undefined
        });
        this.startTimes.delete(providerName);
    }

    public dispose(): void {
        this.metrics.clear();
        this.startTimes.clear();
        this.activeProvider = null;
    }
}