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
exports.CodeToolsManager = void 0;
const vscode = __importStar(require("vscode"));
const linterIntegration_1 = require("./linterIntegration");
const complexityAnalyzer_1 = require("./complexityAnalyzer");
const refactoringTools_1 = require("./refactoringTools");
const documentationGenerator_1 = require("./documentationGenerator");
/**
 * Central manager for all code tools integrations
 */
class CodeToolsManager {
    context;
    linterIntegration;
    complexityAnalyzer;
    refactoringTools;
    documentationGenerator;
    constructor(context) {
        this.context = context;
        this.linterIntegration = new linterIntegration_1.LinterIntegration();
        this.complexityAnalyzer = new complexityAnalyzer_1.ComplexityAnalyzer();
        this.refactoringTools = new refactoringTools_1.RefactoringTools();
        this.documentationGenerator = new documentationGenerator_1.DocumentationGenerator();
    }
    /**
     * Initialize all code tools
     */
    async initialize() {
        await this.linterIntegration.initialize();
        await this.complexityAnalyzer.initialize();
        await this.refactoringTools.initialize();
        await this.documentationGenerator.initialize();
        this.registerCommands();
    }
    /**
     * Register all commands for code tools
     */
    registerCommands() {
        this.context.subscriptions.push(vscode.commands.registerCommand('local-llm-agent.runLinter', () => this.linterIntegration.runLinter()), vscode.commands.registerCommand('local-llm-agent.analyzeComplexity', () => this.complexityAnalyzer.analyzeFile()), vscode.commands.registerCommand('local-llm-agent.simplifyCode', () => this.refactoringTools.simplifyCode()), vscode.commands.registerCommand('local-llm-agent.removeUnusedCode', () => this.refactoringTools.removeUnusedCode()), vscode.commands.registerCommand('local-llm-agent.generateDocs', () => this.documentationGenerator.generateDocs()));
    }
    /**
     * Dispose all resources
     */
    dispose() {
        this.linterIntegration.dispose();
        this.complexityAnalyzer.dispose();
        this.refactoringTools.dispose();
        this.documentationGenerator.dispose();
    }
}
exports.CodeToolsManager = CodeToolsManager;
//# sourceMappingURL=codeToolsManager.js.map