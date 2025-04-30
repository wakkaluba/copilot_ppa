import * as vscode from 'vscode';
import { PerformanceAnalysisResult, WorkspacePerformanceResult } from '../types';
import { PerformanceConfigService } from '../services/PerformanceConfigService';
export declare class PerformanceAnalyzerService {
    private readonly configService;
    private readonly analyzerFactory;
    constructor(configService: PerformanceConfigService);
    analyzeFile(document: vscode.TextDocument): Promise<PerformanceAnalysisResult | null>;
    analyzeWorkspace(files: vscode.Uri[], progress: vscode.Progress<{
        message?: string;
        increment?: number;
    }>, token: vscode.CancellationToken): Promise<WorkspacePerformanceResult>;
    private generateSummary;
}
