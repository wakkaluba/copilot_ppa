"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotChatIntegration = void 0;
const copilotApi_1 = require("../services/copilotApi");
const logger_1 = require("../utils/logger");
const CopilotChatInitializationService_1 = require("./services/CopilotChatInitializationService");
const CopilotChatParticipantService_1 = require("./services/CopilotChatParticipantService");
const CopilotChatMessageHandlerService_1 = require("./services/CopilotChatMessageHandlerService");
const CopilotChatCommandHandlerService_1 = require("./services/CopilotChatCommandHandlerService");
class CopilotChatIntegration {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.copilotApiService = copilotApi_1.CopilotApiService.getInstance();
        this.initService = new CopilotChatInitializationService_1.CopilotChatInitializationService(this.logger);
        this.participantService = new CopilotChatParticipantService_1.CopilotChatParticipantService(this.logger);
        this.messageHandlerService = new CopilotChatMessageHandlerService_1.CopilotChatMessageHandlerService(this.logger);
        this.commandHandlerService = new CopilotChatCommandHandlerService_1.CopilotChatCommandHandlerService(this.logger);
    }
    static getInstance() {
        if (!CopilotChatIntegration.instance) {
            CopilotChatIntegration.instance = new CopilotChatIntegration();
        }
        return CopilotChatIntegration.instance;
    }
    async initialize() {
        try {
            const isConnected = await this.copilotApiService.initialize();
            if (!isConnected) {
                this.logger.warn('Failed to connect to Copilot API. Integration not available.');
                return false;
            }
            const chatProvider = await this.initService.initializeCopilotExtension();
            if (!chatProvider) {
                return false;
            }
            this.participantService.registerChatParticipant(chatProvider, {
                handleMessage: this.handleChatMessage.bind(this),
                handleCommandIntent: this.handleCommandIntent.bind(this)
            });
            this.logger.info('Successfully integrated with GitHub Copilot chat');
            return true;
        }
        catch (error) {
            this.logger.error('Error initializing Copilot chat integration', error);
            return false;
        }
    }
    async handleChatMessage(request) {
        try {
            this.logger.info(`Received chat message: ${request.message}`);
            return await this.messageHandlerService.handleMessage(request);
        }
        catch (error) {
            this.logger.error('Error handling chat message', error);
            return this.messageHandlerService.createErrorResponse(error);
        }
    }
    async handleCommandIntent(command, args) {
        this.logger.info(`Received command intent: ${command}`);
        return this.commandHandlerService.handleCommand(command, args);
    }
    async sendMessageToCopilotChat(message) {
        if (!this.initService.isIntegrationActive()) {
            this.logger.warn('Cannot send message: Copilot chat integration not active');
            return false;
        }
        try {
            return await this.messageHandlerService.sendMessage(message);
        }
        catch (error) {
            this.logger.error('Error sending message to Copilot chat', error);
            return false;
        }
    }
    isActive() {
        return this.initService.isIntegrationActive();
    }
    toggleIntegration() {
        return this.initService.toggleIntegration();
    }
}
exports.CopilotChatIntegration = CopilotChatIntegration;
//# sourceMappingURL=copilotChatIntegration.js.map