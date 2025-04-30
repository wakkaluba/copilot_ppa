"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageAgentFactory = void 0;
class LanguageAgentFactory {
    static agents = new Map();
    static registerAgent(language, agentClass) {
        this.agents.set(language.toLowerCase(), agentClass);
    }
    static createAgent(language, modelManager) {
        const agentClass = this.agents.get(language.toLowerCase());
        if (!agentClass) {
            throw new Error(`No agent available for language: ${language}`);
        }
        return new agentClass(modelManager);
    }
}
exports.LanguageAgentFactory = LanguageAgentFactory;
//# sourceMappingURL=languageAgentFactory.js.map