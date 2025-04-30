import * as vscode from 'vscode';
import { ICodeExecutor, ICodeNavigator, ICodeLinker } from './types';
export declare const enum EditorEvents {
    StateChanged = "editorStateChanged",
    ExecutionStarted = "executionStarted",
    ExecutionCompleted = "executionCompleted",
    NavigationStarted = "navigationStarted",
    NavigationCompleted = "navigationCompleted"
}
/**
 * Manages code editing functionality through specialized services
 */
export declare class CodeEditorManager implements ICodeExecutor, ICodeNavigator, ICodeLinker {
    private static instance;
    private readonly executor;
    private readonly navigator;
    private readonly linker;
    private disposables;
    private readonly _onEditorStateChange;
    private metrics;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): CodeEditorManager;
    private initializeMetrics;
    private registerCommands;
    executeSelectedCode(): Promise<void>;
    showCodeOverview(): Promise<void>;
    findReferences(): Promise<void>;
    createCodeLink(): Promise<void>;
    navigateCodeLink(): Promise<void>;
    getMetrics(): Map<string, number>;
    dispose(): void;
}
