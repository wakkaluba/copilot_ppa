import * as vscode from 'vscode';
import { ConversationHistory } from '../services/ConversationHistory';
export declare class ConversationHistoryPanel {
    static currentPanel: ConversationHistoryPanel | undefined;
    private readonly _panel;
    private readonly _conversationHistory;
    private _disposables;
    private constructor();
    static render(extensionUri: vscode.Uri, conversationHistory: ConversationHistory): void;
    private _update;
    private _getHtmlForWebview;
    dispose(): void;
}
