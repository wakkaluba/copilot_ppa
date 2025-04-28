import * as vscode from 'vscode';
import { ConversationMemoryService } from './services/ConversationMemoryService';
import { UserPreferencesService } from './services/UserPreferencesService';
import { FilePreferencesService } from './services/FilePreferencesService';
import { ContextAnalysisService } from './services/ContextAnalysisService';
import { Message, MessageType } from './models';

/**
 * Manages contextual information for conversations
 */
export class ContextManager {
    private static instance: ContextManager;
    private memoryService: ConversationMemoryService;
    private userPrefsService: UserPreferencesService;
    private filePrefsService: FilePreferencesService;
    private analysisService: ContextAnalysisService;
    private activeFiles: Set<string> = new Set();
    private context: vscode.ExtensionContext;
    private disposables: vscode.Disposable[] = [];

    /**
     * Get the singleton instance
     */
    public static getInstance(context?: vscode.ExtensionContext): ContextManager {
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
    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.memoryService = new ConversationMemoryService(context);
        this.userPrefsService = new UserPreferencesService(context);
        this.filePrefsService = new FilePreferencesService(context);
        this.analysisService = new ContextAnalysisService();
    }

    /**
     * Initialize the context manager and its services
     */
    public async initialize(): Promise<void> {
        try {
            await Promise.all([
                this.memoryService.initialize(),
                this.userPrefsService.initialize(),
                this.filePrefsService.initialize()
            ]);
            this.trackActiveEditors();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize context manager: ${message}`);
        }
    }

    /**
     * Track currently open editor files
     */
    private trackActiveEditors(): void {
        // Track currently open editors
        if (vscode.window.activeTextEditor) {
            this.trackFile(vscode.window.activeTextEditor.document.fileName);
        }

        // Add listener for editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.trackFile(editor.document.fileName);
                }
            })
        );
    }

    /**
     * Track a file being used
     */
    public trackFile(filePath: string): void {
        this.activeFiles.add(filePath);
        
        const extension = this.getFileExtension(filePath);
        if (extension) {
            this.filePrefsService.trackFileExtension(extension);
        }
    }

    /**
     * Extract file extension from path
     */
    private getFileExtension(filePath: string): string | null {
        const matches = filePath.match(/\.([^.]+)$/);
        return matches ? matches[1] : null;
    }

    /**
     * Add a message for context processing
     */
    public addMessage(message: Message): void {
        if (message.role === MessageType.User) {
            this.processUserMessage(message);
        } else {
            this.processAssistantMessage(message);
        }
    }

    /**
     * Process a user message for context
     */
    public processUserMessage(message: Message): void {
        this.memoryService.addMessage(message);
        this.analysisService.analyzeMessage(
            message.content, 
            this.userPrefsService, 
            this.filePrefsService
        );
    }

    /**
     * Process an assistant message
     */
    public processAssistantMessage(message: Message): void {
        this.memoryService.addMessage(message);
    }

    /**
     * Get recent conversation history
     */
    public getRecentHistory(messageCount: number = 10): Message[] {
        return this.memoryService.getRecentMessages(messageCount);
    }

    /**
     * Get all conversation history
     */
    public getAllHistory(): Message[] {
        return this.memoryService.getMessages();
    }

    /**
     * Clear conversation history
     */
    public async clearHistory(): Promise<void> {
        await this.memoryService.clearHistory();
    }

    /**
     * Get user preferences
     */
    public getUserPreferences<T>(key: string, defaultValue?: T): T {
        return this.userPrefsService.getPreference<T>(key, defaultValue);
    }

    /**
     * Set user preference
     */
    public async setUserPreference(key: string, value: any): Promise<void> {
        await this.userPrefsService.setPreference(key, value);
    }

    /**
     * Get preferred programming language
     */
    public getPreferredLanguage(): string | undefined {
        return this.userPrefsService.getPreferredLanguage();
    }

    /**
     * Get preferred framework
     */
    public getPreferredFramework(): string | undefined {
        return this.userPrefsService.getPreferredFramework();
    }

    /**
     * Get frequently used file extensions
     */
    public getPreferredFileExtensions(limit: number = 5): string[] {
        return this.filePrefsService.getMostFrequentExtensions(limit);
    }

    /**
     * Get active files
     */
    public getActiveFiles(): string[] {
        return Array.from(this.activeFiles);
    }

    /**
     * Get directories the user is working with
     */
    public getRecentDirectories(limit: number = 3): string[] {
        return this.filePrefsService.getRecentDirectories(limit);
    }

    /**
     * Get file naming patterns
     */
    public getFileNamingPatterns(): string[] {
        return this.filePrefsService.getNamingPatterns();
    }

    /**
     * Build context string for prompting
     */
    public buildContextString(): string {
        return this.analysisService.buildContextString(
            this.userPrefsService,
            this.filePrefsService,
            this.memoryService
        );
    }

    /**
     * Clear all context data
     */
    public async clearContext(): Promise<void> {
        try {
            await Promise.all([
                this.memoryService.clearMessages(),
                this.userPrefsService.clearPreferences(),
                this.filePrefsService.clearPreferences()
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear context data: ${message}`);
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
    }
}