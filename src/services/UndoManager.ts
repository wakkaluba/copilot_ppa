import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';

interface ChangeRecord {
    filePath: string;
    originalContent: string | null;
    timestamp: number;
    type: 'create' | 'modify' | 'delete';
}

export class UndoManager {
    private static instance: UndoManager;
    private workspaceManager: WorkspaceManager;
    private changes: Map<string, ChangeRecord[]> = new Map();
    private maxHistoryPerFile = 10;

    private constructor() {
        this.workspaceManager = WorkspaceManager.getInstance();
    }

    static getInstance(): UndoManager {
        if (!this.instance) {
            this.instance = new UndoManager();
        }
        return this.instance;
    }

    async recordChange(filePath: string, type: 'create' | 'modify' | 'delete'): Promise<void> {
        let originalContent: string | null = null;
        
        if (type !== 'create') {
            try {
                originalContent = await this.workspaceManager.readFile(filePath);
            } catch {
                originalContent = null;
            }
        }

        const record: ChangeRecord = {
            filePath,
            originalContent,
            timestamp: Date.now(),
            type
        };

        const fileHistory = this.changes.get(filePath) || [];
        fileHistory.unshift(record);
        
        // Maintain history limit
        if (fileHistory.length > this.maxHistoryPerFile) {
            fileHistory.pop();
        }

        this.changes.set(filePath, fileHistory);
    }

    async undoLastChange(filePath: string): Promise<boolean> {
        const fileHistory = this.changes.get(filePath);
        if (!fileHistory || fileHistory.length === 0) {
            return false;
        }

        const lastChange = fileHistory[0];
        try {
            switch (lastChange.type) {
                case 'create':
                    await this.workspaceManager.deleteFile(filePath);
                    break;
                case 'modify':
                    if (lastChange.originalContent !== null) {
                        await this.workspaceManager.writeFile(filePath, lastChange.originalContent);
                    }
                    break;
                case 'delete':
                    if (lastChange.originalContent !== null) {
                        await this.workspaceManager.writeFile(filePath, lastChange.originalContent);
                    }
                    break;
            }

            fileHistory.shift();
            if (fileHistory.length === 0) {
                this.changes.delete(filePath);
            }
            return true;
        } catch (error) {
            console.error(`Failed to undo change: ${error}`);
            return false;
        }
    }

    getChangeHistory(filePath: string): ChangeRecord[] {
        return this.changes.get(filePath) || [];
    }

    clearHistory(filePath: string): void {
        this.changes.delete(filePath);
    }
}
