"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
class PromptManager extends events_1.EventEmitter {
    static instance;
    context;
    templates = new Map();
    builtInTemplatesLoaded = false;
    constructor(context) {
        super();
        this.context = context;
    }
    static getInstance(context) {
        if (!PromptManager.instance) {
            if (!context) {
                throw new Error('Context is required when creating PromptManager for the first time');
            }
            PromptManager.instance = new PromptManager(context);
        }
        return PromptManager.instance;
    }
    async initialize() {
        await this.loadTemplates();
    }
    async loadTemplates() {
        try {
            // Load user-defined templates from storage
            const userTemplates = this.context.globalState.get('promptTemplates', []);
            userTemplates.forEach(template => {
                this.templates.set(template.id, template);
            });
            // Load built-in templates if not already loaded
            if (!this.builtInTemplatesLoaded) {
                await this.loadBuiltInTemplates();
                this.builtInTemplatesLoaded = true;
            }
            this.emit('templatesLoaded', this.getAllTemplates());
        }
        catch (error) {
            console.error('Error loading prompt templates:', error);
            throw new Error(`Failed to load templates: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async loadBuiltInTemplates() {
        try {
            const builtInTemplatesPath = path.join(this.context.extensionPath, 'resources', 'templates', 'prompts.json');
            if (fs.existsSync(builtInTemplatesPath)) {
                const templateData = await fs.promises.readFile(builtInTemplatesPath, 'utf-8');
                const builtInTemplates = JSON.parse(templateData);
                builtInTemplates.forEach(template => {
                    // Mark as built-in
                    template.isUserDefined = false;
                    // Don't overwrite user templates with same ID
                    if (!this.templates.has(template.id)) {
                        this.templates.set(template.id, template);
                    }
                });
            }
            else {
                // Default built-in templates if file doesn't exist
                this.addDefaultTemplates();
            }
        }
        catch (error) {
            console.error('Error loading built-in templates:', error);
            this.addDefaultTemplates();
        }
    }
    addDefaultTemplates() {
        const defaultTemplates = [
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
    async saveTemplates() {
        try {
            const userTemplates = Array.from(this.templates.values())
                .filter(template => template.isUserDefined);
            await this.context.globalState.update('promptTemplates', userTemplates);
        }
        catch (error) {
            console.error('Error saving prompt templates:', error);
            throw new Error(`Failed to save templates: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getTemplate(id) {
        return this.templates.get(id);
    }
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => template.category === category);
    }
    getTemplatesByTags(tags) {
        return this.getAllTemplates().filter(template => tags.some(tag => template.tags.includes(tag)));
    }
    async createTemplate(template) {
        const id = `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newTemplate = {
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
    async updateTemplate(id, updates) {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Template with ID ${id} not found`);
        }
        // Don't allow changing the ID or marking built-in as user-defined
        const { id: _, isUserDefined, ...validUpdates } = updates;
        const updatedTemplate = {
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
    async deleteTemplate(id) {
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
    async useTemplate(id, variables = {}) {
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
    async resetUsageStats() {
        for (const template of this.templates.values()) {
            template.usage = 0;
            template.lastUsed = undefined;
        }
        await this.saveTemplates();
        this.emit('statsReset');
    }
    async importTemplates(jsonData) {
        try {
            const templates = JSON.parse(jsonData);
            const importedTemplates = [];
            for (const template of templates) {
                // Generate a new ID to avoid conflicts
                const newId = `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                // Mark as user-defined
                const importedTemplate = {
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
        }
        catch (error) {
            throw new Error(`Failed to import templates: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async exportTemplates(userOnly = false) {
        let templates = this.getAllTemplates();
        if (userOnly) {
            templates = templates.filter(template => template.isUserDefined);
        }
        return JSON.stringify(templates, null, 2);
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map