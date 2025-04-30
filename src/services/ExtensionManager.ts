import { EventEmitter } from 'events';
import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

export interface ExtensionState {
    isActive: boolean;
    isPaused: boolean;
    lastError?: string;
}

@injectable()
export class ExtensionManager extends EventEmitter implements vscode.Disposable {
    private static instance: ExtensionManager;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly logger: Logger;
    private currentState: ExtensionState = {
        isActive: false,
        isPaused: false
    };

    private constructor(private readonly context: vscode.ExtensionContext) {
        super();
        this.logger = Logger.getInstance();
        this.initialize();
    }

    public static getInstance(context: vscode.ExtensionContext): ExtensionManager {
        if (!ExtensionManager.instance) {
            ExtensionManager.instance = new ExtensionManager(context);
        }
        return ExtensionManager.instance;
    }

    private initialize(): void {
        // Initialize extension state
        this.currentState.isActive = true;

        // Register state change handler
        const configDisposable = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa')) {
                this.emit('configurationChanged');
            }
        });

        this.disposables.push(configDisposable);
    }

    public getState(): ExtensionState {
        return { ...this.currentState };
    }

    public async pause(): Promise<void> {
        this.currentState.isPaused = true;
        this.emit('stateChanged', this.currentState);
        this.logger.info('Extension paused');
    }

    public async resume(): Promise<void> {
        this.currentState.isPaused = false;
        this.emit('stateChanged', this.currentState);
        this.logger.info('Extension resumed');
    }

    public setError(error: Error | string): void {
        this.currentState.lastError = error instanceof Error ? error.message : error;
        this.emit('error', this.currentState.lastError);
        this.logger.error('Extension error:', this.currentState.lastError);
    }

    public clearError(): void {
        this.currentState.lastError = undefined;
        this.emit('error', null);
    }

    public dispose(): void {
        this.logger.info('Disposing ExtensionManager');
        this.currentState.isActive = false;
        this.disposables.forEach(d => d.dispose());
        this.removeAllListeners();
    }
}
