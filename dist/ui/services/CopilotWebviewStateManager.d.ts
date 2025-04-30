import * as vscode from 'vscode';
import { WebviewState } from '../copilotIntegrationPanel';
export declare class CopilotWebviewStateManager implements vscode.Disposable {
    private state;
    private readonly _onStateChanged;
    readonly onStateChanged: vscode.Event<void>;
    getState(): WebviewState;
    toggleLLMMode(): Promise<void>;
    updateConnectionState(isConnected: boolean): void;
    addMessage(role: WebviewState['messages'][0]['role'], content: string): void;
    clearMessages(): void;
    dispose(): void;
}
