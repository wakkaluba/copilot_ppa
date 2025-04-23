import * as vscode from 'vscode';
import { injectable } from 'inversify';
import { ILogger } from '../../logging/ILogger';
import { CommandResult, TerminalShellType } from '../types';
import { CommandExecutionError } from '../errors/CommandExecutionError';

@injectable()
export class CommandExecutionService {
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject('OutputChannel') private readonly outputChannel: vscode.OutputChannel
    ) {}

    async executeCommand(
        command: string,
        terminal: vscode.Terminal
    ): Promise<void> {
        try {
            this.logger.debug(`Executing command: ${command}`);
            terminal.sendText(command);
        } catch (error) {
            this.logger.error('Command execution failed:', error);
            throw new CommandExecutionError(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async executeWithOutput(
        command: string,
        shellType: TerminalShellType
    ): Promise<CommandResult> {
        try {
            // Implementation would depend on how you want to capture output
            // Could use Node's child_process, VS Code's task API, etc.
            this.logger.debug(`Executing command with output: ${command}`);
            
            // Placeholder implementation
            return {
                stdout: '',
                stderr: '',
                exitCode: 0,
                success: true
            };
        } catch (error) {
            this.logger.error('Command execution with output failed:', error);
            throw new CommandExecutionError(`Failed to execute command with output: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
