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
exports.PromptTemplateManager = void 0;
exports.initializePromptTemplateManager = initializePromptTemplateManager;
exports.getPromptTemplateManager = getPromptTemplateManager;
const vscode = __importStar(require("vscode"));
const storage_1 = require("./storage");
/**
 * Service for managing prompt templates
 */
class PromptTemplateManager {
    constructor(context) {
        this.storage = new storage_1.PromptTemplateStorage(context);
    }
    /**
     * Get all available templates
     */
    getAllTemplates() {
        return this.storage.getAllTemplates();
    }
    /**
     * Get all available categories
     */
    getAllCategories() {
        const templates = this.getAllTemplates();
        const categories = new Set(templates.map(t => t.category));
        return Array.from(categories).sort();
    }
    /**
     * Get all available tags
     */
    getAllTags() {
        const templates = this.getAllTemplates();
        const tags = new Set(templates.flatMap(t => t.tags));
        return Array.from(tags).sort();
    }
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return this.storage.getTemplatesByCategory(category);
    }
    /**
     * Get templates by tag
     */
    getTemplatesByTag(tag) {
        return this.storage.getTemplatesByTag(tag);
    }
    /**
     * Get a template by ID
     */
    getTemplate(id) {
        return this.storage.getTemplate(id);
    }
    /**
     * Create a new template
     */
    createTemplate(template) {
        return this.storage.createTemplate(template);
    }
    /**
     * Update an existing template
     */
    updateTemplate(id, updates) {
        return this.storage.updateTemplate(id, updates);
    }
    /**
     * Delete a template
     */
    deleteTemplate(id) {
        return this.storage.deleteTemplate(id);
    }
    /**
     * Clone a template
     */
    cloneTemplate(id, newName) {
        return this.storage.cloneTemplate(id, newName);
    }
    /**
     * Export templates to JSON
     */
    exportTemplates(templateIds) {
        return this.storage.exportTemplates(templateIds);
    }
    /**
     * Import templates from JSON
     */
    importTemplates(json) {
        return this.storage.importTemplates(json);
    }
    /**
     * Apply a template to the current editor selection
     */
    async applyTemplate(templateId) {
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
exports.PromptTemplateManager = PromptTemplateManager;
// Singleton instance
let promptTemplateManager;
/**
 * Initialize the prompt template manager
 */
function initializePromptTemplateManager(context) {
    promptTemplateManager = new PromptTemplateManager(context);
    return promptTemplateManager;
}
/**
 * Get the prompt template manager instance
 */
function getPromptTemplateManager() {
    if (!promptTemplateManager) {
        throw new Error('Prompt Template Manager not initialized');
    }
    return promptTemplateManager;
}
//# sourceMappingURL=manager.js.map