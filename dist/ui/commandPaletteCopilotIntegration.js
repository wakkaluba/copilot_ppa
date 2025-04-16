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
exports.registerCopilotIntegrationCommands = registerCopilotIntegrationCommands;
const vscode = __importStar(require("vscode"));
const copilotIntegrationWebview_1 = require("../copilot/copilotIntegrationWebview");
/**
 * Registers command palette commands for Copilot integration
 */
function registerCopilotIntegrationCommands(context, copilotProvider, copilotService) {
    // Command to open the Copilot integration webview
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.openCopilotIntegration', () => {
        const webview = new copilotIntegrationWebview_1.CopilotIntegrationWebview(context, copilotService);
        webview.show();
    }));
    // Command to toggle between Local LLM and Copilot
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.toggleCopilotProvider', async () => {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const currentProvider = config.get('selectedProvider', 'local');
        const newProvider = currentProvider === 'local' ? 'copilot' : 'local';
        await config.update('selectedProvider', newProvider, true);
        vscode.window.showInformationMessage(`Switched to ${newProvider === 'copilot' ? 'GitHub Copilot' : 'Local LLM'} as the provider.`);
    }));
    // Command to check if Copilot is available
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.checkCopilotAvailability', async () => {
        const isAvailable = copilotService.isAvailable();
        if (isAvailable) {
            vscode.window.showInformationMessage('GitHub Copilot is available and connected.');
        }
        else {
            vscode.window.showErrorMessage('GitHub Copilot is not available. Please make sure the extension is installed and authenticated.');
        }
        return isAvailable;
    }));
    // Command to send code selection to Copilot
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('copilot-ppa.sendSelectionToCopilot', async (editor) => {
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No text selected to send to Copilot.');
            return;
        }
        const text = editor.document.getText(selection);
        // Ask user for a prompt
        const userPrompt = await vscode.window.showInputBox({
            prompt: 'What would you like Copilot to do with this code?',
            placeHolder: 'E.g., Explain this code, Refactor this code, Optimize this code'
        });
        if (!userPrompt) {
            return; // User cancelled
        }
        // Show progress indication
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Processing with Copilot...',
            cancellable: false
        }, async () => {
            try {
                // Format the prompt with the selected code
                const fullPrompt = `${userPrompt}\n\nHere's the code:\n\`\`\`\n${text}\n\`\`\``;
                // Send to Copilot
                const response = await copilotProvider.forwardToCopilot(fullPrompt);
                if (response) {
                    // Show the response in a new editor
                    const document = await vscode.workspace.openTextDocument({
                        content: `# Copilot Response\n\n${response.completion}`,
                        language: 'markdown'
                    });
                    await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside });
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error processing with Copilot: ${error}`);
            }
        });
    }));
    // Register status bar item to show current provider
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'copilot-ppa.toggleCopilotProvider';
    context.subscriptions.push(statusBarItem);
    // Update status bar item when settings change
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('copilot-ppa.selectedProvider')) {
            updateStatusBarItem();
        }
    }));
    // Initial update
    updateStatusBarItem();
    /**
     * Updates the status bar item with the current provider
     */
    function updateStatusBarItem() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const provider = config.get('selectedProvider', 'local');
        statusBarItem.text = provider === 'copilot' ? '$(github) Copilot' : '$(hubot) Local LLM';
        statusBarItem.tooltip = `Current AI Provider: ${provider === 'copilot' ? 'GitHub Copilot' : 'Local LLM'} (Click to toggle)`;
        statusBarItem.show();
    }
}
//# sourceMappingURL=commandPaletteCopilotIntegration.js.map