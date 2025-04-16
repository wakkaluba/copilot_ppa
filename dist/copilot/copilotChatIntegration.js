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
exports.CopilotChatIntegration = void 0;
const vscode = __importStar(require("vscode"));
const copilotApi_1 = require("../services/copilotApi");
const logger_1 = require("../utils/logger");
/**
 * Handles direct integration with GitHub Copilot chat window
 */
class CopilotChatIntegration {
    constructor() {
        this.chatContext = new Map();
        this.isIntegrationActive = false;
        this.logger = logger_1.Logger.getInstance();
        this.copilotApiService = copilotApi_1.CopilotApiService.getInstance();
    }
    /**
     * Get singleton instance of CopilotChatIntegration
     */
    static getInstance() {
        if (!CopilotChatIntegration.instance) {
            CopilotChatIntegration.instance = new CopilotChatIntegration();
        }
        return CopilotChatIntegration.instance;
    }
    /**
     * Initialize integration with Copilot chat
     */
    async initialize() {
        try {
            const isConnected = await this.copilotApiService.initialize();
            if (!isConnected) {
                this.logger.warn('Failed to connect to Copilot API. Integration not available.');
                return false;
            }
            // Get GitHub Copilot extension
            const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
            if (!copilotExtension) {
                this.logger.warn('GitHub Copilot extension not found');
                return false;
            }
            if (!copilotExtension.isActive) {
                await copilotExtension.activate();
            }
            // Access the chat provider
            this.copilotChatProvider = copilotExtension.exports.getChatProvider?.();
            if (!this.copilotChatProvider) {
                this.logger.warn('GitHub Copilot chat provider not available');
                return false;
            }
            // Register our extension as a participant
            this.registerChatParticipant();
            this.isIntegrationActive = true;
            this.logger.info('Successfully integrated with GitHub Copilot chat');
            return true;
        }
        catch (error) {
            this.logger.error('Error initializing Copilot chat integration', error);
            return false;
        }
    }
    /**
     * Register as a chat participant in Copilot's chat window
     */
    registerChatParticipant() {
        // Check if the API exists
        if (!this.copilotChatProvider || !this.copilotChatProvider.registerChatParticipant) {
            this.logger.warn('Chat participant registration API not available');
            return;
        }
        // Register our extension as a chat participant
        this.copilotChatProvider.registerChatParticipant({
            id: 'local-llm-agent',
            name: 'Local LLM Agent',
            description: 'Integrate local LLM models with Copilot',
            detail: 'Provides responses using locally hosted LLMs',
            // Handle incoming messages
            handleMessage: async (request) => {
                return await this.handleChatMessage(request);
            },
            // Handle command intents (special commands like /explain, etc.)
            handleCommandIntent: async (command, args) => {
                return await this.handleCommandIntent(command, args);
            }
        });
        this.logger.info('Registered as chat participant in GitHub Copilot');
    }
    /**
     * Handle incoming chat messages from Copilot
     */
    async handleChatMessage(request) {
        try {
            this.logger.info(`Received chat message: ${request.message}`);
            // Store context for this conversation
            this.chatContext.set(request.conversationId, {
                lastMessage: request.message,
                timestamp: new Date().toISOString()
            });
            // Process with local LLM
            // This is where you'd connect to your local LLM service
            const localLlmResponse = `This is a response from Local LLM Agent for: "${request.message}"`;
            return {
                message: localLlmResponse,
                metadata: {
                    source: 'local-llm-agent',
                    model: 'local-model'
                }
            };
        }
        catch (error) {
            this.logger.error('Error handling chat message', error);
            return {
                message: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : String(error)}`,
                metadata: {
                    source: 'local-llm-agent',
                    isError: true
                }
            };
        }
    }
    /**
     * Handle command intents (special commands)
     */
    async handleCommandIntent(command, args) {
        this.logger.info(`Received command intent: ${command}`);
        switch (command) {
            case 'explain':
                return this.handleExplainCommand(args);
            case 'generate':
                return this.handleGenerateCommand(args);
            case 'test':
                return this.handleTestCommand(args);
            default:
                return {
                    message: `Command "${command}" not supported by Local LLM Agent`,
                    metadata: {
                        source: 'local-llm-agent',
                        command
                    }
                };
        }
    }
    /**
     * Handle /explain command
     */
    async handleExplainCommand(args) {
        return {
            message: `Here's an explanation from Local LLM Agent: ${args.code}`,
            metadata: {
                source: 'local-llm-agent',
                command: 'explain'
            }
        };
    }
    /**
     * Handle /generate command
     */
    async handleGenerateCommand(args) {
        return {
            message: `Here's generated code from Local LLM Agent for: ${args.prompt}`,
            metadata: {
                source: 'local-llm-agent',
                command: 'generate'
            }
        };
    }
    /**
     * Handle /test command
     */
    async handleTestCommand(args) {
        return {
            message: `Here are test cases from Local LLM Agent for: ${args.code}`,
            metadata: {
                source: 'local-llm-agent',
                command: 'test'
            }
        };
    }
    /**
     * Send message to Copilot chat programmatically
     */
    async sendMessageToCopilotChat(message) {
        if (!this.isIntegrationActive || !this.copilotChatProvider) {
            this.logger.warn('Cannot send message: Copilot chat integration not active');
            return false;
        }
        try {
            // Check if the required API exists
            if (!this.copilotChatProvider.sendMessage) {
                this.logger.warn('Send message API not available in Copilot chat provider');
                return false;
            }
            // Send message to active Copilot chat
            await this.copilotChatProvider.sendMessage({
                message,
                source: 'local-llm-agent'
            });
            return true;
        }
        catch (error) {
            this.logger.error('Error sending message to Copilot chat', error);
            return false;
        }
    }
    /**
     * Check if Copilot chat integration is active
     */
    isActive() {
        return this.isIntegrationActive;
    }
    /**
     * Toggle integration state
     */
    toggleIntegration() {
        this.isIntegrationActive = !this.isIntegrationActive;
        this.logger.info(`Copilot chat integration ${this.isIntegrationActive ? 'enabled' : 'disabled'}`);
        return this.isIntegrationActive;
    }
}
exports.CopilotChatIntegration = CopilotChatIntegration;
//# sourceMappingURL=copilotChatIntegration.js.map