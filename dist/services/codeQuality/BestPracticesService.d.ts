import * as vscode from 'vscode';
import { BestPracticeIssue } from './bestPracticesChecker';
export declare class BestPracticesService implements vscode.Disposable {
    private readonly _context;
    constructor(context: vscode.ExtensionContext);
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
    private detectJavaScriptAntiPatterns;
    private detectPythonAntiPatterns;
    private detectJavaAntiPatterns;
    private checkMethodLength;
    private checkParameterCount;
    private checkComplexity;
    private checkNamingConventions;
    private checkStyleConsistency;
    private checkCommentConsistency;
    private findPatterns;
    private findMaxNestingDepth;
    dispose(): void;
}
