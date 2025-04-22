"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
class PromptManager {
    context;
    templates = new Map();
    defaultSystemPrompt = 'You are a helpful VS Code extension assistant that excels at understanding and working with code.';
    constructor(context) {
        this.context = context;
        this.initializeDefaultTemplates();
    }
    initializeDefaultTemplates() {
        this.templates.set('default', {
            id: 'default',
            name: 'Default System Prompt',
            template: this.defaultSystemPrompt,
            description: 'Basic system prompt for general assistance'
        });
        this.templates.set('code_review', {
            id: 'code_review',
            name: 'Code Review',
            template: 'You are a senior software engineer conducting a thorough code review. Focus on:{context}',
            description: 'Template for code review prompts'
        });
        this.templates.set('refactoring', {
            id: 'refactoring',
            name: 'Code Refactoring',
            template: 'You are a software architect helping to refactor code. Consider these aspects:{context}',
            description: 'Template for code refactoring guidance'
        });
    }
    getTemplate(id) {
        return this.templates.get(id);
    }
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    registerTemplate(template) {
        this.templates.set(template.id, template);
    }
    removeTemplate(id) {
        return this.templates.delete(id);
    }
    getDefaultSystemPrompt() {
        return this.defaultSystemPrompt;
    }
    async buildContextualPrompt(input, relevantFiles) {
        let prompt = this.defaultSystemPrompt;
        if (relevantFiles.length > 0) {
            prompt += '\n\nRelevant files for context:';
            for (const file of relevantFiles) {
                prompt += `\n- ${file}`;
            }
        }
        // Add any customization based on input content
        if (input.toLowerCase().includes('refactor')) {
            const refactoringTemplate = this.getTemplate('refactoring');
            if (refactoringTemplate) {
                prompt += '\n\n' + refactoringTemplate.template.replace('{context}', '');
            }
        }
        else if (input.toLowerCase().includes('review')) {
            const reviewTemplate = this.getTemplate('code_review');
            if (reviewTemplate) {
                prompt += '\n\n' + reviewTemplate.template.replace('{context}', '');
            }
        }
        return prompt;
    }
    customizePrompt(basePrompt, context) {
        let prompt = basePrompt;
        for (const [key, value] of Object.entries(context)) {
            prompt = prompt.replace(`{${key}}`, value);
        }
        return prompt;
    }
    dispose() {
        this.templates.clear();
    }
}
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map