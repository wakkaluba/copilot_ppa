import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ConversationHistory } from './ConversationHistory';
import { ServiceContainer } from './ServiceContainer';

export class MemoryManagementService implements vscode.Disposable {
    private readonly onMemoryCleared = new EventEmitter<void>();
    private readonly onChangedFilesReset = new EventEmitter<void>();
    private readonly onCopilotRestarted = new EventEmitter<void>();
    private changedFiles: Set<string> = new Set();

    constructor(
        private readonly history: ConversationHistory,
        private readonly services: ServiceContainer
    ) {}

    async clearMemory(): Promise<void> {
        // Clear conversation history
        await this.history.clearAllConversations();

        // Clear service caches
        await this.services.clearAllCaches();

        // Reset workspace state
        await vscode.workspace.getConfiguration('copilot-ppa').update('lastSession', undefined, true);
        
        this.onMemoryCleared.emit();
    }

    async resetChangedFiles(): Promise<void> {
        this.changedFiles.clear();
        this.onChangedFilesReset.emit();
    }

    async restartCopilot(): Promise<void> {
        // Stop all active services
        await this.services.dispose();

        // Clear memory and caches
        await this.clearMemory();

        // Reinitialize services
        await this.services.initialize();
        
        this.onCopilotRestarted.emit();
    }

    trackChangedFile(filePath: string): void {
        this.changedFiles.add(filePath);
    }

    getChangedFiles(): string[] {
        return Array.from(this.changedFiles);
    }

    dispose(): void {
        this.onMemoryCleared.removeAllListeners();
        this.onChangedFilesReset.removeAllListeners();
        this.onCopilotRestarted.removeAllListeners();
    }
}