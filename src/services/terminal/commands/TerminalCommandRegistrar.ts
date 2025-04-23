import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../logging/ILogger';
import { TerminalManager } from '../terminalManager';
import { InteractiveShell } from '../interactiveShell';
import { AITerminalHelper } from '../aiTerminalHelper';
import { TerminalConfigurationService } from '../services/TerminalConfigurationService';

@injectable()
export class TerminalCommandRegistrar implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(TerminalManager) private readonly terminalManager: TerminalManager,
        @inject(InteractiveShell) private readonly interactiveShell: InteractiveShell,
        @inject(TerminalConfigurationService) private readonly config: TerminalConfigurationService,
        @inject('AITerminalHelper') private readonly aiHelper: AITerminalHelper | null
    ) {}

    public register(context: vscode.ExtensionContext): void {
        this.registerTerminalCreation(context);
        this.registerCommandExecution(context);
        if (this.aiHelper) {
            this.registerAICommands(context);
        }
    }

    private registerTerminalCreation(context: vscode.ExtensionContext): void {
        // ... similar to original command registration but with error handling ...
    }

    private registerCommandExecution(context: vscode.ExtensionContext): void {
        // ... similar to original command registration but with error handling ...
    }

    private registerAICommands(context: vscode.ExtensionContext): void {
        // ... similar to original command registration but with error handling ...
    }

    public dispose(): void {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
}
