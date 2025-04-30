import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
import { CommandResult, TerminalShellType } from '../types';
export declare class CommandExecutionService {
    private readonly logger;
    private readonly outputChannel;
    constructor(logger: ILogger, outputChannel: vscode.OutputChannel);
    executeCommand(command: string, terminal: vscode.Terminal): Promise<void>;
    executeWithOutput(command: string, shellType: TerminalShellType): Promise<CommandResult>;
}
