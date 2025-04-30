import * as vscode from 'vscode';
import { OptimizationResult, CodeAnalysis, Suggestion } from './types';
/**
 * Provides code optimization functionality with comprehensive error handling
 */
export declare class CodeOptimizer {
    private readonly analysisService;
    private readonly optimizationService;
    private readonly suggestionService;
    private readonly logger;
    private readonly disposables;
    constructor(context: vscode.ExtensionContext);
    /**
     * Analyzes and optimizes code in the given file
     */
    optimizeFile(filePath: string): Promise<OptimizationResult>;
    /**
     * Analyzes code for optimization opportunities
     */
    analyzeFile(filePath: string): Promise<CodeAnalysis>;
    /**
     * Gets optimization suggestions without applying them
     */
    getSuggestions(analysis: CodeAnalysis): Promise<Suggestion[]>;
    /**
     * Applies optimization suggestions to the code
     */
    applyOptimizations(filePath: string, analysis: CodeAnalysis): Promise<OptimizationResult>;
    /**
     * Shows optimization suggestions in the editor
     */
    showSuggestionsInEditor(editor: vscode.TextEditor, suggestions: Suggestion[]): void;
    /**
     * Cleans up resources
     */
    dispose(): void;
    private registerEventHandlers;
    private handleDocumentChange;
    private handleEditorChange;
    private shouldOptimize;
    private createEmptyAnalysis;
    private createEmptyResult;
    private handleError;
}
