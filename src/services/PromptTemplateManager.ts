import * as vscode from 'vscode';
import { Context } from '../types/context';

export interface PromptTemplate {
    name: string;
    template: string;
    description: string;
    variables: string[];
}

export class PromptTemplateManager {
    private static instance: PromptTemplateManager;
    private templates: Map<string, PromptTemplate>;

    private constructor() {
        this.templates = new Map();
        this.initializeDefaultTemplates();
    }

    static getInstance(): PromptTemplateManager {
        if (!PromptTemplateManager.instance) {
            PromptTemplateManager.instance = new PromptTemplateManager();
        }
        return PromptTemplateManager.instance;
    }

    private initializeDefaultTemplates() {
        this.addTemplate({
            name: 'code_explanation',
            description: 'Explains code functionality',
            template: `You are a code analysis expert. Analyze the following code:
{{selectedCode}}

Language: {{language}}
File: {{file}}

Provide a clear and concise explanation of:
1. What this code does
2. Key components and their purpose
3. Any potential improvements or issues

Response:`,
            variables: ['selectedCode', 'language', 'file']
        });

        this.addTemplate({
            name: 'refactoring_suggestion',
            description: 'Suggests code refactoring improvements',
            template: `As a code optimization expert, review this code:
{{selectedCode}}

Context:
- Language: {{language}}
- File: {{file}}
- Project type: {{projectType}}

Suggest refactoring improvements focusing on:
1. Code readability
2. Performance
3. Best practices
4. Design patterns

Provide specific recommendations with example code.

Response:`,
            variables: ['selectedCode', 'language', 'file', 'projectType']
        });

        this.addTemplate({
            name: 'code_completion',
            description: 'Completes code based on context',
            template: `Complete the following code while maintaining the existing style and conventions:
{{precedingCode}}

Current code:
{{selectedCode}}

Requirements:
- Language: {{language}}
- Follow established patterns
- Consider project context

Complete the code:`,
            variables: ['precedingCode', 'selectedCode', 'language']
        });
    }

    addTemplate(template: PromptTemplate): void {
        this.templates.set(template.name, template);
    }

    getTemplate(name: string): PromptTemplate | undefined {
        return this.templates.get(name);
    }

    getAllTemplates(): PromptTemplate[] {
        return Array.from(this.templates.values());
    }

    async generatePrompt(templateName: string, context: Context, variables: Record<string, string>): Promise<string> {
        const template = this.getTemplate(templateName);
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }

        let prompt = template.template;
        for (const [key, value] of Object.entries(variables)) {
            prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        // Add global context if available
        if (context.systemPrompt) {
            prompt = `${context.systemPrompt}\n\n${prompt}`;
        }

        return prompt;
    }

    async customizeTemplate(name: string, customizations: Partial<PromptTemplate>): Promise<void> {
        const template = this.getTemplate(name);
        if (!template) {
            throw new Error(`Template not found: ${name}`);
        }

        const updatedTemplate = { ...template, ...customizations };
        this.addTemplate(updatedTemplate);
    }
}
