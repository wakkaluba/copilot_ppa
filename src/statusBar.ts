import * as vscode from 'vscode';
import { IStatusBarService } from './services/interfaces';

export interface StatusBarState {
    mainText: string;
    metricsScore?: number | undefined;
    isWorking: boolean;
    workingMessage?: string | undefined;
    isVisible: boolean;
    isError: boolean;
}

export interface WorkingAnimation extends vscode.Disposable {
    message: string;
    updateMessage(message: string): void;
}

export class StatusBarManager implements vscode.Disposable, IStatusBarService {
    private readonly _mainStatusBarItem: vscode.StatusBarItem;
    private readonly _metricsStatusBarItem: vscode.StatusBarItem;
    private readonly _configListener: vscode.Disposable;
    private _workingAnimation?: NodeJS.Timer | undefined;
    
    private _state: StatusBarState = {
        mainText: '$(copilot) PPA',
        isWorking: false,
        isVisible: true,
        isError: false
    };

    constructor(context: vscode.ExtensionContext) {        
        this._mainStatusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this._mainStatusBarItem.command = 'copilot-ppa.openMenu';
        this._mainStatusBarItem.tooltip = 'Copilot PPA';
        
        this._metricsStatusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            99
        );
        this._metricsStatusBarItem.command = 'copilot-ppa.showMetrics';
        this._metricsStatusBarItem.tooltip = 'PPA Metrics';
        
        // Setup configuration change listener
        this._configListener = vscode.workspace.onDidChangeConfiguration(this.handleConfigChange.bind(this));
        
        context.subscriptions.push(
            this._mainStatusBarItem,
            this._metricsStatusBarItem,
            this._configListener
        );
    }

    async initialize(): Promise<void> {
        try {
            await this.loadInitialState();
            this.updateUI();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to initialize status bar: ${message}`);
            this.setErrorState();
        }
    }

    private async loadInitialState(): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        this._state.isVisible = config.get<boolean>('showStatusBar', true);
        await this.updateUI();
    }

    private async handleConfigChange(event: vscode.ConfigurationChangeEvent): Promise<void> {
        if (event.affectsConfiguration('copilot-ppa.showStatusBar')) {
            const config = vscode.workspace.getConfiguration('copilot-ppa');
            this._state.isVisible = config.get<boolean>('showStatusBar', true);
            await this.updateUI();
        }
    }

    updateMainStatusBar(text?: string): void {
        if (text) {
            this._state.mainText = text;
        }
        this.updateUI();
    }

    updateMetricsStatusBar(perfScore?: number): void {
        this._state.metricsScore = perfScore;
        this.updateUI();
    }

    showWorkingAnimation(message?: string): WorkingAnimation {
        // Clear any existing animation
        this.clearWorkingAnimation();
        
        this._state.isWorking = true;
        this._state.workingMessage = message || 'Analyzing...';
        
        let dots = '.';
        let count = 0;
        
        this._workingAnimation = setInterval(() => {
            const text = `$(sync~spin) ${this._state.workingMessage}${dots}`;
            this._mainStatusBarItem.text = text;
            
            count = (count + 1) % 3;
            dots = '.'.repeat(count + 1);
        }, 500);

        const animation: WorkingAnimation = {
            message: this._state.workingMessage,
            updateMessage: (newMessage: string) => {
                this._state.workingMessage = newMessage;
            },
            dispose: () => {
                this.clearWorkingAnimation();
                this._state.isWorking = false;
                this._state.workingMessage = undefined;
                this.updateUI();
            }
        };

        return animation;
    }

    private clearWorkingAnimation(): void {
        if (this._workingAnimation) {
            clearInterval(this._workingAnimation);
            this._workingAnimation = undefined;
        }
    }

    async setErrorState(): Promise<void> {
        this._state.isError = true;
        this._state.mainText = '$(error) PPA Error';
        this._mainStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.updateUI();
    }

    async clearErrorState(): Promise<void> {
        this._state.isError = false;
        this._state.mainText = '$(copilot) PPA';
        this._mainStatusBarItem.backgroundColor = undefined;
        this.updateUI();
    }

    async show(): Promise<void> {
        this._state.isVisible = true;
        this.updateUI();
    }

    async hide(): Promise<void> {
        this._state.isVisible = false;
        this.updateUI();
    }

    update(message: string): void {
        this.updateMainStatusBar(message);
    }

    private updateUI(): void {
        try {
            // Update main status bar
            this._mainStatusBarItem.text = this._state.mainText;
            
            // Update metrics status bar if score is available
            if (this._state.metricsScore !== undefined) {
                const icon = this.getMetricsIcon(this._state.metricsScore);
                this._metricsStatusBarItem.text = `${icon} ${this._state.metricsScore}`;
                this._metricsStatusBarItem.show();
            } else {
                this._metricsStatusBarItem.hide();
            }
            
            // Update visibility
            if (this._state.isVisible) {
                this._mainStatusBarItem.show();
            } else {
                this._mainStatusBarItem.hide();
                this._metricsStatusBarItem.hide();
            }
        } catch (error) {
            console.error('Error updating status bar UI:', error);
        }
    }

    private getMetricsIcon(score: number): string {
        if (score < 50) {return '$(warning)';}
        if (score < 80) {return '$(info)';}
        return '$(check)';
    }

    dispose(): void {
        this.clearWorkingAnimation();
        this._mainStatusBarItem.dispose();
        this._metricsStatusBarItem.dispose();
        this._configListener.dispose();
    }
}
