import * as vscode from 'vscode';
import { CodeExecutorService } from './services/codeExecutor';
import { CodeNavigatorService } from './services/codeNavigator';
import { CodeLinkerService } from './services/codeLinker';
import { ICodeExecutor, ICodeNavigator, ICodeLinker } from './types';

// Event names for editor state changes
export const enum EditorEvents {
    StateChanged = 'editorStateChanged',
    ExecutionStarted = 'executionStarted',
    ExecutionCompleted = 'executionCompleted',
    NavigationStarted = 'navigationStarted',
    NavigationCompleted = 'navigationCompleted'
}

/**
 * Manages code editing functionality through specialized services
 */
export class CodeEditorManager implements ICodeExecutor, ICodeNavigator, ICodeLinker {
    private static instance: CodeEditorManager;
    private readonly executor: CodeExecutorService;
    private readonly navigator: CodeNavigatorService;
    private readonly linker: CodeLinkerService;
    private disposables: vscode.Disposable[] = [];
    private readonly _onEditorStateChange = new vscode.EventEmitter<void>();
    private metrics: Map<string, number> = new Map();

    private constructor(context: vscode.ExtensionContext) {
        this.executor = new CodeExecutorService();
        this.navigator = new CodeNavigatorService();
        this.linker = new CodeLinkerService();
        this.registerCommands(context);
        this.initializeMetrics();
    }

    public static getInstance(context: vscode.ExtensionContext): CodeEditorManager {
        if (!CodeEditorManager.instance) {
            CodeEditorManager.instance = new CodeEditorManager(context);
        }
        return CodeEditorManager.instance;
    }

    private initializeMetrics(): void {
        this.metrics.set('executions', 0);
        this.metrics.set('navigations', 0);
        this.metrics.set('links', 0);
        this.metrics.set('errors', 0);
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
            this._onEditorStateChange.fire();
            this.metrics.set('executions', (this.metrics.get('executions') || 0) + 1);
            
            await this.executor.executeSelectedCode();
            
            vscode.commands.executeCommand('setContext', 'copilot-ppa:hasActiveExecution', true);
        } catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to execute code: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // ICodeNavigator implementation
    public async showCodeOverview(): Promise<void> {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
            
            await this.navigator.showCodeOverview();
        } catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to show code overview: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async findReferences(): Promise<void> {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
            
            await this.navigator.findReferences();
        } catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to find references: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Reference search failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // ICodeLinker implementation
    public async createCodeLink(): Promise<void> {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('links', (this.metrics.get('links') || 0) + 1);
            
            await this.linker.createCodeLink();
        } catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to create code link: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Link creation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async navigateCodeLink(): Promise<void> {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
            
            await this.linker.navigateCodeLink();
        } catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to navigate code link: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Link navigation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public getMetrics(): Map<string, number> {
        return new Map(this.metrics);
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this._onEditorStateChange.dispose();
        
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
