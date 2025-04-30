import * as vscode from 'vscode';
import { PerformanceAnalysisResult } from './types';
/**
 * Base class for all performance analyzers
 */
export declare abstract class BasePerformanceAnalyzer {
    protected context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext);
    /**
     * Analyze code for performance issues
     */
    abstract analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    /**
     * Extract a code snippet around a specific line
     */
    protected extractCodeSnippet(lines: string[], lineIndex: number, context?: number): string;
    /**
     * Find the line number for a position in the file
     */
    protected findLineNumber(content: string, position: number): number;
    /**
     * Estimate maximum nesting depth in code
     */
    protected estimateMaxNestedDepth(content: string): number;
    /**
     * Calculate hash of file content for caching
     */
    protected calculateFileHash(content: string): string;
}
