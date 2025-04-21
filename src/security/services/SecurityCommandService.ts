import * as vscode from 'vscode';

/**
 * Service for managing security-related VS Code commands
 */
export class SecurityCommandService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {}

    public registerCommand(commandId: string, handler: () => Promise<void>): void {
        const command = vscode.commands.registerCommand(commandId, async () => {
            try {
                await handler();
            } catch (error) {
                vscode.window.showErrorMessage(`Command ${commandId} failed: ${error}`);
            }
        });
        this.disposables.push(command);
    }

    public registerCommandWithArgs<T>(
        commandId: string, 
        handler: (args: T) => Promise<void>
    ): void {
        const command = vscode.commands.registerCommand(commandId, async (args: T) => {
            try {
                await handler(args);
            } catch (error) {
                vscode.window.showErrorMessage(`Command ${commandId} failed: ${error}`);
            }
        });
        this.disposables.push(command);
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}