import * as vscode from 'vscode';
export interface Bottleneck {
    file: string;
    startLine: number;
    endLine: number;
    description: string;
    impact: 'low' | 'medium' | 'high';
    suggestions: string[];
}
export declare class BottleneckDetector {
    private context;
    private outputChannel;
    constructor(context: vscode.ExtensionContext);
    /**
     * Analyzes the current file for potential bottlenecks
     */
    detectBottlenecksInCurrentFile(): Promise<Bottleneck[]>;
    /**
     * Detects bottlenecks in a specific file
     */
    detectBottlenecks(fileUri: vscode.Uri): Promise<Bottleneck[]>;
    /**
     * Detects bottlenecks across all workspace files
     */
    analyzeWorkspaceBottlenecks(): Promise<void>;
    /**
     * Detects structural bottlenecks like deeply nested loops, complex conditions
     */
    private detectStructuralBottlenecks;
    /**
     * Detects algorithmic inefficiencies
     */
    private detectAlgorithmicBottlenecks;
    /**
     * Detects I/O and resource usage bottlenecks
     */
    private detectResourceBottlenecks;
    /**
     * Helper to check if a line starts a loop
     */
    private isLoopStart;
    /**
     * Helper to check if a line ends a block
     */
    private isBlockEnd;
    /**
     * Helper to check if content contains nested loops
     */
    private containsNestedLoop;
    /**
     * Find the ending line for a block starting at the given line
     */
    private findBlockEnd;
    /**
     * Extract the body of a loop
     */
    private getLoopBody;
    /**
     * Display bottleneck results in output channel
     */
    private displayBottleneckResults;
    /**
     * Generate a comprehensive report of all bottlenecks
     */
    private generateBottleneckReport;
}
