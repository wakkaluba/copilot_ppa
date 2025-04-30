import * as vscode from 'vscode';
import { SecurityScanResult, SecurityIssue } from '../types';
export declare class CodeSecurityScanner {
    private readonly supportedLanguages;
    scanWorkspace(progressCallback?: (message: string) => void): Promise<SecurityScanResult>;
    scanFile(uri: vscode.Uri): Promise<SecurityIssue[]>;
    private getLanguagePattern;
    private scanJavaScriptFile;
    private scanPythonFile;
    private scanJavaFile;
    private checkUnsafeEval;
    private checkXSSVulnerabilities;
    private checkSQLInjection;
    private checkHardcodedSecrets;
    private checkSecurityMiddleware;
    private checkUnsafeDeserialization;
}
