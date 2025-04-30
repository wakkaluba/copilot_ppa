import * as vscode from 'vscode';
import { ConversationHistory } from './ConversationHistory';
import { ServiceContainer } from './ServiceContainer';
export declare class MemoryManagementService implements vscode.Disposable {
    private readonly history;
    private readonly services;
    private readonly onMemoryCleared;
    private readonly onChangedFilesReset;
    private readonly onCopilotRestarted;
    private changedFiles;
    constructor(history: ConversationHistory, services: ServiceContainer);
    clearMemory(): Promise<void>;
    resetChangedFiles(): Promise<void>;
    restartCopilot(): Promise<void>;
    trackChangedFile(filePath: string): void;
    getChangedFiles(): string[];
    dispose(): void;
}
