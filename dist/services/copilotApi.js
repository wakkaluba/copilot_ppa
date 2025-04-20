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
exports.CopilotApiService = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
/**
 * Service for interacting with the Copilot API
 */
class CopilotApiService {
    static instance;
    logger;
    copilotExtension;
    constructor() {
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Get singleton instance of CopilotApiService
     */
    static getInstance() {
        if (!CopilotApiService.instance) {
            CopilotApiService.instance = new CopilotApiService();
        }
        return CopilotApiService.instance;
    }
    /**
     * Initialize connection to Copilot extension
     */
    async initialize() {
        try {
            // Find and connect to the Copilot extension
            const extension = vscode.extensions.getExtension('GitHub.copilot');
            if (!extension) {
                this.logger.warn('GitHub Copilot extension not found');
                return false;
            }
            if (!extension.isActive) {
                await extension.activate();
            }
            this.copilotExtension = extension.exports;
            this.logger.info('Successfully connected to GitHub Copilot extension');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to initialize Copilot API connection', error);
            return false;
        }
    }
    /**
     * Check if the Copilot API is available and connected
     */
    isConnected() {
        return !!this.copilotExtension;
    }
    /**
     * Send a message to Copilot chat and get the response
     * @param prompt The user's message/prompt
     * @param context Additional context for the request
     */
    async sendChatRequest(prompt, context) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        try {
            // Access the internal chat API of Copilot
            const response = await this.copilotExtension.chat.sendRequest({
                message: prompt,
                context: context || {},
            });
            return response.message;
        }
        catch (error) {
            this.logger.error('Error sending chat request to Copilot', error);
            throw new Error('Failed to communicate with Copilot: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    /**
     * Submit code snippets to Copilot for suggestions
     * @param code The code to analyze
     * @param language The programming language
     */
    async getCodeSuggestions(code, language) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        try {
            const suggestions = await this.copilotExtension.getSuggestions(code, {
                language,
                position: { line: 0, character: 0 }
            });
            return suggestions.map((suggestion) => suggestion.text);
        }
        catch (error) {
            this.logger.error('Error getting code suggestions from Copilot', error);
            throw new Error('Failed to get suggestions from Copilot');
        }
    }
    /**
     * Register a callback to handle Copilot responses
     * @param callback Function to call when a response is received
     */
    registerResponseHandler(callback) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        this.copilotExtension.onResponse((data) => {
            callback(data);
        });
    }
    /**
     * Transform data between local LLM format and Copilot format
     * @param data The data to transform
     * @param targetFormat The format to transform to
     */
    transformData(data, targetFormat) {
        switch (targetFormat) {
            case 'copilot':
                return {
                    message: data.content,
                    user: data.user || 'user',
                    timestamp: data.timestamp || new Date().toISOString(),
                    metadata: data.metadata || {}
                };
            case 'localLLM':
                return {
                    content: data.message,
                    user: data.user || 'assistant',
                    timestamp: data.timestamp || new Date().toISOString(),
                    metadata: data.metadata || {}
                };
            default:
                throw new Error(`Unknown target format: ${targetFormat}`);
        }
    }
}
exports.CopilotApiService = CopilotApiService;
//# sourceMappingURL=copilotApi.js.map