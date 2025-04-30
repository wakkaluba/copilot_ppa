import * as vscode from 'vscode';
export declare class ComplexityAnalysisCommand {
    private readonly complexityAnalyzer;
    private decorationDisposables;
    constructor();
    /**
     * Register all complexity analysis commands
     * @returns Disposable for the commands
     */
    register(): vscode.Disposable;
    /**
     * Analyze complexity of the current file in the editor
     */
    private analyzeCurrentFile;
    /**
     * Analyze complexity of the entire workspace
     */
    private analyzeWorkspace;
    /**
     * Toggle complexity visualization in the editor
     */
    private toggleComplexityVisualization;
    /**
     * Handle editor change event to update decorations
     */
    private handleEditorChange;
    /**
     * Clear all active decorations
     */
    private clearDecorations;
    /**
     * Generate a markdown table of functions sorted by complexity
     */
    private generateFunctionsTable;
}
