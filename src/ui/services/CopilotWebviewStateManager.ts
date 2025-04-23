import * as vscode from 'vscode';
import { WebviewState } from '../copilotIntegrationPanel';

export class CopilotWebviewStateManager implements vscode.Disposable {
    private state: WebviewState = {
        isLocalLLMActive: false,
        isCopilotConnected: false,
        messages: []
    };

    private readonly _onStateChanged = new vscode.EventEmitter<void>();
    public readonly onStateChanged = this._onStateChanged.event;

    getState(): WebviewState {
        return { ...this.state };
    }

    async toggleLLMMode(): Promise<void> {
        this.state.isLocalLLMActive = !this.state.isLocalLLMActive;
        this._onStateChanged.fire();
    }

    updateConnectionState(isConnected: boolean): void {
        this.state.isCopilotConnected = isConnected;
        this._onStateChanged.fire();
    }

    addMessage(role: WebviewState['messages'][0]['role'], content: string): void {
        this.state.messages.push({ role, content });
        this._onStateChanged.fire();
    }

    clearMessages(): void {
        this.state.messages = [];
        this._onStateChanged.fire();
    }

    dispose(): void {
        this._onStateChanged.dispose();
    }
}