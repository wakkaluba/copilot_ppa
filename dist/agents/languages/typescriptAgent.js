"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptAgent = void 0;
const baseAgent_1 = require("../baseAgent");
class TypeScriptAgent extends baseAgent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.config = {
            language: 'typescript',
            fileExtensions: ['.ts', '.tsx'],
            promptTemplates: {
                codeReview: 'Review this TypeScript code considering type safety and best practices:\n{code}',
                refactor: 'Refactor this TypeScript code to improve type usage and structure:\n{code}',
                documentation: 'Generate TypeScript documentation with proper JSDoc and type annotations:\n{code}'
            }
        };
    }
    async reviewCode(code) {
        return this.processWithTemplate('codeReview', { code });
    }
    async suggestRefactoring(code) {
        return this.processWithTemplate('refactor', { code });
    }
    async generateDocumentation(code) {
        return this.processWithTemplate('documentation', { code });
    }
    async processWithTemplate(templateKey, params) {
        const template = this.config.promptTemplates[templateKey];
        const prompt = Object.entries(params).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template);
        return this.modelManager.getActiveModel().generateResponse(prompt);
    }
}
exports.TypeScriptAgent = TypeScriptAgent;
//# sourceMappingURL=typescriptAgent.js.map