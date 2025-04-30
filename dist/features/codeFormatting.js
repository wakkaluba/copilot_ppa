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
exports.CodeFormattingManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages code formatting and optimization functionality
 */
class CodeFormattingManager {
    context;
    constructor(context) {
        this.context = context;
        this.registerCommands();
    }
    /**
     * Register all formatting and optimization related commands
     */
    registerCommands() {
        // Format current document using the VS Code formatting API
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.formatCurrentDocument', async () => {
            await this.formatDocument();
        }));
        // Format selection only
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.formatSelection', async () => {
            await this.formatSelection();
        }));
        // Optimize imports in current document
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.organizeImports', async () => {
            await this.organizeImports();
        }));
        // Optimize code using LLM (remove unused code, simplify logic)
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.optimizeCode', async () => {
            await this.optimizeCodeWithLLM();
        }));
    }
    /**
     * Format the entire active document
     */
    async formatDocument() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        try {
            await vscode.commands.executeCommand('editor.action.formatDocument');
            vscode.window.showInformationMessage('Document formatted successfully');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error formatting document: ${error}`);
        }
    }
    /**
     * Format only the selected text
     */
    async formatSelection() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showWarningMessage('No text selected');
            return;
        }
        try {
            await vscode.commands.executeCommand('editor.action.formatSelection');
            vscode.window.showInformationMessage('Selection formatted successfully');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error formatting selection: ${error}`);
        }
    }
    /**
     * Organize imports in the current document
     */
    async organizeImports() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        try {
            await vscode.commands.executeCommand('editor.action.organizeImports');
            vscode.window.showInformationMessage('Imports organized successfully');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error organizing imports: ${error}`);
        }
    }
    /**
     * Use the connected LLM to optimize code
     */
    async optimizeCodeWithLLM() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        // Get selection or entire document
        const selection = !editor.selection.isEmpty
            ? editor.selection
            : new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length));
        const text = editor.document.getText(selection);
        const language = editor.document.languageId;
        // Show a progress notification
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Optimizing code with LLM...',
            cancellable: true
        }, async (progress, token) => {
            try {
                // This would call your LLM service to optimize the code
                // For demonstration purposes, we'll just simulate a call
                const optimizedCode = await this.callLLMForCodeOptimization(text, language);
                if (token.isCancellationRequested) {
                    return;
                }
                // Apply the optimized code
                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, optimizedCode);
                });
                vscode.window.showInformationMessage('Code optimized successfully');
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error optimizing code: ${error}`);
            }
        });
    }
    /**
     * Call the LLM service to optimize code
     * This is a placeholder for the actual LLM integration
     */
    async callLLMForCodeOptimization(code, language) {
        // Here you would integrate with your LLM service
        // This is just a placeholder that returns the original code
        // Mock delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In a real implementation, you would:
        // 1. Get the LLM provider from your service
        // 2. Create a prompt asking to optimize the code
        // 3. Send the request and return the response
        return code; // Just return the original code for now
    }
}
exports.CodeFormattingManager = CodeFormattingManager;
//# sourceMappingURL=codeFormatting.js.map