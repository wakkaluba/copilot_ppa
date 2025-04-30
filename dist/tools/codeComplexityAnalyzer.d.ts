import * as vscode from 'vscode';
import { ComplexityResult } from '../types/complexity';
/**
 * Analyzes and visualizes code complexity metrics
 */
export declare class CodeComplexityAnalyzer {
    private readonly service;
    private readonly disposables;
    constructor();
    /**
     * Analyzes complexity metrics for a specific file
     */
    analyzeFile(filePath: string): Promise<ComplexityResult | null>;
    /**
     * Analyzes complexity metrics for an entire workspace
     */
    analyzeWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<ComplexityResult[]>;
    /**
     * Generates a formatted complexity report
     */
    generateComplexityReport(results: ComplexityResult[]): string;
    /**
     * Visualizes complexity metrics in the editor
     */
    visualizeComplexity(editor: vscode.TextEditor, result: ComplexityResult): vscode.Disposable[];
    /**
     * Cleans up resources
     */
    dispose(): void;
    private handleError;
}
