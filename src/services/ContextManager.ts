import * as vscode from 'vscode';
import { ConversationService } from './conversation/ConversationService';
import { FileStorageService } from './storage/FileStorageService';
import { WorkspaceStateService } from './workspace/WorkspaceStateService';
import { 
    ContextData, 
    WorkspaceContext, 
    ContextOptions,
    ContextMetadata 
} from './types/context';

/**
 * Manages context across the application with proper state management and persistence
 */
export class ContextManager implements vscode.Disposable {
    private static instance: ContextManager;
    private readonly conversationService: ConversationService;
    private readonly fileStorage: FileStorageService;
    private readonly workspaceState: WorkspaceStateService;
    private readonly contextCache = new Map<string, ContextData>();
    private readonly eventEmitter = new vscode.EventEmitter<ContextData>();

    public readonly onDidChangeContext = this.eventEmitter.event;

    private constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly options: ContextOptions = {}
    ) {
        this.conversationService = new ConversationService(context);
        this.fileStorage = new FileStorageService(context);
        this.workspaceState = new WorkspaceStateService(context);
        this.setupEventHandlers();
    }

    static getInstance(context?: vscode.ExtensionContext, options?: ContextOptions): ContextManager {
        if (!ContextManager.instance && context) {
            ContextManager.instance = new ContextManager(context, options);
        }
        return ContextManager.instance;
    }

    private setupEventHandlers(): void {
        vscode.workspace.onDidChangeWorkspaceFolders(() => this.handleWorkspaceChange());
        vscode.window.onDidChangeActiveTextEditor(() => this.handleActiveFileChange());
    }

    async initialize(): Promise<void> {
        try {
            await Promise.all([
                this.conversationService.initialize(),
                this.fileStorage.initialize(),
                this.workspaceState.initialize()
            ]);
            await this.loadPersistedContext();
        } catch (error) {
            console.error('Failed to initialize ContextManager:', error);
            throw new Error('Context initialization failed');
        }
    }

    async getContext(id: string): Promise<ContextData | undefined> {
        if (!this.contextCache.has(id)) {
            const persisted = await this.fileStorage.loadContext(id);
            if (persisted) {
                this.contextCache.set(id, persisted);
            }
        }
        return this.contextCache.get(id);
    }

    async updateContext(id: string, data: Partial<ContextData>): Promise<void> {
        const existing = await this.getContext(id) || {};
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        this.contextCache.set(id, updated);
        await this.fileStorage.saveContext(id, updated);
        this.eventEmitter.fire(updated);
    }

    async getWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
        return this.workspaceState.getWorkspaceContext(workspaceId);
    }

    async updateWorkspaceContext(workspaceId: string, context: Partial<WorkspaceContext>): Promise<void> {
        await this.workspaceState.updateWorkspaceContext(workspaceId, context);
    }

    private async handleWorkspaceChange(): Promise<void> {
        const workspaces = vscode.workspace.workspaceFolders || [];
        await Promise.all(
            workspaces.map(workspace => 
                this.workspaceState.initializeWorkspace(workspace.uri.toString())
            )
        );
    }

    private async handleActiveFileChange(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fileContext = {
                path: editor.document.uri.toString(),
                language: editor.document.languageId,
                lastAccessed: Date.now()
            };
            await this.workspaceState.updateActiveFile(fileContext);
        }
    }

    private async loadPersistedContext(): Promise<void> {
        const contexts = await this.fileStorage.loadAllContexts();
        contexts.forEach(({ id, data }) => this.contextCache.set(id, data));
    }

    async getAllContextMetadata(): Promise<ContextMetadata[]> {
        return Array.from(this.contextCache.entries()).map(([id, data]) => ({
            id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            type: data.type
        }));
    }

    async clearContext(id: string): Promise<void> {
        this.contextCache.delete(id);
        await this.fileStorage.deleteContext(id);
    }

    async clearAllContexts(): Promise<void> {
        this.contextCache.clear();
        await this.fileStorage.clearAllContexts();
        await this.workspaceState.clearAllWorkspaces();
    }

    dispose(): void {
        this.eventEmitter.dispose();
        this.conversationService.dispose();
        this.fileStorage.dispose();
        this.workspaceState.dispose();
    }
}
