import * as vscode from 'vscode';
import { TerminalManager } from './terminalManager';
import { InteractiveShell } from './interactiveShell';
import { AITerminalHelper } from './aiTerminalHelper';
import { ILogger } from '../logging/ILogger';
export * from './types';
export * from './terminalManager';
export * from './interactiveShell';
export * from './aiTerminalHelper';
export declare class TerminalModule implements vscode.Disposable {
    private readonly logger;
    private readonly context;
    private readonly disposables;
    private container;
    constructor(logger: ILogger, context: vscode.ExtensionContext);
    private configureContainer;
    private registerDisposables;
    setLLMManager(llmManager: any): void;
    initialize(): void;
    getTerminalManager(): TerminalManager;
    getInteractiveShell(): InteractiveShell;
    getAIHelper(): AITerminalHelper | null;
    dispose(): void;
}
