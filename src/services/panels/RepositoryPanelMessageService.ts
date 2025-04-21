import * as vscode from 'vscode';

type MessageCallback = (...args: any[]) => void;

export class RepositoryPanelMessageService implements vscode.Disposable {
    private readonly _disposables: vscode.Disposable[] = [];
    private readonly _listeners = new Map<string, Set<MessageCallback>>();

    constructor(private readonly webview: vscode.Webview) {
        this._disposables.push(
            webview.onDidReceiveMessage(this.handleMessage.bind(this))
        );
    }

    private async handleMessage(message: any): Promise<void> {
        const { command, ...data } = message;
        const listeners = this._listeners.get(command);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    await listener(data);
                } catch (error) {
                    console.error(`Error handling message ${command}:`, error);
                }
            }
        }
    }

    public onCreateRepository(callback: (
        provider: string,
        name: string,
        description: string,
        isPrivate: boolean
    ) => Promise<void>): void {
        const listeners = this._listeners.get('createRepository') || new Set();
        listeners.add(async (data: any) => {
            try {
                await callback(
                    data.provider,
                    data.name,
                    data.description,
                    data.isPrivate
                );
            } catch (error) {
                console.error('Error in createRepository callback:', error);
                throw error;
            }
        });
        this._listeners.set('createRepository', listeners);
    }

    public onToggleAccess(callback: (enabled: boolean) => void): void {
        const listeners = this._listeners.get('toggleAccess') || new Set();
        listeners.add(async (data: any) => {
            try {
                callback(data.enabled);
            } catch (error) {
                console.error('Error in toggleAccess callback:', error);
                throw error;
            }
        });
        this._listeners.set('toggleAccess', listeners);
    }

    public async postMessage(message: any): Promise<boolean> {
        try {
            return await this.webview.postMessage(message);
        } catch (error) {
            console.error('Error posting message to webview:', error);
            return false;
        }
    }

    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
        this._listeners.clear();
    }
}