import * as vscode from 'vscode';
import { CodeScanResult, SecurityIssue } from './types';
/**
 * Class responsible for scanning code for potential security issues
 */
export declare class CodeSecurityScanner {
    private readonly patternService;
    private readonly analyzerService;
    private readonly diagnosticService;
    private readonly fixService;
    private readonly disposables;
    private readonly webviewMap;
    private messageQueue;
    private isProcessing;
    private issueCache;
    constructor(context: vscode.ExtensionContext);
    scanActiveFile(): Promise<CodeScanResult>;
    scanFile(fileUri: vscode.Uri): Promise<CodeScanResult>;
    scanWorkspace(progressCallback?: (message: string) => void): Promise<CodeScanResult>;
    /**
     * Get detailed information about a specific security issue
     * @param issueId The ID of the issue to retrieve details for
     * @returns The security issue details, or undefined if not found
     */
    getIssueDetails(issueId: string): Promise<SecurityIssue | undefined>;
    showSecurityReport(result: CodeScanResult): Promise<void>;
    registerWebview(id: string, webview: vscode.Webview): void;
    unregisterWebview(id: string): void;
    private handleWebviewMessage;
    private processMessageQueue;
    dispose(): void;
}
