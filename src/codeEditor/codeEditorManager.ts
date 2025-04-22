import * as vscode from 'vscode';
import { CodeExecutorService } from './services/codeExecutor';
import { CodeNavigatorService } from './services/codeNavigator';
import { CodeLinkerService } from './services/codeLinker';
import { ICodeExecutor, ICodeNavigator, ICodeLinker } from './types';

/**
 * Manages code editing functionality through specialized services
 */
export class CodeEditorManager implements ICodeExecutor, ICodeNavigator, ICodeLinker {
    private readonly executor: CodeExecutorService;
    private readonly navigator: CodeNavigatorService;
    private readonly linker: CodeLinkerService;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.executor = new CodeExecutorService();
        this.navigator = new CodeNavigatorService();
        this.linker = new CodeLinkerService();
        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        this.disposables.push(
            vscode.commands.registerCommand('copilot-ppa.executeCode', () => this.executeSelectedCode()),
            vscode.commands.registerCommand('copilot-ppa.showOverview', () => this.showCodeOverview()),
            vscode.commands.registerCommand('copilot-ppa.findReferences', () => this.findReferences()),
            vscode.commands.registerCommand('copilot-ppa.createLink', () => this.createCodeLink()),
            vscode.commands.registerCommand('copilot-ppa.navigateLink', () => this.navigateCodeLink())
        );

        context.subscriptions.push(...this.disposables);
    }

    // ICodeExecutor implementation
    public async executeSelectedCode(): Promise<void> {
        try {
            await this.executor.executeSelectedCode();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // ICodeNavigator implementation
    public async showCodeOverview(): Promise<void> {
        try {
            await this.navigator.showCodeOverview();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to show code overview: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async findReferences(): Promise<void> {
        try {
            await this.navigator.findReferences();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to find references: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // ICodeLinker implementation
    public async createCodeLink(): Promise<void> {
        try {
            await this.linker.createCodeLink();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create code link: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async navigateCodeLink(): Promise<void> {
        try {
            await this.linker.navigateCodeLink();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to navigate code link: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        
        // Dispose services
        if (this.executor instanceof vscode.Disposable) {
            this.executor.dispose();
        }
        if (this.navigator instanceof vscode.Disposable) {
            this.navigator.dispose();
        }
        if (this.linker instanceof vscode.Disposable) {
            this.linker.dispose();
        }
    }
}
