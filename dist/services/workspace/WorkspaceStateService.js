"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceStateService = void 0;
class WorkspaceStateService {
    constructor(context) {
        this.context = context;
        this.storageKey = 'contextManager.workspaces';
        this.workspaceContexts = new Map();
    }
    async initialize() {
        const stored = this.context.globalState.get(this.storageKey) || {};
        Object.entries(stored).forEach(([id, context]) => {
            this.workspaceContexts.set(id, context);
        });
    }
    async initializeWorkspace(workspaceId) {
        if (!this.workspaceContexts.has(workspaceId)) {
            const defaultContext = {
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
    async getWorkspaceContext(workspaceId) {
        const context = this.workspaceContexts.get(workspaceId);
        if (!context) {
            throw new Error(`No context found for workspace: ${workspaceId}`);
        }
        return context;
    }
    async updateWorkspaceContext(workspaceId, update) {
        const context = await this.getWorkspaceContext(workspaceId);
        const updated = {
            ...context,
            ...update,
            updatedAt: Date.now()
        };
        this.workspaceContexts.set(workspaceId, updated);
        await this.persistWorkspaces();
    }
    async updateActiveFile(fileContext) {
        for (const [id, context] of this.workspaceContexts) {
            const activeFiles = context.activeFiles.filter(f => f.path !== fileContext.path);
            activeFiles.unshift(fileContext);
            await this.updateWorkspaceContext(id, { activeFiles: activeFiles.slice(0, 10) });
        }
    }
    async clearAllWorkspaces() {
        this.workspaceContexts.clear();
        await this.persistWorkspaces();
    }
    async persistWorkspaces() {
        const data = Object.fromEntries(this.workspaceContexts.entries());
        await this.context.globalState.update(this.storageKey, data);
    }
    dispose() {
        // Cleanup if needed
    }
}
exports.WorkspaceStateService = WorkspaceStateService;
//# sourceMappingURL=WorkspaceStateService.js.map