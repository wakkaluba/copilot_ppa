import * as vscode from 'vscode';
import { ConversationMessage, IContextManager } from './types';
import { ConversationMemoryService } from './services/ConversationMemoryService';
import { UserPreferencesService } from './services/UserPreferencesService';
import { FilePreferencesService } from './services/FilePreferencesService';
import { ContextAnalysisService } from './services/ContextAnalysisService';

export class ContextManager implements IContextManager {
    private readonly conversationService: ConversationMemoryService;
    private readonly userPreferencesService: UserPreferencesService;
    private readonly filePreferencesService: FilePreferencesService;
    private readonly analysisService: ContextAnalysisService;

    constructor(context: vscode.ExtensionContext) {
        this.conversationService = new ConversationMemoryService(context);
        this.userPreferencesService = new UserPreferencesService(context);
        this.filePreferencesService = new FilePreferencesService(context);
        this.analysisService = new ContextAnalysisService();
    }

    async initialize(): Promise<void> {
        try {
            await Promise.all([
                this.conversationService.initialize(),
                this.userPreferencesService.initialize(),
                this.filePreferencesService.initialize()
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize context manager: ${message}`);
        }
    }

    addMessage(message: ConversationMessage): void {
        this.conversationService.addMessage(message);
        if (message.role === 'user') {
            this.analysisService.analyzeMessage(
                message.content,
                this.userPreferencesService,
                this.filePreferencesService
            );
        }
    }

    getConversationHistory(limit: number = 10): ConversationMessage[] {
        return this.conversationService.getRecentMessages(limit);
    }

    getPreferredLanguage(): string | undefined {
        return this.userPreferencesService.getPreferredLanguage();
    }

    getFrequentLanguages(limit: number = 3): { language: string; count: number }[] {
        return this.userPreferencesService.getFrequentLanguages(limit);
    }

    getPreferredFramework(): string | undefined {
        return this.userPreferencesService.getPreferredFramework();
    }

    getRecentFileExtensions(limit: number = 5): string[] {
        return this.filePreferencesService.getRecentExtensions(limit);
    }

    getRecentDirectories(limit: number = 3): string[] {
        return this.filePreferencesService.getRecentDirectories(limit);
    }

    getFileNamingPatterns(): string[] {
        return this.filePreferencesService.getNamingPatterns();
    }

    buildContextString(): string {
        return this.analysisService.buildContextString(
            this.userPreferencesService,
            this.filePreferencesService,
            this.conversationService
        );
    }

    generateSuggestions(currentInput: string): string[] {
        return this.analysisService.generateSuggestions(
            currentInput,
            this.userPreferencesService,
            this.filePreferencesService
        );
    }

    async clearAllContextData(): Promise<void> {
        try {
            await Promise.all([
                this.conversationService.clearHistory(),
                this.userPreferencesService.clearPreferences(),
                this.filePreferencesService.clearPreferences()
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear context data: ${message}`);
        }
    }

    dispose(): void {
        // Currently no resources to dispose
    }
}