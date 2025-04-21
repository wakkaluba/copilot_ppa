import * as vscode from 'vscode';
import { PromptTemplate } from '../types/prompts';

export class PromptManager implements vscode.Disposable {
    private templates: Map<string, PromptTemplate> = new Map();
    private readonly defaultSystemPrompt = 'You are a helpful VS Code extension assistant that excels at understanding and working with code.';

    constructor(private readonly context?: vscode.ExtensionContext) {
        this.initializeDefaultTemplates();
    }

    private initializeDefaultTemplates(): void {
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

    public getTemplate(id: string): PromptTemplate | undefined {
        return this.templates.get(id);
    }

    public getAllTemplates(): PromptTemplate[] {
        return Array.from(this.templates.values());
    }

    public registerTemplate(template: PromptTemplate): void {
        this.templates.set(template.id, template);
    }

    public removeTemplate(id: string): boolean {
        return this.templates.delete(id);
    }

    public getDefaultSystemPrompt(): string {
        return this.defaultSystemPrompt;
    }

    public async buildContextualPrompt(input: string, relevantFiles: string[]): Promise<string> {
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
        } else if (input.toLowerCase().includes('review')) {
            const reviewTemplate = this.getTemplate('code_review');
            if (reviewTemplate) {
                prompt += '\n\n' + reviewTemplate.template.replace('{context}', '');
            }
        }

        return prompt;
    }

    public customizePrompt(basePrompt: string, context: Record<string, string>): string {
        let prompt = basePrompt;
        for (const [key, value] of Object.entries(context)) {
            prompt = prompt.replace(`{${key}}`, value);
        }
        return prompt;
    }

    public dispose(): void {
        this.templates.clear();
    }
}
