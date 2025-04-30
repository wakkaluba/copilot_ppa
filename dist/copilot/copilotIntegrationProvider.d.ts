import * as vscode from 'vscode';
import { CopilotApiResponse } from './copilotIntegrationService';
/**
 * Provider for Copilot integration functionality
 */
export declare class CopilotIntegrationProvider implements vscode.Disposable {
    private readonly context;
    private readonly disposables;
    private readonly copilotService;
    private readonly promptManager;
    /**
     * Creates a new instance of the CopilotIntegrationProvider
     * @param context The extension context
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Registers commands for Copilot integration
     */
    private registerCommands;
    /**
     * Forwards text to Copilot for processing
     * @param text The text to forward to Copilot
     */
    forwardToCopilot(text: string): Promise<CopilotApiResponse | null>;
    /**
     * Sends text to the Copilot chat interface
     * @param text The text to send to Copilot chat
     */
    sendToCopilotChat(text: string): Promise<void>;
    /**
     * Gets a completion from Copilot for the given prompt
     * @param prompt The prompt to send to Copilot
     */
    getCompletionFromCopilot(prompt: string): Promise<string | null>;
    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    registerChatResponseCallback(callback: (response: string) => void): vscode.Disposable;
    /**
     * Disposes of resources
     */
    dispose(): void;
}
