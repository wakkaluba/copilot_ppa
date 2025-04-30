import * as vscode from 'vscode';
import { PromptTemplate, NewPromptTemplate } from './model';
/**
 * Service for managing prompt templates
 */
export declare class PromptTemplateManager {
    private storage;
    constructor(context: vscode.ExtensionContext);
    /**
     * Get all available templates
     */
    getAllTemplates(): PromptTemplate[];
    /**
     * Get all available categories
     */
    getAllCategories(): string[];
    /**
     * Get all available tags
     */
    getAllTags(): string[];
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category: string): PromptTemplate[];
    /**
     * Get templates by tag
     */
    getTemplatesByTag(tag: string): PromptTemplate[];
    /**
     * Get a template by ID
     */
    getTemplate(id: string): PromptTemplate | undefined;
    /**
     * Create a new template
     */
    createTemplate(template: NewPromptTemplate): PromptTemplate;
    /**
     * Update an existing template
     */
    updateTemplate(id: string, updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'isSystem'>>): PromptTemplate | undefined;
    /**
     * Delete a template
     */
    deleteTemplate(id: string): boolean;
    /**
     * Clone a template
     */
    cloneTemplate(id: string, newName?: string): PromptTemplate | undefined;
    /**
     * Export templates to JSON
     */
    exportTemplates(templateIds?: string[]): string;
    /**
     * Import templates from JSON
     */
    importTemplates(json: string): {
        success: number;
        failed: number;
    };
    /**
     * Apply a template to the current editor selection
     */
    applyTemplate(templateId: string): Promise<boolean>;
}
/**
 * Initialize the prompt template manager
 */
export declare function initializePromptTemplateManager(context: vscode.ExtensionContext): PromptTemplateManager;
/**
     * Get the prompt template manager instance
     */
export declare function getPromptTemplateManager(): PromptTemplateManager;
