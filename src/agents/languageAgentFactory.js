"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageAgentFactory = void 0;
var LanguageAgentFactory = /** @class */ (function () {
    function LanguageAgentFactory() {
    }
    LanguageAgentFactory.registerAgent = function (language, agentClass) {
        this.agents.set(language.toLowerCase(), agentClass);
    };
    LanguageAgentFactory.createAgent = function (language, modelManager) {
        var agentClass = this.agents.get(language.toLowerCase());
        if (!agentClass) {
            throw new Error("No agent available for language: ".concat(language));
        }
        return new agentClass(modelManager);
    };
    LanguageAgentFactory.agents = new Map();
    return LanguageAgentFactory;
}());
exports.LanguageAgentFactory = LanguageAgentFactory;
