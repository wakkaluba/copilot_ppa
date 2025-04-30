import * as vscode from 'vscode';
import { LLMInterface } from '../llm/llmInterface';
/**
 * Format options for API documentation
 */
export declare enum ApiDocFormat {
    MARKDOWN = "markdown",
    HTML = "html",
    JSON = "json",
    YAML = "yaml",
    OPENAPI = "openapi"
}
/**
 * API Documentation Generator class
 * Generates API documentation from source code
 */
export declare class ApiDocumentationGenerator {
    private context;
    private llmProvider;
    private fileService;
    private promptBuilder;
    private writer;
    private openApiService;
    /**
     * Constructor for API Documentation Generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context: vscode.ExtensionContext, llmProvider: LLMInterface);
    /**
     * Register commands for API documentation generation
     */
    private registerCommands;
    /**
     * Generate API documentation for the current file
     */
    generateApiDocForFile(): Promise<void>;
    /**
     * Generate API documentation for the entire project
     */
    generateApiDocForProject(): Promise<void>;
    /**
     * Generate OpenAPI specification for a REST API project
     */
    generateOpenApiSpec(): Promise<void>;
}
