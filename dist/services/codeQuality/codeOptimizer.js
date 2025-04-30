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
exports.CodeOptimizer = void 0;
const vscode = __importStar(require("vscode"));
const LoggerService_1 = require("../LoggerService");
const CodeAnalysisService_1 = require("./services/CodeAnalysisService");
const OptimizationService_1 = require("./services/OptimizationService");
const SuggestionService_1 = require("./services/SuggestionService");
/**
 * Provides code optimization functionality with comprehensive error handling
 */
class CodeOptimizer {
    analysisService;
    optimizationService;
    suggestionService;
    logger;
    disposables = [];
    constructor(context) {
        this.analysisService = new CodeAnalysisService_1.CodeAnalysisService(context);
        this.optimizationService = new OptimizationService_1.OptimizationService(context);
        this.suggestionService = new SuggestionService_1.SuggestionService(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
        this.registerEventHandlers();
    }
    /**
     * Analyzes and optimizes code in the given file
     */
    async optimizeFile(filePath) {
        try {
            const analysis = await this.analyzeFile(filePath);
            return await this.applyOptimizations(filePath, analysis);
        }
        catch (error) {
            this.handleError('Failed to optimize file', error);
            return this.createEmptyResult(filePath);
        }
    }
    /**
     * Analyzes code for optimization opportunities
     */
    async analyzeFile(filePath) {
        try {
            return await this.analysisService.analyzeFile(filePath);
        }
        catch (error) {
            this.handleError('Failed to analyze file', error);
            return this.createEmptyAnalysis(filePath);
        }
    }
    /**
     * Gets optimization suggestions without applying them
     */
    async getSuggestions(analysis) {
        try {
            return await this.suggestionService.generateSuggestions(analysis);
        }
        catch (error) {
            this.handleError('Failed to generate suggestions', error);
            return [];
        }
    }
    /**
     * Applies optimization suggestions to the code
     */
    async applyOptimizations(filePath, analysis) {
        try {
            const suggestions = await this.getSuggestions(analysis);
            return await this.optimizationService.applyOptimizations(filePath, suggestions);
        }
        catch (error) {
            this.handleError('Failed to apply optimizations', error);
            return this.createEmptyResult(filePath);
        }
    }
    /**
     * Shows optimization suggestions in the editor
     */
    showSuggestionsInEditor(editor, suggestions) {
        try {
            const decorations = this.suggestionService.createDecorations(suggestions);
            editor.setDecorations(this.suggestionService.getDecorationType(), decorations);
            this.disposables.push({ dispose: () => editor.setDecorations(this.suggestionService.getDecorationType(), []) });
        }
        catch (error) {
            this.handleError('Failed to show suggestions', error);
        }
    }
    /**
     * Cleans up resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.analysisService.dispose();
        this.optimizationService.dispose();
        this.suggestionService.dispose();
    }
    registerEventHandlers() {
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(e => this.handleDocumentChange(e)), vscode.window.onDidChangeActiveTextEditor(e => this.handleEditorChange(e)));
    }
    async handleDocumentChange(e) {
        try {
            if (this.shouldOptimize(e.document)) {
                const analysis = await this.analyzeFile(e.document.uri.fsPath);
                const suggestions = await this.getSuggestions(analysis);
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document === e.document) {
                    this.showSuggestionsInEditor(editor, suggestions);
                }
            }
        }
        catch (error) {
            this.handleError('Failed to handle document change', error);
        }
    }
    handleEditorChange(editor) {
        try {
            if (editor && this.shouldOptimize(editor.document)) {
                this.analyzeFile(editor.document.uri.fsPath)
                    .then(analysis => this.getSuggestions(analysis))
                    .then(suggestions => this.showSuggestionsInEditor(editor, suggestions))
                    .catch(error => this.handleError('Failed to handle editor change', error));
            }
        }
        catch (error) {
            this.handleError('Failed to handle editor change', error);
        }
    }
    shouldOptimize(document) {
        const supportedLanguages = ['typescript', 'javascript', 'python', 'java'];
        return supportedLanguages.includes(document.languageId);
    }
    createEmptyAnalysis(filePath) {
        return {
            filePath,
            issues: [],
            metrics: {
                complexity: 0,
                maintainability: 0,
                performance: 0
            }
        };
    }
    createEmptyResult(filePath) {
        return {
            filePath,
            optimizations: [],
            metrics: {
                complexity: 0,
                maintainability: 0,
                performance: 0
            },
            success: false
        };
    }
    handleError(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`CodeOptimizer: ${message}`, errorMessage);
        vscode.window.showErrorMessage(`Code optimization error: ${errorMessage}`);
    }
}
exports.CodeOptimizer = CodeOptimizer;
//# sourceMappingURL=codeOptimizer.js.map