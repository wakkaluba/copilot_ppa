interface ChangeRecord {
    filePath: string;
    originalContent: string | null;
    timestamp: number;
    type: 'create' | 'modify' | 'delete';
}
export declare class UndoManager {
    private static instance;
    private workspaceManager;
    private changes;
    private maxHistoryPerFile;
    private constructor();
    static getInstance(): UndoManager;
    recordChange(filePath: string, type: 'create' | 'modify' | 'delete'): Promise<void>;
    undoLastChange(filePath: string): Promise<boolean>;
    getChangeHistory(filePath: string): ChangeRecord[];
    clearHistory(filePath: string): void;
}
export {};
