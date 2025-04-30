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
export declare class PerformanceConfigService {
    private readonly configSection;
    private config;
    constructor();
    initialize(): Promise<void>;
    isProfilingEnabled(): boolean;
    isBottleneckDetectionEnabled(): boolean;
    getCachingOptions(): CachingOptions;
    getAsyncOptions(): AsyncOptions;
    getAnalyzerOptions(): AnalyzerOptions;
}
