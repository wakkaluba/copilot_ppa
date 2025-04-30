"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDocumentationGenerator = exports.ApiDocFormat = void 0;
const vscode = __importStar(require("vscode"));
const SourceFileService_1 = require("./services/SourceFileService");
const ApiDocPromptBuilder_1 = require("./services/ApiDocPromptBuilder");
const DocumentationWriter_1 = require("./services/DocumentationWriter");
const OpenApiSpecService_1 = require("./services/OpenApiSpecService");
/**
 * Format options for API documentation
 */
var ApiDocFormat;
(function (ApiDocFormat) {
    ApiDocFormat["MARKDOWN"] = "markdown";
    ApiDocFormat["HTML"] = "html";
    ApiDocFormat["JSON"] = "json";
    ApiDocFormat["YAML"] = "yaml";
    ApiDocFormat["OPENAPI"] = "openapi";
})(ApiDocFormat || (exports.ApiDocFormat = ApiDocFormat = {}));
/**
 * API Documentation Generator class
 * Generates API documentation from source code
 */
class ApiDocumentationGenerator {
    context;
    llmProvider;
    fileService;
    promptBuilder;
    writer;
    openApiService;
    /**
     * Constructor for API Documentation Generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context, llmProvider) {
        this.context = context;
        this.llmProvider = llmProvider;
        this.fileService = new SourceFileService_1.SourceFileService(context);
        this.promptBuilder = new ApiDocPromptBuilder_1.ApiDocPromptBuilder();
        this.writer = new DocumentationWriter_1.DocumentationWriter(context);
        this.openApiService = new OpenApiSpecService_1.OpenApiSpecService(this.llmProvider);
        this.registerCommands();
    }
    /**
     * Register commands for API documentation generation
     */
    registerCommands() {
        // Command to generate API documentation for a file
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.apiFile', async () => await this.generateApiDocForFile()));
        // Command to generate API documentation for a project
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.apiProject', async () => await this.generateApiDocForProject()));
        // Command to generate OpenAPI specification
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.openapi', async () => await this.generateOpenApiSpec()));
    }
    /**
     * Generate API documentation for the current file
     */
    async generateApiDocForFile() {
        const fileUri = await this.fileService.pickActiveFile();
        if (!fileUri) {
            return;
        }
        const format = await this.fileService.chooseFormat();
        const code = await this.fileService.readFileContent(fileUri);
        const prompt = this.promptBuilder.buildFilePrompt(code, fileUri.fsPath, format);
        const doc = await this.llmProvider.sendPrompt(prompt);
        await this.writer.writeFileDoc(fileUri, doc, format);
    }
    /**
     * Generate API documentation for the entire project
     */
    async generateApiDocForProject() {
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
    async generateOpenApiSpec() {
        await this.openApiService.generateAndSaveSpec();
    }
}
exports.ApiDocumentationGenerator = ApiDocumentationGenerator;
//# sourceMappingURL=apiDocumentationGenerator.js.map