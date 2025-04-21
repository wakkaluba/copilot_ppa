import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LLMInterface } from '../llm/llmInterface';
import { ProjectInfoService } from './services/ProjectInfoService';
import { ReadmeService } from './services/ReadmeService';
import { ContributingService } from './services/ContributingService';
import { WikiService } from './services/WikiService';
import { DocumentationDiffService } from './services/DocumentationDiffService';

/**
 * Types of documentation that can be generated
 */
export enum DocumentationType {
    README = 'README',
    CONTRIBUTING = 'CONTRIBUTING',
    WIKI_HOME = 'Wiki Home',
    WIKI_GETTING_STARTED = 'Wiki Getting Started',
    WIKI_API = 'Wiki API',
    WIKI_EXAMPLES = 'Wiki Examples',
    WIKI_FAQ = 'Wiki FAQ',
    WIKI_TROUBLESHOOTING = 'Wiki Troubleshooting',
    CUSTOM = 'Custom'
}

/**
 * README/Wiki Generator class for creating project documentation
 */
export class ReadmeWikiGenerator {
    private context: vscode.ExtensionContext;
    private llmProvider: LLMInterface;
    private projectInfoSvc: ProjectInfoService;
    private readmeSvc: ReadmeService;
    private contributingSvc: ContributingService;
    private wikiSvc: WikiService;
    private diffSvc: DocumentationDiffService;

    /**
     * Constructor for the README/Wiki generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context: vscode.ExtensionContext, llmProvider: LLMInterface) {
        this.context = context;
        this.llmProvider = llmProvider;
        this.projectInfoSvc = new ProjectInfoService();
        this.readmeSvc = new ReadmeService(context, llmProvider, this.projectInfoSvc);
        this.contributingSvc = new ContributingService(context, llmProvider, this.projectInfoSvc);
        this.wikiSvc = new WikiService(context, llmProvider, this.projectInfoSvc);
        this.diffSvc = new DocumentationDiffService(context);
        this.registerCommands();
    }

    /**
     * Register commands for README/Wiki generation
     */
    private registerCommands(): void {
        // Command to generate README
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.readme', 
                async () => await this.generateReadme())
        );

        // Command to generate CONTRIBUTING guide
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.contributing', 
                async () => await this.generateContributing())
        );

        // Command to generate Wiki page
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.wiki', 
                async () => await this.generateWikiPage())
        );

        // Command to generate multiple documentation files
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.projectDocs', 
                async () => await this.generateProjectDocumentation())
        );
    }

    /**
     * Generate a README.md file for the current project
     */
    public async generateReadme(): Promise<void> {
        await this.readmeSvc.generate();
    }

    /**
     * Generate a CONTRIBUTING.md file for the current project
     */
    public async generateContributing(): Promise<void> {
        await this.contributingSvc.generate();
    }

    /**
     * Generate a Wiki page file
     */
    public async generateWikiPage(): Promise<void> {
        await this.wikiSvc.generatePage();
    }

    /**
     * Generate multiple documentation files for the project
     */
    public async generateProjectDocumentation(): Promise<void> {
        await this.wikiSvc.generateAll();
    }
}

// Import for os module to handle temporary files
import * as os from 'os';
