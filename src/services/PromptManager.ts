import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    category: string;
    tags: string[];
    usage: number;
    lastUsed?: number;
    isUserDefined: boolean;
}

export class PromptManager extends EventEmitter implements vscode.Disposable {
    private static instance: PromptManager;
    private readonly context: vscode.ExtensionContext;
    private templates: Map<string, PromptTemplate> = new Map();
    private builtInTemplatesLoaded = false;
    
    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
    }
    
    public static getInstance(context?: vscode.ExtensionContext): PromptManager {
        if (!PromptManager.instance) {
            if (!context) {
                throw new Error('Context is required when creating PromptManager for the first time');
            }
            PromptManager.instance = new PromptManager(context);
        }
        return PromptManager.instance;
    }
    
    async initialize(): Promise<void> {
        await this.loadTemplates();
    }
    
    private async loadTemplates(): Promise<void> {
        try {
            // Load user-defined templates from storage
            const userTemplates = this.context.globalState.get<PromptTemplate[]>('promptTemplates', []);
            userTemplates.forEach(template => {
                this.templates.set(template.id, template);
            });
            
            // Load built-in templates if not already loaded
            if (!this.builtInTemplatesLoaded) {
                await this.loadBuiltInTemplates();
                this.builtInTemplatesLoaded = true;
            }
            
            this.emit('templatesLoaded', this.getAllTemplates());
        } catch (error) {
            console.error('Error loading prompt templates:', error);
            throw new Error(`Failed to load templates: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private async loadBuiltInTemplates(): Promise<void> {
        try {
            const builtInTemplatesPath = path.join(this.context.extensionPath, 'resources', 'templates', 'prompts.json');
            
            if (fs.existsSync(builtInTemplatesPath)) {
                const templateData = await fs.promises.readFile(builtInTemplatesPath, 'utf-8');
                const builtInTemplates = JSON.parse(templateData) as PromptTemplate[];
                
                builtInTemplates.forEach(template => {
                    // Mark as built-in
                    template.isUserDefined = false;
                    // Don't overwrite user templates with same ID
                    if (!this.templates.has(template.id)) {
                        this.templates.set(template.id, template);
                    }
                });
            } else {
                // Default built-in templates if file doesn't exist
                this.addDefaultTemplates();
            }
        } catch (error) {
            console.error('Error loading built-in templates:', error);
            this.addDefaultTemplates();
        }
    }
    
    private addDefaultTemplates(): void {
        const defaultTemplates: PromptTemplate[] = [
            {
                id: 'explain-code',
                name: 'Explain Code',
                description: 'Explain what the selected code does',
                template: 'Explain the following code:\n\n{{selectedCode}}',
                category: 'Code Understanding',
                tags: ['explanation', 'code', 'documentation'],
                usage: 0,
                isUserDefined: false
            },
            {
                id: 'optimize-code',
                name: 'Optimize Code',
                description: 'Suggest optimizations for the selected code',
                template: 'Optimize the following code for performance and readability:\n\n{{selectedCode}}',
                category: 'Code Improvement',
                tags: ['optimization', 'performance', 'refactoring'],
                usage: 0,
                isUserDefined: false
            },
            {
                id: 'generate-test',
                name: 'Generate Tests',
                description: 'Generate unit tests for the selected code',
                template: 'Generate unit tests for the following code:\n\n{{selectedCode}}',
                category: 'Testing',
                tags: ['testing', 'unit test', 'quality'],
                usage: 0,
                isUserDefined: false
            }
        ];
        
        defaultTemplates.forEach(template => {
            if (!this.templates.has(template.id)) {
                this.templates.set(template.id, template);
            }
        });
    }
    
    async saveTemplates(): Promise<void> {
        try {
            const userTemplates = Array.from(this.templates.values())
                .filter(template => template.isUserDefined);
            
            await this.context.globalState.update('promptTemplates', userTemplates);
        } catch (error) {
            console.error('Error saving prompt templates:', error);
            throw new Error(`Failed to save templates: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    getTemplate(id: string): PromptTemplate | undefined {
        return this.templates.get(id);
    }
    
    getAllTemplates(): PromptTemplate[] {
        return Array.from(this.templates.values());
    }
    
    getTemplatesByCategory(category: string): PromptTemplate[] {
        return this.getAllTemplates().filter(template => template.category === category);
    }
    
    getTemplatesByTags(tags: string[]): PromptTemplate[] {
        return this.getAllTemplates().filter(template => 
            tags.some(tag => template.tags.includes(tag))
        );
    }
    
    async createTemplate(template: Omit<PromptTemplate, 'id' | 'usage' | 'lastUsed' | 'isUserDefined'>): Promise<PromptTemplate> {
        const id = `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const newTemplate: PromptTemplate = {
            ...template,
            id,
            usage: 0,
            isUserDefined: true
        };
        
        this.templates.set(id, newTemplate);
        await this.saveTemplates();
        
        this.emit('templateCreated', newTemplate);
        return newTemplate;
    }
    
    async updateTemplate(id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate> {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Template with ID ${id} not found`);
        }
        
        // Don't allow changing the ID or marking built-in as user-defined
        const { id: _, isUserDefined, ...validUpdates } = updates;
        
        const updatedTemplate: PromptTemplate = {
            ...template,
            ...validUpdates
        };
        
        this.templates.set(id, updatedTemplate);
        
        // Only save if it's a user-defined template
        if (template.isUserDefined) {
            await this.saveTemplates();
        }
        
        this.emit('templateUpdated', updatedTemplate);
        return updatedTemplate;
    }
    
    async deleteTemplate(id: string): Promise<boolean> {
        const template = this.templates.get(id);
        if (!template) {
            return false;
        }
        
        // Don't allow deleting built-in templates
        if (!template.isUserDefined) {
            throw new Error('Cannot delete built-in templates');
        }
        
        this.templates.delete(id);
        await this.saveTemplates();
        
        this.emit('templateDeleted', id);
        return true;
    }
    
    async useTemplate(id: string, variables: Record<string, string> = {}): Promise<string> {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Template with ID ${id} not found`);
        }
        
        // Update usage stats
        template.usage += 1;
        template.lastUsed = Date.now();
        
        // Save if it's a user template
        if (template.isUserDefined) {
            await this.saveTemplates();
        }
        
        // Process template variables
        let processed = template.template;
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value);
        });
        
        // Remove any remaining variables
        processed = processed.replace(/{{\w+}}/g, '');
        
        this.emit('templateUsed', id);
        return processed;
    }
    
    async resetUsageStats(): Promise<void> {
        for (const template of this.templates.values()) {
            template.usage = 0;
            template.lastUsed = undefined;
        }
        
        await this.saveTemplates();
        this.emit('statsReset');
    }

    async importTemplates(jsonData: string): Promise<PromptTemplate[]> {
        try {
            const templates = JSON.parse(jsonData) as PromptTemplate[];
            const importedTemplates: PromptTemplate[] = [];
            
            for (const template of templates) {
                // Generate a new ID to avoid conflicts
                const newId = `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                // Mark as user-defined
                const importedTemplate: PromptTemplate = {
                    ...template,
                    id: newId,
                    isUserDefined: true,
                    usage: 0,
                    lastUsed: undefined
                };
                
                this.templates.set(newId, importedTemplate);
                importedTemplates.push(importedTemplate);
            }
            
            await this.saveTemplates();
            this.emit('templatesImported', importedTemplates);
            
            return importedTemplates;
        } catch (error) {
            throw new Error(`Failed to import templates: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    async exportTemplates(userOnly: boolean = false): Promise<string> {
        let templates = this.getAllTemplates();
        
        if (userOnly) {
            templates = templates.filter(template => template.isUserDefined);
        }
        
        return JSON.stringify(templates, null, 2);
    }
    
    dispose(): void {
        this.removeAllListeners();
    }
}
