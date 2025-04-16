"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
class PromptManager {
    constructor() {
        this.templates = new Map();
        this.initializeDefaultTemplates();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PromptManager();
        }
        return this.instance;
    }
    initializeDefaultTemplates() {
        this.addTemplate({
            name: 'explain-code',
            template: `Analyze and explain the following code:
{{code}}

Focus on:
1. Main purpose
2. Key functionality
3. Important patterns or techniques used
4. Potential improvements`,
            description: 'Explains a code section in detail',
            parameters: ['code']
        });
        this.addTemplate({
            name: 'suggest-improvements',
            template: `Review this code and suggest improvements:
{{code}}

Consider:
- Code quality
- Performance
- Security
- Best practices
- Edge cases`,
            description: 'Suggests code improvements',
            parameters: ['code']
        });
        this.addTemplate({
            name: 'implement-feature',
            template: `Create an implementation for the following feature:
Requirements:
{{requirements}}

Context:
{{context}}

Constraints:
{{constraints}}`,
            description: 'Generates code for a new feature',
            parameters: ['requirements', 'context', 'constraints']
        });
        this.addTemplate({
            name: 'debug-issue',
            template: `Help debug this issue:
Problem description:
{{problem}}

Code:
{{code}}

Error message:
{{error}}`,
            description: 'Assists with debugging',
            parameters: ['problem', 'code', 'error']
        });
    }
    addTemplate(template) {
        this.templates.set(template.name, template);
    }
    getTemplate(name) {
        return this.templates.get(name);
    }
    listTemplates() {
        return Array.from(this.templates.values());
    }
    generatePrompt(templateName, parameters) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }
        let prompt = template.template;
        for (const [key, value] of Object.entries(parameters)) {
            prompt = prompt.replace(`{{${key}}}`, value);
        }
        return prompt;
    }
}
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map