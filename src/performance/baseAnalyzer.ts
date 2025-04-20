import * as vscode from 'vscode';
import { PerformanceIssue, PerformanceAnalysisResult } from './types';

/**
 * Base class for all performance analyzers
 */
export abstract class BasePerformanceAnalyzer {
    protected context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Analyze code for performance issues
     */
    public abstract analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;

    /**
     * Extract a code snippet around a specific line
     */
    protected extractCodeSnippet(lines: string[], lineIndex: number, context: number = 3): string {
        const start = Math.max(0, lineIndex - context);
        const end = Math.min(lines.length, lineIndex + context + 1);
        return lines.slice(start, end).join('\n');
    }

    /**
     * Find the line number for a position in the file
     */
    protected findLineNumber(content: string, position: number): number {
        return content.substring(0, position).split('\n').length - 1;
    }

    /**
     * Estimate maximum nesting depth in code
     */
    protected estimateMaxNestedDepth(content: string): number {
        let maxDepth = 0;
        let currentDepth = 0;
        
        for (const char of content) {
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (char === '}') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
        
        return maxDepth;
    }

    /**
     * Calculate hash of file content for caching
     */
    protected calculateFileHash(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
}