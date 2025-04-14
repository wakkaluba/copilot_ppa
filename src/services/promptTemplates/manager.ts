import * as vscode from 'vscode';
import { PromptTemplate, NewPromptTemplate } from './model';
import { PromptTemplateStorage } from './storage';

/**
 * Service for managing prompt templates
 */
export class PromptTemplateManager {
    private storage: PromptTemplateStorage;
    
    constructor(context: vscode.ExtensionContext) {
        this.storage = new PromptTemplateStorage(context);
    }
    
    /**
     * Get all available templates
     */
    public getAllTemplates(): PromptTemplate[] {
        return this.storage.getAllTemplates();
    }
    
    /**
     * Get all available categories
     */
    public getAllCategories(): string[] {
        const templates = this.getAllTemplates();
        const categories = new Set(templates.map(t => t.category));
        return Array.from(categories).sort();
    }
    
    /**
     * Get all available tags
     */
    public getAllTags(): string[] {
        const templates = this.getAllTemplates();
        const tags = new Set(templates.flatMap(t => t.tags));
        return Array.from(tags).sort();
    }
    
    /**
     * Get templates by category
     */
    public getTemplatesByCategory(category: string): PromptTemplate[] {
        return this.storage.getTemplatesByCategory(category);
    }
    
    /**
     * Get templates by tag
     */
    public getTemplatesByTag(tag: string): PromptTemplate[] {
        return this.storage.getTemplatesByTag(tag);
    }
    
    /**
     * Get a template by ID
     */
    public getTemplate(id: string): PromptTemplate | undefined {
        return this.storage.getTemplate(id);
    }
    
    /**
     * Create a new template
     */
    public createTemplate(template: NewPromptTemplate): PromptTemplate {
        return this.storage.createTemplate(template);
    }
    
    /**
     * Update an existing template
     */
    public updateTemplate(id: string, updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'isSystem'>>): PromptTemplate | undefined {
        return this.storage.updateTemplate(id, updates);
    }
    
    /**
     * Delete a template
     */
    public deleteTemplate(id: string): boolean {
        return this.storage.deleteTemplate(id);
    }
    
    /**
     * Clone a template
     */
    public cloneTemplate(id: string, newName?: string): PromptTemplate | undefined {
        return this.storage.cloneTemplate(id, newName);
    }
    
    /**
     * Export templates to JSON
     */
    public exportTemplates(templateIds?: string[]): string {
        return this.storage.exportTemplates(templateIds);
    }
    
    /**
     * Import templates from JSON
     */
    public importTemplates(json: string): { success: number; failed: number } {
        return this.storage.importTemplates(json);
    }
    
    /**
     * Apply a template to the current editor selection
     */
    public async applyTemplate(templateId: string): Promise<boolean> {
        const template = this.getTemplate(templateId);
        if (!template) {
            vscode.window.showErrorMessage(`Template not found: ${templateId}`);
            return false;
        }
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return false;
        }
        
        // Get selection and language information
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        const language = editor.document.languageId;
        
        // Format the prompt with template variables
        let formattedPrompt = template.content
            .replace(/\{\{selection\}\}/g, selectedText)
            .replace(/\{\{language\}\}/g, language);
        
        // Additional variables could be added here
        
        // Send to agent chat or command palette
        // This will depend on your agent implementation
        // For now, we'll just copy to clipboard
        await vscode.env.clipboard.writeText(formattedPrompt);
        vscode.window.showInformationMessage(`Template "${template.name}" applied! The prompt has been copied to clipboard.`);
        
        return true;
    }
}

// Singleton instance
let promptTemplateManager: PromptTemplateManager | undefined;

/**
 * Initialize the prompt template manager
 */
export function initializePromptTemplateManager(context: vscode.ExtensionContext): PromptTemplateManager {
    promptTemplateManager = new PromptTemplateManager(context);
    return promptTemplateManager;
}

/**
 * Get the prompt template manager instance
 */
export function getPromptTemplateManager(): PromptTemplateManager {
    if (!promptTemplateManager) {
        throw new Error('Prompt Template Manager not initialized');
    }
    return promptTemplateManager;
}
