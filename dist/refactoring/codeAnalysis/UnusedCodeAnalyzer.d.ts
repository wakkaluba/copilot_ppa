import * as vscode from 'vscode';
import { BaseCodeAnalyzer } from '../codeAnalysis/BaseCodeAnalyzer';
export declare class UnusedCodeAnalyzer extends BaseCodeAnalyzer {
    private languageAnalyzers;
    /**
     * Analyzes a document for unused code
     */
    analyze(document: vscode.TextDocument, selection?: vscode.Selection): Promise<vscode.Diagnostic[]>;
    /**
     * Gets the appropriate language-specific analyzer
     */
    private getLanguageAnalyzer;
    private createAnalyzer;
    dispose(): void;
}
