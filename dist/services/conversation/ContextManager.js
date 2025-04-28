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
exports.ContextManager = void 0;
const vscode = __importStar(require("vscode"));
const ConversationMemoryService_1 = require("./services/ConversationMemoryService");
const UserPreferencesService_1 = require("./services/UserPreferencesService");
const FilePreferencesService_1 = require("./services/FilePreferencesService");
const ContextAnalysisService_1 = require("./services/ContextAnalysisService");
const models_1 = require("./models");
/**
 * Manages contextual information for conversations
 */
class ContextManager {
    /**
     * Get the singleton instance
     */
    static getInstance(context) {
        if (!ContextManager.instance) {
            if (!context) {
                throw new Error('Context required for ContextManager initialization');
            }
            ContextManager.instance = new ContextManager(context);
        }
        return ContextManager.instance;
    }
    /**
     * Create a new ContextManager
     */
    constructor(context) {
        this.activeFiles = new Set();
        this.disposables = [];
        this.context = context;
        this.memoryService = new ConversationMemoryService_1.ConversationMemoryService(context);
        this.userPrefsService = new UserPreferencesService_1.UserPreferencesService(context);
        this.filePrefsService = new FilePreferencesService_1.FilePreferencesService(context);
        this.analysisService = new ContextAnalysisService_1.ContextAnalysisService();
    }
    /**
     * Initialize the context manager and its services
     */
    async initialize() {
        try {
            await Promise.all([
                this.memoryService.initialize(),
                this.userPrefsService.initialize(),
                this.filePrefsService.initialize()
            ]);
            this.trackActiveEditors();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize context manager: ${message}`);
        }
    }
    /**
     * Track currently open editor files
     */
    trackActiveEditors() {
        // Track currently open editors
        if (vscode.window.activeTextEditor) {
            this.trackFile(vscode.window.activeTextEditor.document.fileName);
        }
        // Add listener for editor changes
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.trackFile(editor.document.fileName);
            }
        }));
    }
    /**
     * Track a file being used
     */
    trackFile(filePath) {
        this.activeFiles.add(filePath);
        const extension = this.getFileExtension(filePath);
        if (extension) {
            this.filePrefsService.trackFileExtension(extension);
        }
    }
    /**
     * Extract file extension from path
     */
    getFileExtension(filePath) {
        const matches = filePath.match(/\.([^.]+)$/);
        return matches ? matches[1] : null;
    }
    /**
     * Add a message for context processing
     */
    addMessage(message) {
        if (message.role === models_1.MessageType.User) {
            this.processUserMessage(message);
        }
        else {
            this.processAssistantMessage(message);
        }
    }
    /**
     * Process a user message for context
     */
    processUserMessage(message) {
        this.memoryService.addMessage(message);
        this.analysisService.analyzeMessage(message.content, this.userPrefsService, this.filePrefsService);
    }
    /**
     * Process an assistant message
     */
    processAssistantMessage(message) {
        this.memoryService.addMessage(message);
    }
    /**
     * Get recent conversation history
     */
    getRecentHistory(messageCount = 10) {
        return this.memoryService.getRecentMessages(messageCount);
    }
    /**
     * Get all conversation history
     */
    getAllHistory() {
        return this.memoryService.getMessages();
    }
    /**
     * Clear conversation history
     */
    async clearHistory() {
        await this.memoryService.clearHistory();
    }
    /**
     * Get user preferences
     */
    getUserPreferences(key, defaultValue) {
        return this.userPrefsService.getPreference(key, defaultValue);
    }
    /**
     * Set user preference
     */
    async setUserPreference(key, value) {
        await this.userPrefsService.setPreference(key, value);
    }
    /**
     * Get preferred programming language
     */
    getPreferredLanguage() {
        return this.userPrefsService.getPreferredLanguage();
    }
    /**
     * Get preferred framework
     */
    getPreferredFramework() {
        return this.userPrefsService.getPreferredFramework();
    }
    /**
     * Get frequently used file extensions
     */
    getPreferredFileExtensions(limit = 5) {
        return this.filePrefsService.getMostFrequentExtensions(limit);
    }
    /**
     * Get active files
     */
    getActiveFiles() {
        return Array.from(this.activeFiles);
    }
    /**
     * Get directories the user is working with
     */
    getRecentDirectories(limit = 3) {
        return this.filePrefsService.getRecentDirectories(limit);
    }
    /**
     * Get file naming patterns
     */
    getFileNamingPatterns() {
        return this.filePrefsService.getNamingPatterns();
    }
    /**
     * Build context string for prompting
     */
    buildContextString() {
        return this.analysisService.buildContextString(this.userPrefsService, this.filePrefsService, this.memoryService);
    }
    /**
     * Clear all context data
     */
    async clearContext() {
        try {
            await Promise.all([
                this.memoryService.clearMessages(),
                this.userPrefsService.clearPreferences(),
                this.filePrefsService.clearPreferences()
            ]);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear context data: ${message}`);
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map