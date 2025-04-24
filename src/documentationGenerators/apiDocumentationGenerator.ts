import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { LLMInterface } from '../llm/llmInterface';
import { SourceFileService } from './services/SourceFileService';
import { ApiDocPromptBuilder } from './services/ApiDocPromptBuilder';
import { DocumentationWriter } from './services/DocumentationWriter';
import { OpenApiSpecService } from './services/OpenApiSpecService';
import { ApiDocHtmlProvider } from './providers/ApiDocHtmlProvider';

/**
 * Format options for API documentation
 */
export enum ApiDocFormat {
    MARKDOWN = 'markdown',
    HTML = 'html',
    JSON = 'json',
    YAML = 'yaml',
    OPENAPI = 'openapi'
}

/**
 * API Documentation Generator class
 * Generates API documentation from source code
 */
export class ApiDocumentationGenerator {
    private fileService: SourceFileService;
    private promptBuilder: ApiDocPromptBuilder;
    private writer: DocumentationWriter;
    private openApiService: OpenApiSpecService;

    /**
     * Constructor for API Documentation Generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(private context: vscode.ExtensionContext, private llmProvider: LLMInterface) {
        this.fileService = new SourceFileService(context);
        this.promptBuilder = new ApiDocPromptBuilder();
        this.writer = new DocumentationWriter(context);
        this.openApiService = new OpenApiSpecService(this.llmProvider);
        this.registerCommands();
    }

    /**
     * Register commands for API documentation generation
     */
    private registerCommands(): void {
        // Command to generate API documentation for a file
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.apiFile', 
                async () => await this.generateApiDocForFile())
        );

        // Command to generate API documentation for a project
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.apiProject', 
                async () => await this.generateApiDocForProject())
        );
        
        // Command to generate OpenAPI specification
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.openapi', 
                async () => await this.generateOpenApiSpec())
        );
    }

    /**
     * Generate API documentation for the current file
     */
    public async generateApiDocForFile(): Promise<void> {
        const fileUri = await this.fileService.pickActiveFile();
        if (!fileUri) {return;}
        const format = await this.fileService.chooseFormat();
        const code = await this.fileService.readFileContent(fileUri);
        const prompt = this.promptBuilder.buildFilePrompt(code, fileUri.fsPath, format);
        const doc = await this.llmProvider.sendPrompt(prompt);
        await this.writer.writeFileDoc(fileUri, doc, format);
    }

    /**
     * Generate API documentation for the entire project
     */
    public async generateApiDocForProject(): Promise<void> {
        const format = await this.fileService.chooseFormat();
        const files = await this.fileService.collectProjectFiles();
        for (const file of files) {
            const code = await this.fileService.readFileContent(vscode.Uri.file(file));
            const prompt = this.promptBuilder.buildFilePrompt(code, file, format);
            const doc = await this.llmProvider.sendPrompt(prompt);
            await this.writer.writeProjectDoc(file, doc, format);
        }
        await this.writer.writeIndex(files, format);
    }

    /**
     * Generate OpenAPI specification for a REST API project
     */
    public async generateOpenApiSpec(): Promise<void> {
        await this.openApiService.generateAndSaveSpec();
    }
}
