import * as vscode from 'vscode';
/**
 * Interface for communication with Copilot API
 */
export interface CopilotApiRequest {
    prompt: string;
    context?: string;
    options?: CopilotRequestOptions;
}
/**
 * Options for Copilot API requests
 */
export interface CopilotRequestOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    model?: string;
}
/**
 * Response from Copilot API
 */
export interface CopilotApiResponse {
    completion: string;
    logprobs?: number[];
    model?: string;
    finishReason?: string;
}
/**
 * Service for integrating with GitHub Copilot
 */
export declare class CopilotIntegrationService {
    private readonly extensionContext;
    private copilotExtension?;
    private isInitialized;
    /**
     * Creates a new instance of the CopilotIntegrationService
     * @param context The extension context
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initializes the service and connects to the Copilot extension
     */
    private initialize;
    /**
     * Checks if the Copilot integration is available
     */
    isAvailable(): boolean;
    /**
     * Sends a prompt to Copilot and returns the response
     * @param request The request to send to Copilot
     */
    sendPrompt(request: CopilotApiRequest): Promise<CopilotApiResponse | null>;
    /**
     * Forwards a chat message to the Copilot chat interface
     * @param message The message to send
     */
    sendToCopilotChat(message: string): Promise<void>;
    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    registerChatResponseCallback(callback: (response: string) => void): vscode.Disposable;
}
