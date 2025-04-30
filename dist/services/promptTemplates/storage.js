"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateStorage = void 0;
const uuid_1 = require("uuid");
/**
 * Service for storing and retrieving prompt templates
 */
class PromptTemplateStorage {
    static STORAGE_KEY = 'promptTemplates';
    templates = new Map();
    storage;
    constructor(context) {
        // Use global state for templates to persist across workspaces
        this.storage = context.globalState;
        this.loadTemplates();
    }
    /**
     * Get all stored templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(t => t.category === category);
    }
    /**
     * Get templates by tag
     */
    getTemplatesByTag(tag) {
        return this.getAllTemplates().filter(t => t.tags.includes(tag));
    }
    /**
     * Get a template by ID
     */
    getTemplate(id) {
        return this.templates.get(id);
    }
    /**
     * Create a new template
     */
    createTemplate(template) {
        const now = Date.now();
        const newTemplate = {
            ...template,
            id: (0, uuid_1.v4)(),
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
    updateTemplate(id, updates) {
        const template = this.templates.get(id);
        if (!template) {
            return undefined;
        }
        // Don't allow modification of system templates
        if (template.isSystem) {
            throw new Error('System templates cannot be modified');
        }
        const updatedTemplate = {
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
    deleteTemplate(id) {
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
    cloneTemplate(id, newName) {
        const template = this.templates.get(id);
        if (!template) {
            return undefined;
        }
        const cloneData = {
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
    exportTemplates(templateIds) {
        let templatesToExport;
        if (templateIds && templateIds.length > 0) {
            templatesToExport = templateIds
                .map(id => this.templates.get(id))
                .filter((t) => t !== undefined);
        }
        else {
            templatesToExport = this.getAllTemplates();
        }
        return JSON.stringify(templatesToExport, null, 2);
    }
    /**
     * Import templates from JSON format
     */
    importTemplates(json) {
        try {
            const templates = JSON.parse(json);
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
                }
                catch (err) {
                    failed++;
                }
            }
            this.saveTemplates();
            return { success, failed };
        }
        catch (err) {
            throw new Error(`Failed to import templates: ${err.message}`);
        }
    }
    /**
     * Add default system templates
     */
    addDefaultTemplates() {
        const now = Date.now();
        const defaultTemplates = [
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
    loadTemplates() {
        const data = this.storage.get(PromptTemplateStorage.STORAGE_KEY, []);
        this.templates = new Map(data.map(t => [t.id, t]));
        // Add default templates if storage is empty
        if (this.templates.size === 0) {
            this.addDefaultTemplates();
        }
    }
    /**
     * Save templates to storage
     */
    saveTemplates() {
        const data = this.getAllTemplates();
        this.storage.update(PromptTemplateStorage.STORAGE_KEY, data);
    }
}
exports.PromptTemplateStorage = PromptTemplateStorage;
//# sourceMappingURL=storage.js.map