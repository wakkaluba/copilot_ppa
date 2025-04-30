import * as vscode from 'vscode';
import { PerformanceAnalysisResult } from '../types';
export declare class PerformanceDiagnosticsService implements vscode.Disposable {
    private readonly diagnosticCollection;
    constructor();
    updateDiagnostics(document: vscode.TextDocument, result: PerformanceAnalysisResult): void;
    private getSeverity;
    dispose(): void;
}
