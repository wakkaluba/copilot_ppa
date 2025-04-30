import * as vscode from 'vscode';
import { ILogger } from '../../../logging/ILogger';
import { EventEmitter } from 'events';
import { PerformanceMetrics } from '../types';
export declare class PerformanceMetricsService extends EventEmitter {
    private readonly logger;
    constructor(logger: ILogger);
    analyzeFile(document: vscode.TextDocument, progress: vscode.Progress<{
        message?: string;
        increment?: number;
    }>): Promise<PerformanceMetrics>;
    private calculateComplexity;
    private calculateMaintainability;
    private countFunctions;
    private detectDuplicateCode;
    private detectUnusedCode;
    private handleError;
    dispose(): void;
}
