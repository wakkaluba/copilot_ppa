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
exports.CopilotIntegrationService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Service for integrating with GitHub Copilot
 */
class CopilotIntegrationService {
    /**
     * Creates a new instance of the CopilotIntegrationService
     * @param context The extension context
     */
    constructor(context) {
        this.isInitialized = false;
        this.extensionContext = context;
        this.initialize();
    }
    /**
     * Initializes the service and connects to the Copilot extension
     */
    async initialize() {
        try {
            // Find the GitHub Copilot extension
            this.copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
            if (!this.copilotExtension) {
                vscode.window.showWarningMessage('GitHub Copilot extension is not installed or not enabled.');
                return;
            }
            // Ensure the extension is activated
            if (!this.copilotExtension.isActive) {
                await this.copilotExtension.activate();
            }
            this.isInitialized = true;
            vscode.window.showInformationMessage('Successfully connected to GitHub Copilot.');
        }
        catch (error) {
            console.error('Failed to initialize Copilot integration:', error);
            vscode.window.showErrorMessage(`Failed to initialize Copilot integration: ${error}`);
        }
    }
    /**
     * Checks if the Copilot integration is available
     */
    isAvailable() {
        return this.isInitialized && !!this.copilotExtension?.isActive;
    }
    /**
     * Sends a prompt to Copilot and returns the response
     * @param request The request to send to Copilot
     */
    async sendPrompt(request) {
        if (!this.isAvailable()) {
            await this.initialize();
            if (!this.isAvailable()) {
                throw new Error('GitHub Copilot is not available');
            }
        }
        try {
            // Access the Copilot API - Note that this is conceptual as the actual API may differ
            const copilotApi = this.copilotExtension?.exports;
            // This is a placeholder for the actual API call
            // The actual implementation will depend on the Copilot extension's public API
            const response = await copilotApi.provideSuggestion({
                prompt: request.prompt,
                context: request.context || '',
                options: {
                    temperature: request.options?.temperature || 0.7,
                    maxTokens: request.options?.maxTokens || 800,
                    stopSequences: request.options?.stopSequences || [],
                    model: request.options?.model || 'default'
                }
            });
            return {
                completion: response.suggestion || '',
                model: response.model,
                finishReason: response.finishReason
            };
        }
        catch (error) {
            console.error('Error sending prompt to Copilot:', error);
            throw new Error(`Failed to get response from Copilot: ${error}`);
        }
    }
    /**
     * Forwards a chat message to the Copilot chat interface
     * @param message The message to send
     */
    async sendToCopilotChat(message) {
        if (!this.isAvailable()) {
            throw new Error('GitHub Copilot is not available');
        }
        try {
            // This is conceptual - the actual API call will depend on Copilot's public API
            await vscode.commands.executeCommand('github.copilot.chat.sendToCopilotChat', message);
            return;
        }
        catch (error) {
            console.error('Error sending message to Copilot Chat:', error);
            throw new Error(`Failed to send message to Copilot Chat: ${error}`);
        }
    }
    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    registerChatResponseCallback(callback) {
        // This is conceptual - the actual event subscription will depend on Copilot's public API
        const disposable = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('github.copilot.chat.lastResponse')) {
                const response = vscode.workspace.getConfiguration('github.copilot.chat').get('lastResponse');
                if (response) {
                    callback(response);
                }
            }
        });
        this.extensionContext.subscriptions.push(disposable);
        return disposable;
    }
}
exports.CopilotIntegrationService = CopilotIntegrationService;
//# sourceMappingURL=copilotIntegrationService.js.map