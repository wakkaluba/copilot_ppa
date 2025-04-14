import * as vscode from 'vscode';
import { CopilotIntegrationService, CopilotApiRequest, CopilotApiResponse } from './copilotIntegrationService';
import { MultilingualPromptManager } from '../llm/multilingualPromptManager';

/**
 * Provider for Copilot integration functionality
 */
export class CopilotIntegrationProvider implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private readonly copilotService: CopilotIntegrationService;
    private readonly promptManager: MultilingualPromptManager;

    /**
     * Creates a new instance of the CopilotIntegrationProvider
     * @param context The extension context
     */
    constructor(
        private readonly context: vscode.ExtensionContext
    ) {
        this.copilotService = new CopilotIntegrationService(context);
        this.promptManager = new MultilingualPromptManager();
        
        this.registerCommands();
    }

    /**
     * Registers commands for Copilot integration
     */
    private registerCommands(): void {
        // Register commands for Copilot integration
        this.disposables.push(
            vscode.commands.registerCommand('copilot-ppa.forwardToCopilot', async (text: string) => {
                await this.forwardToCopilot(text);
            }),
            
            vscode.commands.registerCommand('copilot-ppa.sendToCopilotChat', async (text: string) => {
                await this.sendToCopilotChat(text);
            }),
            
            vscode.commands.registerCommand('copilot-ppa.getCompletionFromCopilot', async (prompt: string) => {
                return await this.getCompletionFromCopilot(prompt);
            })
        );
    }

    /**
     * Forwards text to Copilot for processing
     * @param text The text to forward to Copilot
     */
    public async forwardToCopilot(text: string): Promise<CopilotApiResponse | null> {
        try {
            // Enhance the prompt with language directives if needed
            const enhancedPrompt = this.promptManager.enhancePromptWithLanguage(text);
            
            const request: CopilotApiRequest = {
                prompt: enhancedPrompt,
                options: {
                    temperature: 0.7,
                    maxTokens: 800
                }
            };
            
            return await this.copilotService.sendPrompt(request);
        } catch (error) {
            vscode.window.showErrorMessage(`Error forwarding to Copilot: ${error}`);
            return null;
        }
    }

    /**
     * Sends text to the Copilot chat interface
     * @param text The text to send to Copilot chat
     */
    public async sendToCopilotChat(text: string): Promise<void> {
        try {
            // Enhance the prompt with language directives if needed
            const enhancedPrompt = this.promptManager.enhancePromptWithLanguage(text);
            
            await this.copilotService.sendToCopilotChat(enhancedPrompt);
            vscode.window.showInformationMessage('Message sent to Copilot Chat');
        } catch (error) {
            vscode.window.showErrorMessage(`Error sending to Copilot Chat: ${error}`);
        }
    }

    /**
     * Gets a completion from Copilot for the given prompt
     * @param prompt The prompt to send to Copilot
     */
    public async getCompletionFromCopilot(prompt: string): Promise<string | null> {
        try {
            // Enhance the prompt with language directives if needed
            const enhancedPrompt = this.promptManager.enhancePromptWithLanguage(prompt);
            
            const request: CopilotApiRequest = {
                prompt: enhancedPrompt,
                options: {
                    temperature: 0.2, // Lower temperature for more deterministic completions
                    maxTokens: 500
                }
            };
            
            const response = await this.copilotService.sendPrompt(request);
            return response?.completion || null;
        } catch (error) {
            vscode.window.showErrorMessage(`Error getting completion from Copilot: ${error}`);
            return null;
        }
    }

    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    public registerChatResponseCallback(callback: (response: string) => void): vscode.Disposable {
        return this.copilotService.registerChatResponseCallback(callback);
    }

    /**
     * Disposes of resources
     */
    public dispose(): void {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
}
