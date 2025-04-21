import * as vscode from 'vscode';
import { PerformanceAnalysisResult } from '../types';

export class PerformanceStatusService implements vscode.Disposable {
    private readonly statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.show();
    }

    public updateStatusBar(result: PerformanceAnalysisResult): void {
        const { issues } = result;
        const criticalCount = issues.filter(i => i.severity === 'critical').length;
        const highCount = issues.filter(i => i.severity === 'high').length;
        
        if (criticalCount > 0) {
            this.statusBarItem.text = `$(error) ${criticalCount} critical issues`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        } else if (highCount > 0) {
            this.statusBarItem.text = `$(warning) ${highCount} high severity issues`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else if (issues.length > 0) {
            this.statusBarItem.text = `$(info) ${issues.length} performance issues`;
            this.statusBarItem.backgroundColor = undefined;
        } else {
            this.statusBarItem.text = `$(check) No performance issues`;
            this.statusBarItem.backgroundColor = undefined;
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}