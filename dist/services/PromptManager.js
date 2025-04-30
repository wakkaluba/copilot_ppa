"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
class PromptManager {
    contextManager; // Using any temporarily to resolve type issues
    constructor(contextManager) {
        this.contextManager = contextManager;
    }
    createPrompt(userInput) {
        // Call buildContextString which is available in the actual implementation
        const contextString = this.contextManager.buildContextString();
        return `${contextString}\n\nUser: ${userInput}`;
    }
}
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map