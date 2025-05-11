import * as vscode from 'vscode';
import { CopilotIntegrationProvider } from './copilotIntegrationProvider';

/**
 * Service responsible for integrating with GitHub Copilot.
 */
export class CopilotIntegrationService {
    private provider: CopilotIntegrationProvider;
    private extensionContext: vscode.ExtensionContext;
    private isAvailable: boolean = false;

    /**
     * Creates a new instance of the CopilotIntegrationService.
     *
     * @param context The VS Code extension context
     * @param provider The Copilot integration provider
     */
    constructor(context: vscode.ExtensionContext, provider: CopilotIntegrationProvider) {
        this.extensionContext = context;
        this.provider = provider;
        this.checkCopilotAvailability();
    }

    /**
     * Checks if GitHub Copilot is available.
     *
     * @returns A promise that resolves to true if Copilot is available, false otherwise
     */
    public async checkCopilotAvailability(): Promise<boolean> {
        try {
            // Try to get the Copilot extension
            const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');

            if (copilotExtension) {
                // If the extension is not active, activate it
                if (!copilotExtension.isActive) {
                    await copilotExtension.activate();
                }

                // Set availability to true
                this.isAvailable = true;
                return true;
            }

            this.isAvailable = false;
            return false;
        } catch (error) {
            console.error('Error checking Copilot availability:', error);
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * Gets whether Copilot is available.
     *
     * @returns True if Copilot is available, false otherwise
     */
    public isCopilotAvailable(): boolean {
        return this.isAvailable;
    }

    /**
     * Gets a completion from Copilot.
     *
     * @param code The code to get a completion for
     * @param prompt The prompt to use
     * @returns A promise that resolves to the completion
     */
    public async getCompletion(code: string, prompt: string): Promise<any> {
        if (!this.isAvailable) {
            throw new Error('Copilot is not available');
        }

        return this.provider.getCompletion(code, prompt);
    }

    /**
     * Processes selected code in the active editor with Copilot.
     *
     * @param editor The active text editor
     * @returns A promise that resolves when the code has been processed
     */
    public async processSelectedCode(editor: vscode.TextEditor): Promise<void> {
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const document = editor.document;

        // Get the selected text or the current line if nothing is selected
        let code = '';
        if (selection.isEmpty) {
            const line = document.lineAt(selection.active.line);
            code = line.text;
        } else {
            code = document.getText(selection);
        }

        if (!code.trim()) {
            vscode.window.showErrorMessage('No code selected');
            return;
        }

        // Show the input box for the prompt
        const prompt = await vscode.window.showInputBox({
            prompt: 'Enter a prompt for Copilot',
            placeHolder: 'e.g., Explain this code, Optimize this code',
            value: 'Explain this code in detail:'
        });

        if (!prompt) {
            return; // User cancelled
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Processing code with Copilot',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });

                const result = await this.getCompletion(code, prompt);

                progress.report({ increment: 100 });

                // Show the result in a new editor
                const document = await vscode.workspace.openTextDocument({
                    content: result.text,
                    language: 'markdown'
                });

                await vscode.window.showTextDocument(document);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error processing code: ${error.message}`);
        }
    }
}
