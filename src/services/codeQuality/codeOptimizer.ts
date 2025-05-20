// Migrated from orphaned-code
import * as vscode from 'vscode';
import { LoggerService } from '../LoggerService';
import { CodeAnalysisService } from './services/CodeAnalysisService';
import { OptimizationService } from './services/OptimizationService';
import { SuggestionService } from './services/SuggestionService';
import { CodeAnalysis, OptimizationResult, Suggestion } from './types';

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

  public async optimizeFile(filePath: string): Promise<OptimizationResult> {
    try {
      const analysis = await this.analyzeFile(filePath);
      return await this.applyOptimizations(filePath, analysis);
    } catch (error) {
      this.handleError('Failed to optimize file', error);
      return this.createEmptyResult(filePath);
    }
  }

  public async analyzeFile(filePath: string): Promise<CodeAnalysis> {
    try {
      return await this.analysisService.analyzeFile(filePath);
    } catch (error) {
      this.handleError('Failed to analyze file', error);
      return this.createEmptyAnalysis(filePath);
    }
  }

  public async getSuggestions(analysis: CodeAnalysis): Promise<Suggestion[]> {
    try {
      return await this.suggestionService.generateSuggestions(analysis);
    } catch (error) {
      this.handleError('Failed to generate suggestions', error);
      return [];
    }
  }

  public async applyOptimizations(filePath: string, analysis: CodeAnalysis): Promise<OptimizationResult> {
    try {
      const suggestions = await this.getSuggestions(analysis);
      return await this.optimizationService.applyOptimizations(filePath, suggestions);
    } catch (error) {
      this.handleError('Failed to apply optimizations', error);
      return this.createEmptyResult(filePath);
    }
  }

  public showSuggestionsInEditor(editor: vscode.TextEditor, suggestions: Suggestion[]): void {
    try {
      const decorations = this.suggestionService.createDecorations(suggestions);
      editor.setDecorations(this.suggestionService.getDecorationType(), decorations);
      this.disposables.push({ dispose: () => editor.setDecorations(this.suggestionService.getDecorationType(), []) });
    } catch (error) {
      this.handleError('Failed to show suggestions', error);
    }
  }

  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables.length = 0;
    this.analysisService.dispose();
    this.optimizationService.dispose();
    this.suggestionService.dispose();
  }

  private registerEventHandlers(): void {
    // TODO: Implement event handlers for optimization events
  }

  private handleError(message: string, error: unknown): void {
    this.logger.error(message, error);
  }

  private createEmptyResult(filePath: string): OptimizationResult {
    return { filePath, optimizations: [], success: false };
  }

  private createEmptyAnalysis(filePath: string): CodeAnalysis {
    return { filePath, issues: [] };
  }
}
