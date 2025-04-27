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
exports.CodeComplexityAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const CodeComplexityService_1 = require("../services/codeAnalysis/CodeComplexityService");
/**
 * Analyzes and visualizes code complexity metrics
 */
class CodeComplexityAnalyzer {
    constructor() {
        this.disposables = [];
        this.service = new CodeComplexityService_1.CodeComplexityService();
    }
    /**
     * Analyzes complexity metrics for a specific file
     */
    async analyzeFile(filePath) {
        try {
            return await this.service.analyzeFile(filePath);
        }
        catch (error) {
            this.handleError('File analysis failed', error);
            return null;
        }
    }
    /**
     * Analyzes complexity metrics for an entire workspace
     */
    async analyzeWorkspace(workspaceFolder) {
        try {
            return await this.service.analyzeWorkspace(workspaceFolder);
        }
        catch (error) {
            this.handleError('Workspace analysis failed', error);
            return [];
        }
    }
    /**
     * Generates a formatted complexity report
     */
    generateComplexityReport(results) {
        try {
            return this.service.generateComplexityReport(results);
        }
        catch (error) {
            this.handleError('Report generation failed', error);
            return 'Error generating complexity report';
        }
    }
    /**
     * Visualizes complexity metrics in the editor
     */
    visualizeComplexity(editor, result) {
        try {
            const visualizations = this.service.visualizeComplexity(editor, result);
            this.disposables.push(...visualizations);
            return visualizations;
        }
        catch (error) {
            this.handleError('Visualization failed', error);
            return [];
        }
    }
    /**
     * Cleans up resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.service.dispose();
    }
    handleError(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
        console.error(`CodeComplexityAnalyzer error: ${message}`, error);
    }
}
exports.CodeComplexityAnalyzer = CodeComplexityAnalyzer;
//# sourceMappingURL=codeComplexityAnalyzer.js.map