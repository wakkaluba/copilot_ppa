import * as vscode from 'vscode';
import { AnalyzerOptions } from '../types';

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