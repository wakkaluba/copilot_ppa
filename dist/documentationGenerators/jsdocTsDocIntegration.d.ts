import * as vscode from 'vscode';
import { LLMInterface } from '../llm-providers/llmInterface';
import { JSDocTSDocGenerationOptions } from '../types/documentation';
/**
 * Service responsible for handling JSDoc/TSDoc generation and integration
 */
export declare class JSDocTSDocIntegration {
    private readonly llmProvider;
    private readonly supportedLanguages;
    private readonly outputChannel;
    /**
     * Constructor for the JSDoc/TSDoc integration service
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(llmProvider: LLMInterface);
    /**
     * Generate documentation for a specific file
     */
    generateDocumentation(document: vscode.TextDocument, options?: JSDocTSDocGenerationOptions): Promise<void>;
    /**
     * Generate documentation for a specific symbol
     */
    private generateSymbolDocumentation;
    /**
     * Visit AST nodes to find documentation targets
     */
    private visitNode;
    /**
     * Check if a node should be documented
     */
    private shouldDocumentNode;
    /**
     * Check if a variable declaration is exported
     */
    private isExportedVariable;
    /**
     * Extract existing documentation from a node
     */
    private getExistingDocumentation;
    /**
     * Extract relevant information from a node for documentation
     */
    private extractSymbolInfo;
    /**
     * Get the name of a node
     */
    private getNodeName;
    /**
     * Build a documentation prompt for the LLM
     */
    private buildDocumentationPrompt;
    /**
     * Format the generated documentation
     */
    private formatDocumentation;
    /**
     * Get the type of a node for documentation purposes
     */
    private getNodeType;
    /**
     * Clean up resources
     */
    dispose(): void;
}
