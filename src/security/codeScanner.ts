import * as vscode from 'vscode';
import { SecurityPatternService } from './services/SecurityPatternService';
import { SecurityAnalyzerService } from './services/SecurityAnalyzerService';
import { SecurityDiagnosticService } from './services/SecurityDiagnosticService';
import { SecurityFixService } from './services/SecurityFixService';
import { SecurityReportHtmlProvider } from '../providers/SecurityReportHtmlProvider';
import { CodeScanResult, SecurityPattern, SecurityIssue } from './types';

/**
 * Class responsible for scanning code for potential security issues
 */
export class CodeSecurityScanner {
    private readonly patternService: SecurityPatternService;
    private readonly analyzerService: SecurityAnalyzerService;
    private readonly diagnosticService: SecurityDiagnosticService;
    private readonly fixService: SecurityFixService;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly webviewMap = new Map<string, vscode.Webview>();
    private messageQueue: Array<() => Promise<void>> = [];
    private isProcessing = false;
    private issueCache = new Map<string, SecurityIssue>();

    constructor(context: vscode.ExtensionContext) {
        this.patternService = new SecurityPatternService();
        this.analyzerService = new SecurityAnalyzerService(this.patternService);
        this.diagnosticService = new SecurityDiagnosticService(context);
        this.fixService = new SecurityFixService(context);
    }

    public async scanActiveFile(): Promise<CodeScanResult> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { issues: [], scannedFiles: 0 };
        }
        return this.scanFile(editor.document.uri);
    }

    public async scanFile(fileUri: vscode.Uri): Promise<CodeScanResult> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const result = await this.analyzerService.scanDocument(document);
        this.diagnosticService.report(fileUri, result.diagnostics);
        
        // Cache the issues for later retrieval
        result.issues.forEach(issue => {
            this.issueCache.set(issue.id, issue);
        });
        
        return { issues: result.issues, scannedFiles: 1 };
    }

    public async scanWorkspace(progressCallback?: (message: string) => void): Promise<CodeScanResult> {
        const result = await this.analyzerService.scanWorkspace(progressCallback);
        
        // Cache the issues for later retrieval
        result.issues.forEach(issue => {
            this.issueCache.set(issue.id, issue);
        });
        
        return result;
    }

    /**
     * Get detailed information about a specific security issue
     * @param issueId The ID of the issue to retrieve details for
     * @returns The security issue details, or undefined if not found
     */
    public async getIssueDetails(issueId: string): Promise<SecurityIssue | undefined> {
        return this.issueCache.get(issueId);
    }

    public async showSecurityReport(result: CodeScanResult): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'securityIssuesReport',
            'Code Security Issues Report',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        panel.webview.html = SecurityReportHtmlProvider.getHtml(result);
    }

    public registerWebview(id: string, webview: vscode.Webview): void {
        this.webviewMap.set(id, webview);
        
        const disposable = webview.onDidReceiveMessage(
            message => this.handleWebviewMessage(webview, message),
            undefined,
            this.disposables
        );
        
        this.disposables.push(disposable);
    }

    public unregisterWebview(id: string): void {
        this.webviewMap.delete(id);
    }

    private handleWebviewMessage(webview: vscode.Webview, message: any): void {
        this.messageQueue.push(async () => {
            try {
                switch (message.command) {
                    case 'openFile':
                        const document = await vscode.workspace.openTextDocument(message.path);
                        await vscode.window.showTextDocument(document);
                        break;
                    case 'fixIssue':
                        await this.fixService.applyFix(message.issueId, message.path);
                        break;
                }
            } catch (error) {
                console.error('Error handling webview message:', error);
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        });
        this.processMessageQueue();
    }

    private async processMessageQueue(): Promise<void> {
        if (this.isProcessing) {return;}
        this.isProcessing = true;

        while (this.messageQueue.length > 0) {
            const handler = this.messageQueue.shift();
            if (handler) {
                try {
                    await handler();
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        }

        this.isProcessing = false;
    }

    public dispose(): void {
        this.diagnosticService.dispose();
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.webviewMap.clear();
        this.messageQueue = [];
        this.isProcessing = false;
        this.issueCache.clear();
    }
}
