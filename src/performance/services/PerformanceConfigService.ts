import * as vscode from 'vscode';
import { AnalyzerOptions, LanguageMetricThresholds } from '../types';

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
    private readonly configSection = 'performance';
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration(this.configSection);
    }

    public async initialize(): Promise<void> {
        this.config = vscode.workspace.getConfiguration(this.configSection);
    }

    public isProfilingEnabled(): boolean {
        return this.config.get<boolean>('profilingEnabled', false);
    }

    public isBottleneckDetectionEnabled(): boolean {
        return this.config.get<boolean>('bottleneckDetectionEnabled', false);
    }

    public getCachingOptions(): CachingOptions {
        return {
            enabled: this.config.get<boolean>('caching.enabled', true),
            maxSize: this.config.get<number>('caching.maxSize', 100),
            ttlMinutes: this.config.get<number>('caching.ttlMinutes', 60)
        };
    }

    public getAsyncOptions(): AsyncOptions {
        return {
            batchSize: this.config.get<number>('async.batchSize', 10),
            concurrencyLimit: this.config.get<number>('async.concurrencyLimit', 5),
            timeoutMs: this.config.get<number>('async.timeoutMs', 30000)
        };
    }

    public getAnalyzerOptions(): AnalyzerOptions {
        return {
            maxFileSize: this.config.get<number>('maxFileSize', 1024 * 1024),
            excludePatterns: this.config.get<string[]>('excludePatterns', ['**/node_modules/**']),
            includeTests: this.config.get<boolean>('includeTests', false),
            thresholds: {
                cyclomaticComplexity: this.config.get<[number, number]>('thresholds.cyclomaticComplexity', [10, 20]),
                nestedBlockDepth: this.config.get<[number, number]>('thresholds.nestedBlockDepth', [3, 5]),
                functionLength: this.config.get<[number, number]>('thresholds.functionLength', [50, 100]),
                parameterCount: this.config.get<[number, number]>('thresholds.parameterCount', [4, 7]),
                maintainabilityIndex: this.config.get<[number, number]>('thresholds.maintainabilityIndex', [65, 85]),
                commentRatio: this.config.get<[number, number]>('thresholds.commentRatio', [10, 20])
            }
        };
    }
}