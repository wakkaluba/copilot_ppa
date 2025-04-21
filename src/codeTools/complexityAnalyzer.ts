import * as vscode from 'vscode';
import * as path from 'path';
import { JavaScriptComplexityService } from './services/JavaScriptComplexityService';
import { PythonComplexityService } from './services/PythonComplexityService';
import { ComplexityReportService } from './services/ComplexityReportService';

/**
 * Analyzes code complexity using various tools
 */
export class ComplexityAnalyzer {
    private jsService: JavaScriptComplexityService;
    private pyService: PythonComplexityService;
    private reportService: ComplexityReportService;

    constructor() {
        this.jsService = new JavaScriptComplexityService();
        this.pyService = new PythonComplexityService();
        this.reportService = new ComplexityReportService();
    }

    /**
     * Analyze the complexity of the current file
     */
    public async analyzeFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const filePath = document.uri.fsPath;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('File must be part of a workspace');
            return;
        }
        await document.save();
        const ext = path.extname(filePath);
        let reportData;
        if (/\.jsx?$|\.tsx?$/.test(ext)) {
            reportData = await this.jsService.analyze(filePath, workspaceFolder);
        } else if (/\.py$/.test(ext)) {
            reportData = await this.pyService.analyze(filePath, workspaceFolder);
        } else {
            vscode.window.showInformationMessage(`No complexity analyzer configured for ${ext} files`);
            return;
        }
        const html = this.reportService.renderReport(filePath, reportData);
        const panel = vscode.window.createWebviewPanel('complexityReport', `Complexity: ${path.basename(filePath)}`, vscode.ViewColumn.Beside, { enableScripts: true });
        panel.webview.html = html;
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.reportService.dispose();
    }
}
