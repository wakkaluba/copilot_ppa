"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotApiService = void 0;
const CopilotConnectionService_1 = require("./copilot/CopilotConnectionService");
const CopilotChatService_1 = require("./copilot/CopilotChatService");
const CopilotSuggestionService_1 = require("./copilot/CopilotSuggestionService");
const CopilotDataTransformer_1 = require("./copilot/CopilotDataTransformer");
class CopilotApiService {
    static instance;
    logger;
    connectionService;
    chatService;
    suggestionService;
    dataTransformer;
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.connectionService = new CopilotConnectionService_1.CopilotConnectionService(this.logger);
        this.chatService = new CopilotChatService_1.CopilotChatService(this.logger);
        this.suggestionService = new CopilotSuggestionService_1.CopilotSuggestionService(this.logger);
        this.dataTransformer = new CopilotDataTransformer_1.CopilotDataTransformer();
    }
    static getInstance() {
        if (!CopilotApiService.instance) {
            CopilotApiService.instance = new CopilotApiService();
        }
        return CopilotApiService.instance;
    }
    async initialize() {
        try {
            const copilotExtension = await this.connectionService.initialize();
            if (copilotExtension) {
                this.chatService.setExtension(copilotExtension);
                this.suggestionService.setExtension(copilotExtension);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Failed to initialize Copilot API connection', error);
            return false;
        }
    }
    isConnected() {
        return this.connectionService.isConnected();
    }
    async sendChatRequest(prompt, context) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        try {
            return await this.chatService.sendRequest(prompt, context);
        }
        catch (error) {
            this.logger.error('Error sending chat request to Copilot', error);
            throw new Error('Failed to communicate with Copilot: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    async getCodeSuggestions(code, language) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        try {
            return await this.suggestionService.getSuggestions(code, language);
        }
        catch (error) {
            this.logger.error('Error getting code suggestions from Copilot', error);
            throw new Error('Failed to get suggestions from Copilot');
        }
    }
    registerResponseHandler(callback) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        this.chatService.registerResponseHandler(callback);
    }
    transformData(data, targetFormat) {
        return this.dataTransformer.transform(data, targetFormat);
    }
}
exports.CopilotApiService = CopilotApiService;
//# sourceMappingURL=copilotApi.js.map