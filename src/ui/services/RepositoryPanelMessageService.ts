import * as vscode from 'vscode';

/**
 * Base interface for all webview messages
 */
interface IBaseWebviewMessage {
    command: string;
    [key: string]: unknown;
}

/**
 * Interface for repository creation message
 */
interface ICreateRepositoryMessage extends IBaseWebviewMessage {
    command: 'createRepository';
    provider: string;
    name: string;
    description: string;
    isPrivate: boolean;
}

/**
 * Interface for access toggle message
 */
interface IToggleAccessMessage extends IBaseWebviewMessage {
    command: 'toggleAccess';
    enabled: boolean;
}

/**
 * Union type for all supported message types
 */
type WebviewMessage = ICreateRepositoryMessage | IToggleAccessMessage | IBaseWebviewMessage;

type MessageCallback = (data: Record<string, unknown>) => Promise<void> | void;

export class RepositoryPanelMessageService implements vscode.Disposable {
    private readonly _disposables: vscode.Disposable[] = [];
    private readonly _listeners = new Map<string, Set<MessageCallback>>();

    constructor(
        private readonly webview: vscode.Webview
    ) {
        this._disposables.push(
            webview.onDidReceiveMessage(this.handleMessage.bind(this))
        );
    }

    private async handleMessage(message: WebviewMessage): Promise<void> {
        const { command, ...data } = message;
        const listeners = this._listeners.get(command);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    await listener(data as Record<string, unknown>);
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
        listeners.add(async (data: Record<string, unknown>) => {
            try {
                await callback(
                    data.provider as string,
                    data.name as string,
                    data.description as string,
                    data.isPrivate as boolean
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
        listeners.add((data: Record<string, unknown>) => {
            try {
                callback(data.enabled as boolean);
            } catch (error) {
                console.error('Error in toggleAccess callback:', error);
                throw error;
            }
        });
        this._listeners.set('toggleAccess', listeners);
    }

    public async postMessage(message: Record<string, unknown>): Promise<boolean> {
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