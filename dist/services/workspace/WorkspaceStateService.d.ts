import * as vscode from 'vscode';
import { WorkspaceContext, FileContext } from '../types/context';
export declare class WorkspaceStateService implements vscode.Disposable {
    private readonly context;
    private readonly storageKey;
    private workspaceContexts;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    initializeWorkspace(workspaceId: string): Promise<void>;
    getWorkspaceContext(workspaceId: string): Promise<WorkspaceContext>;
    updateWorkspaceContext(workspaceId: string, update: Partial<WorkspaceContext>): Promise<void>;
    updateActiveFile(fileContext: FileContext): Promise<void>;
    clearAllWorkspaces(): Promise<void>;
    private persistWorkspaces;
    dispose(): void;
}
