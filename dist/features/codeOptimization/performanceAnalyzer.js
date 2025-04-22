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
exports.PerformanceAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const PerformanceAnalysisService_1 = require("../../services/performance/PerformanceAnalysisService");
const PerformanceDiagnosticsService_1 = require("./services/PerformanceDiagnosticsService");
const PerformanceProgressService_1 = require("./services/PerformanceProgressService");
const PerformanceResultsService_1 = require("./services/PerformanceResultsService");
class PerformanceAnalyzer {
    analysisService;
    diagnosticsService;
    progressService;
    resultsService;
    constructor(context, llmService) {
        this.analysisService = new PerformanceAnalysisService_1.PerformanceAnalysisService(llmService);
        this.diagnosticsService = new PerformanceDiagnosticsService_1.PerformanceDiagnosticsService();
        this.progressService = new PerformanceProgressService_1.PerformanceProgressService();
        this.resultsService = new PerformanceResultsService_1.PerformanceResultsService();
        this.registerCommands(context);
    }
    registerCommands(context) {
        context.subscriptions.push(vscode.commands.registerCommand('vscode-local-llm-agent.analyzePerformance', this.analyzeCurrentFile.bind(this)), vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspacePerformance', this.analyzeWorkspace.bind(this)), this.diagnosticsService.getDiagnosticCollection());
    }
    async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        return this.analyzeFile(editor.document.uri);
    }
    async analyzeFile(fileUri) {
        const document = await vscode.workspace.openTextDocument(fileUri);
        this.diagnosticsService.clearDiagnostics(fileUri);
        try {
            return await this.progressService.withProgress(`Analyzing performance for ${document.fileName}`, async (progress, token) => {
                const results = await this.analysisService.analyzeFile(document, progress, token);
                if (results.length > 0) {
                    this.diagnosticsService.addDiagnostics(fileUri, results, document);
                    this.resultsService.displayResults(results);
                }
                return results;
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            return [];
        }
    }
    async analyzeWorkspace() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        await this.progressService.withProgress('Analyzing workspace performance', async (progress, token) => {
            await this.analysisService.analyzeWorkspace(progress, token);
        });
    }
}
exports.PerformanceAnalyzer = PerformanceAnalyzer;
//# sourceMappingURL=performanceAnalyzer.js.map