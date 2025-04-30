import * as vscode from 'vscode';
import { ConversationHistory } from './ConversationHistory';
export declare class AgentResponseEnhancer implements vscode.Disposable {
    private readonly insightService;
    private readonly history;
    constructor(history: ConversationHistory);
    enhanceResponse(userQuery: string, baseResponse: string): Promise<string>;
    private isCodeRelated;
    private isDocumentationRelated;
    private isTestRelated;
    dispose(): void;
}
