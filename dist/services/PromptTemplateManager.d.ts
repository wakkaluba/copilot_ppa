import { Context } from '../types/context';
export interface PromptTemplate {
    name: string;
    template: string;
    description: string;
    variables: string[];
}
export declare class PromptTemplateManager {
    private static instance;
    private templates;
    private constructor();
    static getInstance(): PromptTemplateManager;
    private initializeDefaultTemplates;
    addTemplate(template: PromptTemplate): void;
    getTemplate(name: string): PromptTemplate | undefined;
    getAllTemplates(): PromptTemplate[];
    generatePrompt(templateName: string, context: Context, variables: Record<string, string>): Promise<string>;
    customizeTemplate(name: string, customizations: Partial<PromptTemplate>): Promise<void>;
}
