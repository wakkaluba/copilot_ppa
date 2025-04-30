"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
class Agent {
    responseEnhancer;
    constructor(context, options) {
        this.llmService = options.llmService;
        this.conversationHistory = options.conversationHistory;
        this.responseEnhancer = options.responseEnhancer;
    }
    async processMessage(message) {
        // Add user message to the conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        // Generate a response from the LLM service
        const baseResponse = await this.llmService.generateResponse(message);
        // Enhance the response with context from conversation history
        const enhancedResponse = await this.responseEnhancer.enhanceResponse(message, baseResponse);
        return enhancedResponse;
    }
    dispose() {
        // Clean up resources if necessary
    }
}
exports.Agent = Agent;
//# sourceMappingURL=Agent.js.map