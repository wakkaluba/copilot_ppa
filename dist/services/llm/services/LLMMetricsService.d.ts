import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ConnectionMetrics } from '../types';
/**
 * Service for tracking and managing LLM connection metrics
 */
export declare class LLMMetricsService extends EventEmitter implements vscode.Disposable {
    private metrics;
    private activeProvider;
    private startTimes;
    initializeMetrics(providerName: string): void;
    setActiveProvider(providerName: string): void;
    recordRequest(providerName: string, success: boolean, responseTime: number): void;
    recordRequestSuccess(providerId: string, responseTime: number, tokenCount: number): void;
    recordRequestFailure(providerId: string, error: Error): void;
    recordError(providerName: string, error: Error): void;
    recordConnectionTime(providerName: string, connectionTime: number): void;
    getMetrics(providerName?: string): ConnectionMetrics | undefined;
    getAllMetrics(): Map<string, ConnectionMetrics>;
    private getProviderMetrics;
    private calculateNewAverage;
    private calculateCost;
    private updateResourceUsage;
    private updateUptime;
    resetMetrics(providerName: string): void;
    dispose(): void;
}
