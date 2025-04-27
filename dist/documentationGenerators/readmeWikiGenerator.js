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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeWikiGenerator = exports.DocumentationType = void 0;
const vscode = __importStar(require("vscode"));
const ProjectInfoService_1 = require("./services/ProjectInfoService");
const ReadmeService_1 = require("./services/ReadmeService");
const ContributingService_1 = require("./services/ContributingService");
const WikiService_1 = require("./services/WikiService");
const DocumentationDiffService_1 = require("./services/DocumentationDiffService");
/**
 * Types of documentation that can be generated
 */
var DocumentationType;
(function (DocumentationType) {
    DocumentationType["README"] = "README";
    DocumentationType["CONTRIBUTING"] = "CONTRIBUTING";
    DocumentationType["WIKI_HOME"] = "Wiki Home";
    DocumentationType["WIKI_GETTING_STARTED"] = "Wiki Getting Started";
    DocumentationType["WIKI_API"] = "Wiki API";
    DocumentationType["WIKI_EXAMPLES"] = "Wiki Examples";
    DocumentationType["WIKI_FAQ"] = "Wiki FAQ";
    DocumentationType["WIKI_TROUBLESHOOTING"] = "Wiki Troubleshooting";
    DocumentationType["CUSTOM"] = "Custom";
})(DocumentationType = exports.DocumentationType || (exports.DocumentationType = {}));
/**
 * README/Wiki Generator class for creating project documentation
 */
class ReadmeWikiGenerator {
    /**
     * Constructor for the README/Wiki generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context, llmProvider) {
        this.context = context;
        this.llmProvider = llmProvider;
        this.projectInfoSvc = new ProjectInfoService_1.ProjectInfoService();
        this.readmeSvc = new ReadmeService_1.ReadmeService(context, llmProvider, this.projectInfoSvc);
        this.contributingSvc = new ContributingService_1.ContributingService(context, llmProvider, this.projectInfoSvc);
        this.wikiSvc = new WikiService_1.WikiService(context, llmProvider, this.projectInfoSvc);
        this.diffSvc = new DocumentationDiffService_1.DocumentationDiffService(context);
        this.registerCommands();
    }
    /**
     * Register commands for README/Wiki generation
     */
    registerCommands() {
        // Command to generate README
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.readme', async () => await this.generateReadme()));
        // Command to generate CONTRIBUTING guide
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.contributing', async () => await this.generateContributing()));
        // Command to generate Wiki page
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.wiki', async () => await this.generateWikiPage()));
        // Command to generate multiple documentation files
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.projectDocs', async () => await this.generateProjectDocumentation()));
    }
    /**
     * Generate a README.md file for the current project
     */
    async generateReadme() {
        await this.readmeSvc.generate();
    }
    /**
     * Generate a CONTRIBUTING.md file for the current project
     */
    async generateContributing() {
        await this.contributingSvc.generate();
    }
    /**
     * Generate a Wiki page file
     */
    async generateWikiPage() {
        await this.wikiSvc.generatePage();
    }
    /**
     * Generate multiple documentation files for the project
     */
    async generateProjectDocumentation() {
        await this.wikiSvc.generateAll();
    }
}
exports.ReadmeWikiGenerator = ReadmeWikiGenerator;
//# sourceMappingURL=readmeWikiGenerator.js.map