import { BaseAgent } from '../baseAgent';
import { LanguageAgentConfig } from '../languageAgentFactory';

export class TypeScriptAgent extends BaseAgent {
    private config: LanguageAgentConfig = {
        language: 'typescript',
        fileExtensions: ['.ts', '.tsx'],
        promptTemplates: {
            codeReview: 'Review this TypeScript code considering type safety and best practices:\n{code}',
            refactor: 'Refactor this TypeScript code to improve type usage and structure:\n{code}',
            documentation: 'Generate TypeScript documentation with proper JSDoc and type annotations:\n{code}'
        }
    };

    async reviewCode(code: string): Promise<string> {
        return this.processWithTemplate('codeReview', { code });
    }

    async suggestRefactoring(code: string): Promise<string> {
        return this.processWithTemplate('refactor', { code });
    }

    async generateDocumentation(code: string): Promise<string> {
        return this.processWithTemplate('documentation', { code });
    }

    private async processWithTemplate(templateKey: string, params: Record<string, string>): Promise<string> {
        const template = this.config.promptTemplates[templateKey];
        const prompt = Object.entries(params).reduce(
            (text, [key, value]) => text.replace(`{${key}}`, value),
            template
        );
        return this.modelManager.getActiveModel().generateResponse(prompt);
    }
}
