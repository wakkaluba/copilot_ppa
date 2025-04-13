import * as vscode from 'vscode';

export interface PromptTemplate {
    name: string;
    template: string;
    description: string;
    parameters: string[];
}

export class PromptManager {
    private static instance: PromptManager;
    private templates: Map<string, PromptTemplate>;

    private constructor() {
        this.templates = new Map();
        this.initializeDefaultTemplates();
    }

    static getInstance(): PromptManager {
        if (!this.instance) {
            this.instance = new PromptManager();
        }
        return this.instance;
    }

    private initializeDefaultTemplates() {
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

    addTemplate(template: PromptTemplate): void {
        this.templates.set(template.name, template);
    }

    getTemplate(name: string): PromptTemplate | undefined {
        return this.templates.get(name);
    }

    listTemplates(): PromptTemplate[] {
        return Array.from(this.templates.values());
    }

    generatePrompt(templateName: string, parameters: Record<string, string>): string {
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
