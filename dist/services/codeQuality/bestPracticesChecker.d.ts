import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
export interface BestPracticeIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'warning' | 'error';
    description: string;
    recommendation: string;
    category: 'antiPattern' | 'design' | 'consistency' | 'documentation' | 'naming';
}
/**
 * Checks and enforces best practices in code
 */
export declare class BestPracticesChecker implements vscode.Disposable {
    private readonly _service;
    private readonly _diagnosticCollection;
    private readonly _logger;
    constructor(context: vscode.ExtensionContext, logger: Logger);
    /**
     * Detects anti-patterns in code
     */
    detectAntiPatterns(document: vscode.TextDocument): Promise<BestPracticeIssue[]>;
    /**
     * Suggests design improvements
     */
    suggestDesignImprovements(document: vscode.TextDocument): Promise<BestPracticeIssue[]>;
    /**
     * Checks code consistency
     */
    checkCodeConsistency(document: vscode.TextDocument): Promise<BestPracticeIssue[]>;
    /**
     * Run all checks at once
     */
    checkAll(document: vscode.TextDocument): Promise<BestPracticeIssue[]>;
    /**
     * Update diagnostics for document
     */
    private updateDiagnostics;
    /**
     * Map severity to VS Code diagnostic severity
     */
    private mapSeverityToDiagnosticSeverity;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
