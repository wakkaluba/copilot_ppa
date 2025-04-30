import * as vscode from 'vscode';
import { ISecurityAnalysisService, SecurityScanResult, SecurityIssue } from '../types';
import { CodeSecurityScanner } from '../scanners/CodeSecurityScanner';
export interface ISecurityAnalysisService extends vscode.Disposable {
    scanWorkspace(): Promise<SecurityScanResult>;
    scanFile(document: vscode.TextDocument): Promise<SecurityIssue[]>;
    getIssuesByType(issueId: string): Promise<SecurityIssue[]>;
}
/**
 * Service responsible for coordinating security analysis operations
 */
export declare class SecurityAnalysisService implements ISecurityAnalysisService {
    private readonly scanner;
    private readonly disposables;
    private readonly _onAnalysisComplete;
    private analysisTimeout?;
    private diagnosticCollection;
    private issueCache;
    constructor(scanner: CodeSecurityScanner);
    readonly onAnalysisComplete: any;
    scanWorkspace(progressCallback?: (message: string) => void): Promise<SecurityScanResult>;
    scanActiveFile(): Promise<SecurityScanResult>;
    getIssuesByType(issueId: string): Promise<SecurityIssue[]>;
    private onDocumentChanged;
    scanFile(document: vscode.TextDocument): Promise<SecurityIssue[]>;
    private updateDiagnostics;
    private checkJavaScriptSecurity;
    private checkPythonSecurity;
    private checkJavaSecurity;
    private checkForEvalUse;
    dispose(): void;
}
