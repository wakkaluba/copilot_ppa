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
exports.ComplexityAnalysisCommand = void 0;
const vscode = __importStar(require("vscode"));
const codeComplexityAnalyzer_1 = require("./codeComplexityAnalyzer");
const path = __importStar(require("path"));
class ComplexityAnalysisCommand {
    constructor() {
        this.decorationDisposables = [];
        this.complexityAnalyzer = new codeComplexityAnalyzer_1.CodeComplexityAnalyzer();
    }
    /**
     * Register all complexity analysis commands
     * @returns Disposable for the commands
     */
    register() {
        const subscriptions = [];
        // Register commands
        subscriptions.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileComplexity', this.analyzeCurrentFile.bind(this)));
        subscriptions.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeWorkspaceComplexity', this.analyzeWorkspace.bind(this)));
        subscriptions.push(vscode.commands.registerCommand('vscodeLocalLLMAgent.toggleComplexityVisualization', this.toggleComplexityVisualization.bind(this)));
        // Watch for editor changes to update decorations
        subscriptions.push(vscode.window.onDidChangeActiveTextEditor(this.handleEditorChange.bind(this)));
        return vscode.Disposable.from(...subscriptions);
    }
    /**
     * Analyze complexity of the current file in the editor
     */
    async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze.');
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing file complexity...',
            cancellable: false
        }, async () => {
            const filePath = editor.document.uri.fsPath;
            const result = await this.complexityAnalyzer.analyzeFile(filePath);
            if (result) {
                // Show report
                const fileName = path.basename(filePath);
                const report = `# Complexity Analysis: ${fileName}\n\n` +
                    `- **Average complexity**: ${result.averageComplexity.toFixed(2)}\n` +
                    `- **Total functions**: ${result.functions.length}\n\n` +
                    this.generateFunctionsTable(result);
                const doc = await vscode.workspace.openTextDocument({
                    content: report,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
                // Apply decorations
                this.clearDecorations();
                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
            }
            else {
                vscode.window.showInformationMessage('File type not supported for complexity analysis.');
            }
        });
    }
    /**
     * Analyze complexity of the entire workspace
     */
    async analyzeWorkspace() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder open.');
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace complexity...',
            cancellable: false
        }, async (progress) => {
            try {
                // If multiple folders, let user pick one
                let folder;
                if (workspaceFolders.length === 1) {
                    folder = workspaceFolders[0];
                }
                else {
                    const selected = await vscode.window.showQuickPick(workspaceFolders.map(folder => ({
                        label: folder.name,
                        folder
                    })), { placeHolder: 'Select workspace folder to analyze' });
                    if (!selected) {
                        return; // User cancelled
                    }
                    folder = selected.folder;
                }
                progress.report({ message: `Analyzing files in ${folder.name}...` });
                const results = await this.complexityAnalyzer.analyzeWorkspace(folder);
                if (results.length === 0) {
                    vscode.window.showInformationMessage('No files found for complexity analysis.');
                    return;
                }
                const report = this.complexityAnalyzer.generateComplexityReport(results);
                const doc = await vscode.workspace.openTextDocument({
                    content: report,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(`Complexity analysis completed for ${results.length} files.`);
            }
            catch (error) {
                console.error('Error analyzing workspace:', error);
                vscode.window.showErrorMessage(`Error analyzing workspace: ${error.message}`);
            }
        });
    }
    /**
     * Toggle complexity visualization in the editor
     */
    async toggleComplexityVisualization() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor.');
            return;
        }
        if (this.decorationDisposables.length > 0) {
            // Decorations are active, remove them
            this.clearDecorations();
            vscode.window.showInformationMessage('Complexity visualization disabled.');
        }
        else {
            // No decorations, analyze and show
            const filePath = editor.document.uri.fsPath;
            const result = await this.complexityAnalyzer.analyzeFile(filePath);
            if (result) {
                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
                vscode.window.showInformationMessage('Complexity visualization enabled.');
            }
            else {
                vscode.window.showInformationMessage('File type not supported for complexity analysis.');
            }
        }
    }
    /**
     * Handle editor change event to update decorations
     */
    async handleEditorChange(editor) {
        // Clear existing decorations
        this.clearDecorations();
        // If decorations were active and we have a new editor, reapply
        if (editor && this.decorationDisposables.length > 0) {
            const filePath = editor.document.uri.fsPath;
            const result = await this.complexityAnalyzer.analyzeFile(filePath);
            if (result) {
                this.decorationDisposables = this.complexityAnalyzer.visualizeComplexity(editor, result);
            }
        }
    }
    /**
     * Clear all active decorations
     */
    clearDecorations() {
        while (this.decorationDisposables.length > 0) {
            const disposable = this.decorationDisposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    /**
     * Generate a markdown table of functions sorted by complexity
     */
    generateFunctionsTable(result) {
        let table = '## Functions by Complexity\n\n';
        if (result.functions.length === 0) {
            return table + '*No functions found to analyze.*\n\n';
        }
        table += '| Function | Complexity | Lines |\n';
        table += '|----------|------------|-------|\n';
        result.functions
            .sort((a, b) => b.complexity - a.complexity)
            .forEach((fn) => {
            let complexityIndicator = '';
            if (fn.complexity > 15) {
                complexityIndicator = '🔴 '; // High complexity
            }
            else if (fn.complexity > 10) {
                complexityIndicator = '🟠 '; // Medium complexity
            }
            else {
                complexityIndicator = '🟢 '; // Low complexity
            }
            table += `| ${fn.name} | ${complexityIndicator}${fn.complexity} | ${fn.startLine}-${fn.endLine} |\n`;
        });
        return table;
    }
}
exports.ComplexityAnalysisCommand = ComplexityAnalysisCommand;
//# sourceMappingURL=complexityAnalysisCommand.js.map