import * as vscode from 'vscode';
import { PromptTemplate, NewPromptTemplate } from './model';
/**
 * Service for storing and retrieving prompt templates
 */
export declare class PromptTemplateStorage {
    private static readonly STORAGE_KEY;
    private templates;
    private storage;
    constructor(context: vscode.ExtensionContext);
    /**
     * Get all stored templates
     */
    getAllTemplates(): PromptTemplate[];
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
     * Clone a template (creates a copy that can be modified)
     */
    cloneTemplate(id: string, newName?: string): PromptTemplate | undefined;
    /**
     * Export templates to JSON format
     */
    exportTemplates(templateIds?: string[]): string;
    /**
     * Import templates from JSON format
     */
    importTemplates(json: string): {
        success: number;
        failed: number;
    };
    /**
     * Add default system templates
     */
    addDefaultTemplates(): void;
    /**
     * Load templates from storage
     */
    private loadTemplates;
    /**
     * Save templates to storage
     */
    private saveTemplates;
}
