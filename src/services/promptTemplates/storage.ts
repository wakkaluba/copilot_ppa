import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { PromptTemplate, NewPromptTemplate } from './model';

/**
 * Service for storing and retrieving prompt templates
 */
export class PromptTemplateStorage {
    private static readonly STORAGE_KEY = 'promptTemplates';
    private templates: Map<string, PromptTemplate> = new Map();
    private storage: vscode.Memento;
    
    constructor(context: vscode.ExtensionContext) {
        // Use global state for templates to persist across workspaces
        this.storage = context.globalState;
        this.loadTemplates();
    }
    
    /**
     * Get all stored templates
     */
    public getAllTemplates(): PromptTemplate[] {
        return Array.from(this.templates.values());
    }
    
    /**
     * Get templates by category
     */
    public getTemplatesByCategory(category: string): PromptTemplate[] {
        return this.getAllTemplates().filter(t => t.category === category);
    }
    
    /**
     * Get templates by tag
     */
    public getTemplatesByTag(tag: string): PromptTemplate[] {
        return this.getAllTemplates().filter(t => t.tags.includes(tag));
    }
    
    /**
     * Get a template by ID
     */
    public getTemplate(id: string): PromptTemplate | undefined {
        return this.templates.get(id);
    }
    
    /**
     * Create a new template
     */
    public createTemplate(template: NewPromptTemplate): PromptTemplate {
        const now = Date.now();
        const newTemplate: PromptTemplate = {
            ...template,
            id: uuidv4(),
            createdAt: now,
            modifiedAt: now
        };
        
        this.templates.set(newTemplate.id, newTemplate);
        this.saveTemplates();
        return newTemplate;
    }
    
    /**
     * Update an existing template
     */
    public updateTemplate(id: string, updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'isSystem'>>): PromptTemplate | undefined {
        const template = this.templates.get(id);
        if (!template) {
            return undefined;
        }
        
        // Don't allow modification of system templates
        if (template.isSystem) {
            throw new Error('System templates cannot be modified');
        }
        
        const updatedTemplate: PromptTemplate = {
            ...template,
            ...updates,
            modifiedAt: Date.now()
        };
        
        this.templates.set(id, updatedTemplate);
        this.saveTemplates();
        return updatedTemplate;
    }
    
    /**
     * Delete a template
     */
    public deleteTemplate(id: string): boolean {
        const template = this.templates.get(id);
        if (!template) {
            return false;
        }
        
        // Don't allow deletion of system templates
        if (template.isSystem) {
            throw new Error('System templates cannot be deleted');
        }
        
        const success = this.templates.delete(id);
        if (success) {
            this.saveTemplates();
        }
        return success;
    }
    
    /**
     * Clone a template (creates a copy that can be modified)
     */
    public cloneTemplate(id: string, newName?: string): PromptTemplate | undefined {
        const template = this.templates.get(id);
        if (!template) {
            return undefined;
        }
        
        const cloneData: NewPromptTemplate = {
            name: newName || `${template.name} (Copy)`,
            content: template.content,
            description: template.description,
            category: template.category,
            tags: [...template.tags]
        };
        
        return this.createTemplate(cloneData);
    }
    
    /**
     * Export templates to JSON format
     */
    public exportTemplates(templateIds?: string[]): string {
        let templatesToExport: PromptTemplate[];
        
        if (templateIds && templateIds.length > 0) {
            templatesToExport = templateIds
                .map(id => this.templates.get(id))
                .filter((t): t is PromptTemplate => t !== undefined);
        } else {
            templatesToExport = this.getAllTemplates();
        }
        
        return JSON.stringify(templatesToExport, null, 2);
    }
    
    /**
     * Import templates from JSON format
     */
    public importTemplates(json: string): { success: number; failed: number } {
        try {
            const templates = JSON.parse(json) as PromptTemplate[];
            let success = 0;
            let failed = 0;
            
            if (!Array.isArray(templates)) {
                throw new Error('Invalid template format: expected an array');
            }
            
            for (const template of templates) {
                try {
                    // Validate template
                    if (!template.name || !template.content || !template.category) {
                        failed++;
                        continue;
                    }
                    
                    // Create a new template (with new ID)
                    this.createTemplate({
                        name: template.name,
                        content: template.content,
                        description: template.description,
                        category: template.category,
                        tags: template.tags || []
                    });
                    
                    success++;
                } catch (err) {
                    failed++;
                }
            }
            
            this.saveTemplates();
            return { success, failed };
        } catch (err) {
            throw new Error(`Failed to import templates: ${err.message}`);
        }
    }
    
    /**
     * Add default system templates
     */
    public addDefaultTemplates(): void {
        const now = Date.now();
        const defaultTemplates: PromptTemplate[] = [
            {
                id: 'default-code-explainer',
                name: 'Code Explainer',
                description: 'Explain the provided code in detail',
                content: 'Please explain this code in detail, including its purpose, how it works, and any potential issues:\n\n```{{language}}\n{{selection}}\n```',
                category: 'code-analysis',
                tags: ['explanation', 'understanding'],
                createdAt: now,
                modifiedAt: now,
                isSystem: true
            },
            {
                id: 'default-code-refactor',
                name: 'Code Refactoring',
                description: 'Request a refactoring of selected code',
                content: 'Please refactor this code to improve its readability, performance, and maintainability:\n\n```{{language}}\n{{selection}}\n```\n\nFocus on the following aspects:\n- Code structure\n- Variable naming\n- Efficiency\n- Best practices for {{language}}',
                category: 'code-improvement',
                tags: ['refactoring', 'optimization'],
                createdAt: now,
                modifiedAt: now,
                isSystem: true
            },
            {
                id: 'default-unit-test',
                name: 'Generate Unit Tests',
                description: 'Generate unit tests for the selected code',
                content: 'Please generate comprehensive unit tests for the following code:\n\n```{{language}}\n{{selection}}\n```\n\nInclude tests for edge cases and error handling.',
                category: 'testing',
                tags: ['unit-test', 'test-generation'],
                createdAt: now,
                modifiedAt: now,
                isSystem: true
            }
        ];
        
        // Only add templates that don't already exist
        for (const template of defaultTemplates) {
            if (!this.templates.has(template.id)) {
                this.templates.set(template.id, template);
            }
        }
        
        this.saveTemplates();
    }
    
    /**
     * Load templates from storage
     */
    private loadTemplates(): void {
        const data = this.storage.get<PromptTemplate[]>(PromptTemplateStorage.STORAGE_KEY, []);
        this.templates = new Map(data.map(t => [t.id, t]));
        
        // Add default templates if storage is empty
        if (this.templates.size === 0) {
            this.addDefaultTemplates();
        }
    }
    
    /**
     * Save templates to storage
     */
    private saveTemplates(): void {
        const data = this.getAllTemplates();
        this.storage.update(PromptTemplateStorage.STORAGE_KEY, data);
    }
}
