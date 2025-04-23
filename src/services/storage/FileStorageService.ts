import * as vscode from 'vscode';
import { ContextData } from '../types/context';

export class FileStorageService implements vscode.Disposable {
    private readonly storageKey = 'contextManager.contexts';
    
    constructor(private readonly context: vscode.ExtensionContext) {}

    async initialize(): Promise<void> {
        // Initialize storage if needed
    }

    async loadContext(id: string): Promise<ContextData | undefined> {
        const contexts = await this.loadAllContexts();
        return contexts.find(c => c.id === id)?.data;
    }

    async saveContext(id: string, data: ContextData): Promise<void> {
        const contexts = await this.loadAllContexts();
        const index = contexts.findIndex(c => c.id === id);
        
        if (index >= 0) {
            contexts[index] = { id, data };
        } else {
            contexts.push({ id, data });
        }
        
        await this.context.globalState.update(this.storageKey, contexts);
    }

    async loadAllContexts(): Promise<Array<{ id: string; data: ContextData }>> {
        return this.context.globalState.get<Array<{ id: string; data: ContextData }>>(this.storageKey) || [];
    }

    async deleteContext(id: string): Promise<void> {
        const contexts = await this.loadAllContexts();
        const filtered = contexts.filter(c => c.id !== id);
        await this.context.globalState.update(this.storageKey, filtered);
    }

    async clearAllContexts(): Promise<void> {
        await this.context.globalState.update(this.storageKey, []);
    }

    dispose(): void {
        // Cleanup if needed
    }
}
