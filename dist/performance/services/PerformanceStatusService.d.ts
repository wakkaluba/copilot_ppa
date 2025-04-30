import * as vscode from 'vscode';
import { PerformanceAnalysisResult } from '../types';
export declare class PerformanceStatusService implements vscode.Disposable {
    private readonly statusBarItem;
    constructor();
    updateStatusBar(result: PerformanceAnalysisResult): void;
    dispose(): void;
}
