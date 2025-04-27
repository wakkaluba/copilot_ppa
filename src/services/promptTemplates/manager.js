"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateManager = void 0;
exports.initializePromptTemplateManager = initializePromptTemplateManager;
exports.getPromptTemplateManager = getPromptTemplateManager;
var vscode = require("vscode");
var storage_1 = require("./storage");
/**
 * Service for managing prompt templates
 */
var PromptTemplateManager = /** @class */ (function () {
    function PromptTemplateManager(context) {
        this.storage = new storage_1.PromptTemplateStorage(context);
    }
    /**
     * Get all available templates
     */
    PromptTemplateManager.prototype.getAllTemplates = function () {
        return this.storage.getAllTemplates();
    };
    /**
     * Get all available categories
     */
    PromptTemplateManager.prototype.getAllCategories = function () {
        var templates = this.getAllTemplates();
        var categories = new Set(templates.map(function (t) { return t.category; }));
        return Array.from(categories).sort();
    };
    /**
     * Get all available tags
     */
    PromptTemplateManager.prototype.getAllTags = function () {
        var templates = this.getAllTemplates();
        var tags = new Set(templates.flatMap(function (t) { return t.tags; }));
        return Array.from(tags).sort();
    };
    /**
     * Get templates by category
     */
    PromptTemplateManager.prototype.getTemplatesByCategory = function (category) {
        return this.storage.getTemplatesByCategory(category);
    };
    /**
     * Get templates by tag
     */
    PromptTemplateManager.prototype.getTemplatesByTag = function (tag) {
        return this.storage.getTemplatesByTag(tag);
    };
    /**
     * Get a template by ID
     */
    PromptTemplateManager.prototype.getTemplate = function (id) {
        return this.storage.getTemplate(id);
    };
    /**
     * Create a new template
     */
    PromptTemplateManager.prototype.createTemplate = function (template) {
        return this.storage.createTemplate(template);
    };
    /**
     * Update an existing template
     */
    PromptTemplateManager.prototype.updateTemplate = function (id, updates) {
        return this.storage.updateTemplate(id, updates);
    };
    /**
     * Delete a template
     */
    PromptTemplateManager.prototype.deleteTemplate = function (id) {
        return this.storage.deleteTemplate(id);
    };
    /**
     * Clone a template
     */
    PromptTemplateManager.prototype.cloneTemplate = function (id, newName) {
        return this.storage.cloneTemplate(id, newName);
    };
    /**
     * Export templates to JSON
     */
    PromptTemplateManager.prototype.exportTemplates = function (templateIds) {
        return this.storage.exportTemplates(templateIds);
    };
    /**
     * Import templates from JSON
     */
    PromptTemplateManager.prototype.importTemplates = function (json) {
        return this.storage.importTemplates(json);
    };
    /**
     * Apply a template to the current editor selection
     */
    PromptTemplateManager.prototype.applyTemplate = function (templateId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, editor, selection, selectedText, language, formattedPrompt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.getTemplate(templateId);
                        if (!template) {
                            vscode.window.showErrorMessage("Template not found: ".concat(templateId));
                            return [2 /*return*/, false];
                        }
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showInformationMessage('No active editor found');
                            return [2 /*return*/, false];
                        }
                        selection = editor.selection;
                        selectedText = editor.document.getText(selection);
                        language = editor.document.languageId;
                        formattedPrompt = template.content
                            .replace(/\{\{selection\}\}/g, selectedText)
                            .replace(/\{\{language\}\}/g, language);
                        // Additional variables could be added here
                        // Send to agent chat or command palette
                        // This will depend on your agent implementation
                        // For now, we'll just copy to clipboard
                        return [4 /*yield*/, vscode.env.clipboard.writeText(formattedPrompt)];
                    case 1:
                        // Additional variables could be added here
                        // Send to agent chat or command palette
                        // This will depend on your agent implementation
                        // For now, we'll just copy to clipboard
                        _a.sent();
                        vscode.window.showInformationMessage("Template \"".concat(template.name, "\" applied! The prompt has been copied to clipboard."));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return PromptTemplateManager;
}());
exports.PromptTemplateManager = PromptTemplateManager;
// Singleton instance
var promptTemplateManager;
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
