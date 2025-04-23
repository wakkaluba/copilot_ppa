import * as vscode from 'vscode';
import { WorkspaceContext, FileContext } from '../types/context';

export class WorkspaceStateService implements vscode.Disposable {
    private readonly storageKey = 'contextManager.workspaces';
    private workspaceContexts = new Map<string, WorkspaceContext>();

    constructor(private readonly context: vscode.ExtensionContext) {}

    async initialize(): Promise<void> {
        const stored = this.context.globalState.get<Record<string, WorkspaceContext>>(this.storageKey) || {};
        Object.entries(stored).forEach(([id, context]) => {
            this.workspaceContexts.set(id, context);
        });
    }

    async initializeWorkspace(workspaceId: string): Promise<void> {
        if (!this.workspaceContexts.has(workspaceId)) {
            const defaultContext: WorkspaceContext = {
                id: workspaceId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                activeFiles: [],
                preferences: {}
            };
            this.workspaceContexts.set(workspaceId, defaultContext);
            await this.persistWorkspaces();
        }
    }

    async getWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
        const context = this.workspaceContexts.get(workspaceId);
        if (!context) {
            throw new Error(`No context found for workspace: ${workspaceId}`);
        }
        return context;
    }

    async updateWorkspaceContext(workspaceId: string, update: Partial<WorkspaceContext>): Promise<void> {
        const context = await this.getWorkspaceContext(workspaceId);
        const updated = {
            ...context,
            ...update,
            updatedAt: Date.now()
        };
        this.workspaceContexts.set(workspaceId, updated);
        await this.persistWorkspaces();
    }

    async updateActiveFile(fileContext: FileContext): Promise<void> {
        for (const [id, context] of this.workspaceContexts) {
            const activeFiles = context.activeFiles.filter(f => f.path !== fileContext.path);
            activeFiles.unshift(fileContext);
            await this.updateWorkspaceContext(id, { activeFiles: activeFiles.slice(0, 10) });
        }
    }

    async clearAllWorkspaces(): Promise<void> {
        this.workspaceContexts.clear();
        await this.persistWorkspaces();
    }

    private async persistWorkspaces(): Promise<void> {
        const data = Object.fromEntries(this.workspaceContexts.entries());
        await this.context.globalState.update(this.storageKey, data);
    }

    dispose(): void {
        // Cleanup if needed
    }
}
