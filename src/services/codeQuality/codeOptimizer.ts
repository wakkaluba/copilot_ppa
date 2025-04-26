import * as vscode from 'vscode';
import { LoggerService } from '../LoggerService';
import { CodeAnalysisService } from './services/CodeAnalysisService';
import { OptimizationService } from './services/OptimizationService';
import { SuggestionService } from './services/SuggestionService';
import { OptimizationResult, CodeAnalysis, Suggestion } from './types';

/**
 * Provides code optimization functionality with comprehensive error handling
 */
export class CodeOptimizer {
    private readonly analysisService: CodeAnalysisService;
    private readonly optimizationService: OptimizationService;
    private readonly suggestionService: SuggestionService;
    private readonly logger: LoggerService;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.analysisService = new CodeAnalysisService(context);
        this.optimizationService = new OptimizationService(context);
        this.suggestionService = new SuggestionService(context);
        this.logger = LoggerService.getInstance();
        this.registerEventHandlers();
    }

    /**
     * Analyzes and optimizes code in the given file
     */
    public async optimizeFile(filePath: string): Promise<OptimizationResult> {
        try {
            const analysis = await this.analyzeFile(filePath);
            return await this.applyOptimizations(filePath, analysis);
        } catch (error) {
            this.handleError('Failed to optimize file', error);
            return this.createEmptyResult(filePath);
        }
    }

    /**
     * Analyzes code for optimization opportunities
     */
    public async analyzeFile(filePath: string): Promise<CodeAnalysis> {
        try {
            return await this.analysisService.analyzeFile(filePath);
        } catch (error) {
            this.handleError('Failed to analyze file', error);
            return this.createEmptyAnalysis(filePath);
        }
    }

    /**
     * Gets optimization suggestions without applying them
     */
    public async getSuggestions(analysis: CodeAnalysis): Promise<Suggestion[]> {
        try {
            return await this.suggestionService.generateSuggestions(analysis);
        } catch (error) {
            this.handleError('Failed to generate suggestions', error);
            return [];
        }
    }

    /**
     * Applies optimization suggestions to the code
     */
    public async applyOptimizations(filePath: string, analysis: CodeAnalysis): Promise<OptimizationResult> {
        try {
            const suggestions = await this.getSuggestions(analysis);
            return await this.optimizationService.applyOptimizations(filePath, suggestions);
        } catch (error) {
            this.handleError('Failed to apply optimizations', error);
            return this.createEmptyResult(filePath);
        }
    }

    /**
     * Shows optimization suggestions in the editor
     */
    public showSuggestionsInEditor(editor: vscode.TextEditor, suggestions: Suggestion[]): void {
        try {
            const decorations = this.suggestionService.createDecorations(suggestions);
            editor.setDecorations(this.suggestionService.getDecorationType(), decorations);
            this.disposables.push({ dispose: () => editor.setDecorations(this.suggestionService.getDecorationType(), []) });
        } catch (error) {
            this.handleError('Failed to show suggestions', error);
        }
    }

    /**
     * Cleans up resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.analysisService.dispose();
        this.optimizationService.dispose();
        this.suggestionService.dispose();
    }

    private registerEventHandlers(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(e => this.handleDocumentChange(e)),
            vscode.window.onDidChangeActiveTextEditor(e => this.handleEditorChange(e))
        );
    }

    private async handleDocumentChange(e: vscode.TextDocumentChangeEvent): Promise<void> {
        try {
            if (this.shouldOptimize(e.document)) {
                const analysis = await this.analyzeFile(e.document.uri.fsPath);
                const suggestions = await this.getSuggestions(analysis);
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document === e.document) {
                    this.showSuggestionsInEditor(editor, suggestions);
                }
            }
        } catch (error) {
            this.handleError('Failed to handle document change', error);
        }
    }

    private handleEditorChange(editor?: vscode.TextEditor): void {
        try {
            if (editor && this.shouldOptimize(editor.document)) {
                this.analyzeFile(editor.document.uri.fsPath)
                    .then(analysis => this.getSuggestions(analysis))
                    .then(suggestions => this.showSuggestionsInEditor(editor, suggestions))
                    .catch(error => this.handleError('Failed to handle editor change', error));
            }
        } catch (error) {
            this.handleError('Failed to handle editor change', error);
        }
    }

    private shouldOptimize(document: vscode.TextDocument): boolean {
        const supportedLanguages = ['typescript', 'javascript', 'python', 'java'];
        return supportedLanguages.includes(document.languageId);
    }

    private createEmptyAnalysis(filePath: string): CodeAnalysis {
        return {
            filePath,
            issues: [],
            metrics: {
                complexity: 0,
                maintainability: 0,
                performance: 0
            }
        };
    }

    private createEmptyResult(filePath: string): OptimizationResult {
        return {
            filePath,
            optimizations: [],
            metrics: {
                complexity: 0,
                maintainability: 0,
                performance: 0
            },
            success: false
        };
    }

    private handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`CodeOptimizer: ${message}`, errorMessage);
        vscode.window.showErrorMessage(`Code optimization error: ${errorMessage}`);
    }
}
