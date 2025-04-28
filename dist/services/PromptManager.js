"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
class PromptManager {
    constructor(contextManager) {
        this.contextManager = contextManager;
    }
    createPrompt(userInput) {
        const contextString = this.contextManager.buildContextString();
        return `${contextString}\n\nUser: ${userInput}`;
    }
}
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map