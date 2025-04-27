"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const ConversationMemoryService_1 = require("./services/ConversationMemoryService");
const UserPreferencesService_1 = require("./services/UserPreferencesService");
const FilePreferencesService_1 = require("./services/FilePreferencesService");
const ContextAnalysisService_1 = require("./services/ContextAnalysisService");
class ContextManager {
    constructor(context) {
        this.conversationService = new ConversationMemoryService_1.ConversationMemoryService(context);
        this.userPreferencesService = new UserPreferencesService_1.UserPreferencesService(context);
        this.filePreferencesService = new FilePreferencesService_1.FilePreferencesService(context);
        this.analysisService = new ContextAnalysisService_1.ContextAnalysisService();
    }
    async initialize() {
        try {
            await Promise.all([
                this.conversationService.initialize(),
                this.userPreferencesService.initialize(),
                this.filePreferencesService.initialize()
            ]);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize context manager: ${message}`);
        }
    }
    addMessage(message) {
        this.conversationService.addMessage(message);
        if (message.role === 'user') {
            this.analysisService.analyzeMessage(message.content, this.userPreferencesService, this.filePreferencesService);
        }
    }
    getConversationHistory(limit = 10) {
        return this.conversationService.getRecentMessages(limit);
    }
    getPreferredLanguage() {
        return this.userPreferencesService.getPreferredLanguage();
    }
    getFrequentLanguages(limit = 3) {
        return this.userPreferencesService.getFrequentLanguages(limit);
    }
    getPreferredFramework() {
        return this.userPreferencesService.getPreferredFramework();
    }
    getRecentFileExtensions(limit = 5) {
        return this.filePreferencesService.getRecentExtensions(limit);
    }
    getRecentDirectories(limit = 3) {
        return this.filePreferencesService.getRecentDirectories(limit);
    }
    getFileNamingPatterns() {
        return this.filePreferencesService.getNamingPatterns();
    }
    buildContextString() {
        return this.analysisService.buildContextString(this.userPreferencesService, this.filePreferencesService, this.conversationService);
    }
    generateSuggestions(currentInput) {
        return this.analysisService.generateSuggestions(currentInput, this.userPreferencesService, this.filePreferencesService);
    }
    async clearAllContextData() {
        try {
            await Promise.all([
                this.conversationService.clearHistory(),
                this.userPreferencesService.clearPreferences(),
                this.filePreferencesService.clearPreferences()
            ]);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear context data: ${message}`);
        }
    }
    dispose() {
        // Currently no resources to dispose
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map