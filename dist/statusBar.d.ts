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
export declare class StatusBarManager implements vscode.Disposable, IStatusBarService {
    private readonly _mainStatusBarItem;
    private readonly _metricsStatusBarItem;
    private readonly _configListener;
    private _workingAnimation?;
    private _state;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    private loadInitialState;
    private handleConfigChange;
    updateMainStatusBar(text?: string): void;
    updateMetricsStatusBar(perfScore?: number): void;
    showWorkingAnimation(message?: string): WorkingAnimation;
    private clearWorkingAnimation;
    setErrorState(): Promise<void>;
    clearErrorState(): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    update(message: string): void;
    private updateUI;
    private getMetricsIcon;
    dispose(): void;
}
