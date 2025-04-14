import * as vscode from 'vscode';
import { LinterIntegration } from './linterIntegration';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { RefactoringTools } from './refactoringTools';
import { DocumentationGenerator } from './documentationGenerator';

/**
 * Central manager for all code tools integrations
 */
export class CodeToolsManager {
    private linterIntegration: LinterIntegration;
    private complexityAnalyzer: ComplexityAnalyzer;
    private refactoringTools: RefactoringTools;
    private documentationGenerator: DocumentationGenerator;
    
    constructor(private context: vscode.ExtensionContext) {
        this.linterIntegration = new LinterIntegration();
        this.complexityAnalyzer = new ComplexityAnalyzer();
        this.refactoringTools = new RefactoringTools();
        this.documentationGenerator = new DocumentationGenerator();
    }

    /**
     * Initialize all code tools
     */
    public async initialize(): Promise<void> {
        await this.linterIntegration.initialize();
        await this.complexityAnalyzer.initialize();
        await this.refactoringTools.initialize();
        await this.documentationGenerator.initialize();
        
        this.registerCommands();
    }

    /**
     * Register all commands for code tools
     */
    private registerCommands(): void {
        this.context.subscriptions.push(
            vscode.commands.registerCommand('local-llm-agent.runLinter', () => this.linterIntegration.runLinter()),
            vscode.commands.registerCommand('local-llm-agent.analyzeComplexity', () => this.complexityAnalyzer.analyzeFile()),
            vscode.commands.registerCommand('local-llm-agent.simplifyCode', () => this.refactoringTools.simplifyCode()),
            vscode.commands.registerCommand('local-llm-agent.removeUnusedCode', () => this.refactoringTools.removeUnusedCode()),
            vscode.commands.registerCommand('local-llm-agent.generateDocs', () => this.documentationGenerator.generateDocs())
        );
    }

    /**
     * Dispose all resources
     */
    public dispose(): void {
        this.linterIntegration.dispose();
        this.complexityAnalyzer.dispose();
        this.refactoringTools.dispose();
        this.documentationGenerator.dispose();
    }
}
