import * as vscode from 'vscode';
import { SecurityPatternService } from './SecurityPatternService';
import { SecurityIssue, CodeScanResult } from '../types';
export declare class SecurityAnalyzerService {
    private readonly patternService;
    constructor(patternService: SecurityPatternService);
    scanDocument(document: vscode.TextDocument): Promise<{
        diagnostics: vscode.Diagnostic[];
        issues: SecurityIssue[];
    }>;
    scanWorkspace(progressCallback?: (message: string) => void): Promise<CodeScanResult>;
    private severityToString;
}
