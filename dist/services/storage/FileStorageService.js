"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
class FileStorageService {
    context;
    storageKey = 'contextManager.contexts';
    constructor(context) {
        this.context = context;
    }
    async initialize() {
        // Initialize storage if needed
    }
    async loadContext(id) {
        const contexts = await this.loadAllContexts();
        return contexts.find(c => c.id === id)?.data;
    }
    async saveContext(id, data) {
        const contexts = await this.loadAllContexts();
        const index = contexts.findIndex(c => c.id === id);
        if (index >= 0) {
            contexts[index] = { id, data };
        }
        else {
            contexts.push({ id, data });
        }
        await this.context.globalState.update(this.storageKey, contexts);
    }
    async loadAllContexts() {
        return this.context.globalState.get(this.storageKey) || [];
    }
    async deleteContext(id) {
        const contexts = await this.loadAllContexts();
        const filtered = contexts.filter(c => c.id !== id);
        await this.context.globalState.update(this.storageKey, filtered);
    }
    async clearAllContexts() {
        await this.context.globalState.update(this.storageKey, []);
    }
    dispose() {
        // Cleanup if needed
    }
}
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=FileStorageService.js.map