import * as vscode from 'vscode';
export interface IStoredMetrics {
    operationTimings: {
        [operationId: string]: number[];
    };
    operationTrends: {
        [operationId: string]: {
            timestamp: number;
            duration: number;
        }[];
    };
    resourceUsage: {
        [operationId: string]: {
            memory: {
                before: NodeJS.MemoryUsage;
                after: NodeJS.MemoryUsage;
            }[];
            cpu: {
                before: NodeJS.CpuUsage;
                after: NodeJS.CpuUsage;
            }[];
        };
    };
    lastUpdated: number;
}
export declare class MetricsStorage {
    private context;
    private static readonly STORAGE_KEY;
    private static readonly MAX_HISTORY_AGE;
    private static readonly MAX_SAMPLES_PER_OPERATION;
    constructor(context: vscode.ExtensionContext);
    saveMetrics(metrics: IStoredMetrics): Promise<void>;
    loadMetrics(): Promise<IStoredMetrics>;
    private cleanupOldData;
    clearMetrics(): Promise<void>;
}
