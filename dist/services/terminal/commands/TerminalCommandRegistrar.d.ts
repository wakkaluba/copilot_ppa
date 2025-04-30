import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
import { TerminalManager } from '../terminalManager';
import { InteractiveShell } from '../interactiveShell';
import { AITerminalHelper } from '../aiTerminalHelper';
import { TerminalConfigurationService } from '../services/TerminalConfigurationService';
export declare class TerminalCommandRegistrar implements vscode.Disposable {
    private readonly logger;
    private readonly terminalManager;
    private readonly interactiveShell;
    private readonly config;
    private readonly aiHelper;
    private readonly disposables;
    constructor(logger: ILogger, terminalManager: TerminalManager, interactiveShell: InteractiveShell, config: TerminalConfigurationService, aiHelper: AITerminalHelper | null);
    register(context: vscode.ExtensionContext): void;
    private registerTerminalCreation;
    private registerCommandExecution;
    private registerAICommands;
    dispose(): void;
}
