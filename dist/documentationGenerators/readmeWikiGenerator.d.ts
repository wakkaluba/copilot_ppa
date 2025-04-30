import * as vscode from 'vscode';
import { LLMInterface } from '../llm/llmInterface';
/**
 * Types of documentation that can be generated
 */
export declare enum DocumentationType {
    README = "README",
    CONTRIBUTING = "CONTRIBUTING",
    WIKI_HOME = "Wiki Home",
    WIKI_GETTING_STARTED = "Wiki Getting Started",
    WIKI_API = "Wiki API",
    WIKI_EXAMPLES = "Wiki Examples",
    WIKI_FAQ = "Wiki FAQ",
    WIKI_TROUBLESHOOTING = "Wiki Troubleshooting",
    CUSTOM = "Custom"
}
/**
 * README/Wiki Generator class for creating project documentation
 */
export declare class ReadmeWikiGenerator {
    private context;
    private llmProvider;
    private projectInfoSvc;
    private readmeSvc;
    private contributingSvc;
    private wikiSvc;
    private diffSvc;
    /**
     * Constructor for the README/Wiki generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context: vscode.ExtensionContext, llmProvider: LLMInterface);
    /**
     * Register commands for README/Wiki generation
     */
    private registerCommands;
    /**
     * Generate a README.md file for the current project
     */
    generateReadme(): Promise<void>;
    /**
     * Generate a CONTRIBUTING.md file for the current project
     */
    generateContributing(): Promise<void>;
    /**
     * Generate a Wiki page file
     */
    generateWikiPage(): Promise<void>;
    /**
     * Generate multiple documentation files for the project
     */
    generateProjectDocumentation(): Promise<void>;
}
