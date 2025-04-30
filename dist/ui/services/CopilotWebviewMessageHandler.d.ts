import * as vscode from 'vscode';
import { WebviewMessage } from '../copilotIntegrationPanel';
import { CopilotWebviewStateManager } from './CopilotWebviewStateManager';
import { CopilotConnectionManager } from './CopilotConnectionManager';
import { Logger } from '../../utils/logger';
export declare class CopilotWebviewMessageHandler implements vscode.Disposable {
    private readonly stateManager;
    private readonly connectionManager;
    private readonly logger;
    constructor(stateManager: CopilotWebviewStateManager, connectionManager: CopilotConnectionManager, logger: Logger);
    handleMessage(message: WebviewMessage): Promise<any>;
    private handleMessageSend;
    dispose(): void;
}
