import * as vscode from 'vscode';
import { AnalyzerOptions } from '../types';

export interface CachingOptions {
    enabled: boolean;
    maxSize: number;
    ttlMinutes: number;
}

export interface AsyncOptions {
    batchSize: number;
    concurrencyLimit: number;
    timeoutMs: number;
}

export class PerformanceConfigService {
    private readonly configSection = 'copilot-ppa.performance';
    private config: vscode.WorkspaceConfiguration;
    private configCache: Map<string, any> = new Map();
    private cacheExpiry: number = 5000; // 5 second cache
    private lastCacheUpdate: number = 0;

    constructor() {
        this.config = vscode.workspace.getConfiguration(this.configSection);
        this.updateCache();
    }

    private updateCache(): void {
        const now = Date.now();
        if (now - this.lastCacheUpdate > this.cacheExpiry) {
            this.config = vscode.workspace.getConfiguration(this.configSection);
            this.configCache.clear();
            this.lastCacheUpdate = now;
        }
    }

    private getCachedValue<T>(key: string, defaultValue: T): T {
        this.updateCache();
        if (!this.configCache.has(key)) {
            const value = this.config.get<T>(key, defaultValue);
            this.configCache.set(key, value);
            return value;
        }
        return this.configCache.get(key);
    }

    public async initialize(): Promise<void> {
        this.config = vscode.workspace.getConfiguration(this.configSection);
    }

    public isProfilingEnabled(): boolean {
        return this.getCachedValue('profilingEnabled', false);
    }

    public isBottleneckDetectionEnabled(): boolean {
        return this.getCachedValue('bottleneckDetectionEnabled', false);
    }

    public getCachingOptions(): CachingOptions {
        return {
            enabled: this.getCachedValue('caching.enabled', true),
            maxSize: this.getCachedValue('caching.maxSize', 100),
            ttlMinutes: this.getCachedValue('caching.ttlMinutes', 60)
        };
    }

    public getAsyncOptions(): AsyncOptions {
        return {
            batchSize: this.getCachedValue('async.batchSize', 10),
            concurrencyLimit: this.getCachedValue('async.concurrencyLimit', 5),
            timeoutMs: this.getCachedValue('async.timeoutMs', 30000)
        };
    }

    public getAnalyzerOptions(): AnalyzerOptions {
        return {
            maxFileSize: this.getCachedValue('maxFileSize', 1024 * 1024),
            excludePatterns: this.getCachedValue('excludePatterns', ['**/node_modules/**']),
            includeTests: this.getCachedValue('includeTests', false),
            thresholds: {
                cyclomaticComplexity: this.getCachedValue('thresholds.cyclomaticComplexity', [10, 20]),
                nestedBlockDepth: this.getCachedValue('thresholds.nestedBlockDepth', [3, 5]),
                functionLength: this.getCachedValue('thresholds.functionLength', [50, 100]),
                parameterCount: this.getCachedValue('thresholds.parameterCount', [4, 7]),
                maintainabilityIndex: this.getCachedValue('thresholds.maintainabilityIndex', [65, 85]),
                commentRatio: this.getCachedValue('thresholds.commentRatio', [10, 20])
            }
        };
    }
}
