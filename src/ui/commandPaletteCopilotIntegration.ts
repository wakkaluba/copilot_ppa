import * as vscode from 'vscode';
import { CopilotIntegrationWebview } from '../copilot/copilotIntegrationWebview';
import { CopilotIntegrationProvider } from '../copilot/copilotIntegrationProvider';
import { CopilotIntegrationService } from '../copilot/copilotIntegrationService';

/**
 * Registers command palette commands for Copilot integration
 */
export function registerCopilotIntegrationCommands(
    context: vscode.ExtensionContext,
    copilotProvider: CopilotIntegrationProvider,
    copilotService: CopilotIntegrationService
) {
    // Command to open the Copilot integration webview
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.openCopilotIntegration', () => {
            const webview = new CopilotIntegrationWebview(context, copilotService);
            webview.show();
        })
    );

    // Command to toggle between Local LLM and Copilot
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.toggleCopilotProvider', async () => {
            const config = vscode.workspace.getConfiguration('copilot-ppa');
            const currentProvider = config.get('selectedProvider', 'local');
            const newProvider = currentProvider === 'local' ? 'copilot' : 'local';
            
            await config.update('selectedProvider', newProvider, true);
            
            vscode.window.showInformationMessage(`Switched to ${newProvider === 'copilot' ? 'GitHub Copilot' : 'Local LLM'} as the provider.`);
        })
    );

    // Command to check if Copilot is available
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.checkCopilotAvailability', async () => {
            const isAvailable = copilotService.isAvailable();
            
            if (isAvailable) {
                vscode.window.showInformationMessage('GitHub Copilot is available and connected.');
            } else {
                vscode.window.showErrorMessage('GitHub Copilot is not available. Please make sure the extension is installed and authenticated.');
            }
            
            return isAvailable;
        })
    );

    // Command to send code selection to Copilot
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('copilot-ppa.sendSelectionToCopilot', async (editor) => {
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
                } catch (error) {
                    vscode.window.showErrorMessage(`Error processing with Copilot: ${error}`);
                }
            });
        })
    );

    // Register status bar item to show current provider
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'copilot-ppa.toggleCopilotProvider';
    context.subscriptions.push(statusBarItem);

    // Update status bar item when settings change
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.selectedProvider')) {
                updateStatusBarItem();
            }
        })
    );

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
