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
exports.DependencyAnalysisCommand = void 0;
const vscode = __importStar(require("vscode"));
const LoggerService_1 = require("../services/LoggerService");
const DependencyAnalysisService_1 = require("../services/dependencyAnalysis/DependencyAnalysisService");
const dependencyGraphView_1 = require("../webview/dependencyGraphView");
/**
 * Handles dependency analysis commands with comprehensive error handling
 */
class DependencyAnalysisCommand {
    service;
    graphProvider;
    logger;
    disposables = [];
    constructor(context) {
        this.service = new DependencyAnalysisService_1.DependencyAnalysisService(context);
        this.graphProvider = new dependencyGraphView_1.DependencyGraphProvider(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
        this.registerEventHandlers();
    }
    register() {
        try {
            this.disposables.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeDependencies', () => this.handleAnalyzeDependencies()), vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileDependencies', () => this.handleAnalyzeFileDependencies()), vscode.commands.registerCommand('vscodeLocalLLMAgent.showDependencyGraph', () => this.handleShowDependencyGraph()));
            return {
                dispose: () => {
                    this.disposables.forEach(d => d.dispose());
                    this.disposables.length = 0;
                    this.service.dispose();
                }
            };
        }
        catch (error) {
            this.handleError('Failed to register commands', error);
            throw error;
        }
    }
    async handleAnalyzeDependencies() {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return;
            }
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing project dependencies...',
                cancellable: true
            }, async (progress) => {
                await this.service.analyzeDependencies(workspaceRoot, {
                    onProgress: (message) => {
                        progress.report({ message });
                    }
                });
            });
        }
        catch (error) {
            this.handleError('Failed to analyze dependencies', error);
        }
    }
    async handleAnalyzeFileDependencies() {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('Please open a file to analyze dependencies');
                return;
            }
            await this.service.analyzeFileDependencies(editor.document.uri);
        }
        catch (error) {
            this.handleError('Failed to analyze file dependencies', error);
        }
    }
    async handleShowDependencyGraph() {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) {
                return;
            }
            await this.graphProvider.show(workspaceRoot);
        }
        catch (error) {
            this.handleError('Failed to show dependency graph', error);
        }
    }
    getWorkspaceRoot() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders?.length) {
            vscode.window.showErrorMessage('Please open a workspace to analyze dependencies');
            return undefined;
        }
        return workspaceFolders[0].uri.fsPath;
    }
    registerEventHandlers() {
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(() => this.handleWorkspaceChange()), vscode.workspace.onDidChangeTextDocument(e => this.handleDocumentChange(e)));
    }
    async handleWorkspaceChange() {
        try {
            await this.service.reset();
        }
        catch (error) {
            this.handleError('Failed to handle workspace change', error);
        }
    }
    async handleDocumentChange(e) {
        try {
            if (this.shouldAnalyze(e.document)) {
                await this.service.invalidateCache(e.document.uri);
            }
        }
        catch (error) {
            this.handleError('Failed to handle document change', error);
        }
    }
    shouldAnalyze(document) {
        const analyzableExtensions = ['.ts', '.js', '.jsx', '.tsx', '.vue', '.json'];
        return analyzableExtensions.some(ext => document.fileName.endsWith(ext));
    }
    handleError(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`DependencyAnalysisCommand: ${message}`, errorMessage);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }
}
exports.DependencyAnalysisCommand = DependencyAnalysisCommand;
//# sourceMappingURL=dependencyAnalysisCommand.js.map