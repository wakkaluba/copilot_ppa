import * as vscode from 'vscode';
import { ContextData } from '../types/context';
export declare class FileStorageService implements vscode.Disposable {
    private readonly context;
    private readonly storageKey;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    loadContext(id: string): Promise<ContextData | undefined>;
    saveContext(id: string, data: ContextData): Promise<void>;
    loadAllContexts(): Promise<Array<{
        id: string;
        data: ContextData;
    }>>;
    deleteContext(id: string): Promise<void>;
    clearAllContexts(): Promise<void>;
    dispose(): void;
}
