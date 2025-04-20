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
exports.CopilotIntegrationProvider = void 0;
const vscode = __importStar(require("vscode"));
const copilotIntegrationService_1 = require("./copilotIntegrationService");
const multilingualPromptManager_1 = require("../llm/multilingualPromptManager");
/**
 * Provider for Copilot integration functionality
 */
class CopilotIntegrationProvider {
    context;
    disposables = [];
    copilotService;
    promptManager;
    /**
     * Creates a new instance of the CopilotIntegrationProvider
     * @param context The extension context
     */
    constructor(context) {
        this.context = context;
        this.copilotService = new copilotIntegrationService_1.CopilotIntegrationService(context);
        this.promptManager = new multilingualPromptManager_1.MultilingualPromptManager();
        this.registerCommands();
    }
    /**
     * Registers commands for Copilot integration
     */
    registerCommands() {
        // Register commands for Copilot integration
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.forwardToCopilot', async (text) => {
            await this.forwardToCopilot(text);
        }), vscode.commands.registerCommand('copilot-ppa.sendToCopilotChat', async (text) => {
            await this.sendToCopilotChat(text);
        }), vscode.commands.registerCommand('copilot-ppa.getCompletionFromCopilot', async (prompt) => {
            return await this.getCompletionFromCopilot(prompt);
        }));
    }
    /**
     * Forwards text to Copilot for processing
     * @param text The text to forward to Copilot
     */
    async forwardToCopilot(text) {
        try {
            // Enhance the prompt with language directives if needed
            const enhancedPrompt = this.promptManager.enhancePromptWithLanguage(text);
            const request = {
                prompt: enhancedPrompt,
                options: {
                    temperature: 0.7,
                    maxTokens: 800
                }
            };
            return await this.copilotService.sendPrompt(request);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error forwarding to Copilot: ${error}`);
            return null;
        }
    }
    /**
     * Sends text to the Copilot chat interface
     * @param text The text to send to Copilot chat
     */
    async sendToCopilotChat(text) {
        try {
            // Enhance the prompt with language directives if needed
            const enhancedPrompt = this.promptManager.enhancePromptWithLanguage(text);
            await this.copilotService.sendToCopilotChat(enhancedPrompt);
            vscode.window.showInformationMessage('Message sent to Copilot Chat');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error sending to Copilot Chat: ${error}`);
        }
    }
    /**
     * Gets a completion from Copilot for the given prompt
     * @param prompt The prompt to send to Copilot
     */
    async getCompletionFromCopilot(prompt) {
        try {
            // Enhance the prompt with language directives if needed
            const enhancedPrompt = this.promptManager.enhancePromptWithLanguage(prompt);
            const request = {
                prompt: enhancedPrompt,
                options: {
                    temperature: 0.2, // Lower temperature for more deterministic completions
                    maxTokens: 500
                }
            };
            const response = await this.copilotService.sendPrompt(request);
            return response?.completion || null;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error getting completion from Copilot: ${error}`);
            return null;
        }
    }
    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    registerChatResponseCallback(callback) {
        return this.copilotService.registerChatResponseCallback(callback);
    }
    /**
     * Disposes of resources
     */
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
}
exports.CopilotIntegrationProvider = CopilotIntegrationProvider;
//# sourceMappingURL=copilotIntegrationProvider.js.map