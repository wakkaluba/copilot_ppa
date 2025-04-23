"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotWebviewMessageHandler = void 0;
class CopilotWebviewMessageHandler {
    stateManager;
    connectionManager;
    logger;
    constructor(stateManager, connectionManager, logger) {
        this.stateManager = stateManager;
        this.connectionManager = connectionManager;
        this.logger = logger;
    }
    async handleMessage(message) {
        try {
            switch (message.command) {
                case 'toggleLLMMode':
                    await this.stateManager.toggleLLMMode();
                    break;
                case 'sendMessage':
                    if (message.text) {
                        return await this.handleMessageSend(message.text);
                    }
                    break;
                case 'reconnectCopilot':
                    await this.connectionManager.reconnect();
                    break;
                default:
                    this.logger.warn(`Unknown command: ${message.command}`);
            }
        }
        catch (error) {
            this.logger.error('Error handling message', error);
            throw error;
        }
    }
    async handleMessageSend(text) {
        if (!text.trim()) {
            return;
        }
        this.stateManager.addMessage('user', text);
        try {
            const response = await this.connectionManager.sendMessage(text);
            this.stateManager.addMessage('assistant', response);
            return { command: 'addResponse', text: response };
        }
        catch (error) {
            const errorMessage = this.connectionManager.getErrorMessage(error);
            return { command: 'showError', text: errorMessage };
        }
    }
    dispose() {
        // No resources to dispose
    }
}
exports.CopilotWebviewMessageHandler = CopilotWebviewMessageHandler;
//# sourceMappingURL=CopilotWebviewMessageHandler.js.map