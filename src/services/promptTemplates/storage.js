"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateStorage = void 0;
var uuid_1 = require("uuid");
/**
 * Service for storing and retrieving prompt templates
 */
var PromptTemplateStorage = /** @class */ (function () {
    function PromptTemplateStorage(context) {
        this.templates = new Map();
        // Use global state for templates to persist across workspaces
        this.storage = context.globalState;
        this.loadTemplates();
    }
    /**
     * Get all stored templates
     */
    PromptTemplateStorage.prototype.getAllTemplates = function () {
        return Array.from(this.templates.values());
    };
    /**
     * Get templates by category
     */
    PromptTemplateStorage.prototype.getTemplatesByCategory = function (category) {
        return this.getAllTemplates().filter(function (t) { return t.category === category; });
    };
    /**
     * Get templates by tag
     */
    PromptTemplateStorage.prototype.getTemplatesByTag = function (tag) {
        return this.getAllTemplates().filter(function (t) { return t.tags.includes(tag); });
    };
    /**
     * Get a template by ID
     */
    PromptTemplateStorage.prototype.getTemplate = function (id) {
        return this.templates.get(id);
    };
    /**
     * Create a new template
     */
    PromptTemplateStorage.prototype.createTemplate = function (template) {
        var now = Date.now();
        var newTemplate = __assign(__assign({}, template), { id: (0, uuid_1.v4)(), createdAt: now, modifiedAt: now });
        this.templates.set(newTemplate.id, newTemplate);
        this.saveTemplates();
        return newTemplate;
    };
    /**
     * Update an existing template
     */
    PromptTemplateStorage.prototype.updateTemplate = function (id, updates) {
        var template = this.templates.get(id);
        if (!template) {
            return undefined;
        }
        // Don't allow modification of system templates
        if (template.isSystem) {
            throw new Error('System templates cannot be modified');
        }
        var updatedTemplate = __assign(__assign(__assign({}, template), updates), { modifiedAt: Date.now() });
        this.templates.set(id, updatedTemplate);
        this.saveTemplates();
        return updatedTemplate;
    };
    /**
     * Delete a template
     */
    PromptTemplateStorage.prototype.deleteTemplate = function (id) {
        var template = this.templates.get(id);
        if (!template) {
            return false;
        }
        // Don't allow deletion of system templates
        if (template.isSystem) {
            throw new Error('System templates cannot be deleted');
        }
        var success = this.templates.delete(id);
        if (success) {
            this.saveTemplates();
        }
        return success;
    };
    /**
     * Clone a template (creates a copy that can be modified)
     */
    PromptTemplateStorage.prototype.cloneTemplate = function (id, newName) {
        var template = this.templates.get(id);
        if (!template) {
            return undefined;
        }
        var cloneData = {
            name: newName || "".concat(template.name, " (Copy)"),
            content: template.content,
            description: template.description,
            category: template.category,
            tags: __spreadArray([], template.tags, true)
        };
        return this.createTemplate(cloneData);
    };
    /**
     * Export templates to JSON format
     */
    PromptTemplateStorage.prototype.exportTemplates = function (templateIds) {
        var _this = this;
        var templatesToExport;
        if (templateIds && templateIds.length > 0) {
            templatesToExport = templateIds
                .map(function (id) { return _this.templates.get(id); })
                .filter(function (t) { return t !== undefined; });
        }
        else {
            templatesToExport = this.getAllTemplates();
        }
        return JSON.stringify(templatesToExport, null, 2);
    };
    /**
     * Import templates from JSON format
     */
    PromptTemplateStorage.prototype.importTemplates = function (json) {
        try {
            var templates = JSON.parse(json);
            var success = 0;
            var failed = 0;
            if (!Array.isArray(templates)) {
                throw new Error('Invalid template format: expected an array');
            }
            for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
                var template = templates_1[_i];
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
            return { success: success, failed: failed };
        }
        catch (err) {
            throw new Error("Failed to import templates: ".concat(err.message));
        }
    };
    /**
     * Add default system templates
     */
    PromptTemplateStorage.prototype.addDefaultTemplates = function () {
        var now = Date.now();
        var defaultTemplates = [
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
        for (var _i = 0, defaultTemplates_1 = defaultTemplates; _i < defaultTemplates_1.length; _i++) {
            var template = defaultTemplates_1[_i];
            if (!this.templates.has(template.id)) {
                this.templates.set(template.id, template);
            }
        }
        this.saveTemplates();
    };
    /**
     * Load templates from storage
     */
    PromptTemplateStorage.prototype.loadTemplates = function () {
        var data = this.storage.get(PromptTemplateStorage.STORAGE_KEY, []);
        this.templates = new Map(data.map(function (t) { return [t.id, t]; }));
        // Add default templates if storage is empty
        if (this.templates.size === 0) {
            this.addDefaultTemplates();
        }
    };
    /**
     * Save templates to storage
     */
    PromptTemplateStorage.prototype.saveTemplates = function () {
        var data = this.getAllTemplates();
        this.storage.update(PromptTemplateStorage.STORAGE_KEY, data);
    };
    PromptTemplateStorage.STORAGE_KEY = 'promptTemplates';
    return PromptTemplateStorage;
}());
exports.PromptTemplateStorage = PromptTemplateStorage;
