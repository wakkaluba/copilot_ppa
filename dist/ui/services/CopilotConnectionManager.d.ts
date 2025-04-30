import * as vscode from 'vscode';
import { CopilotApiService } from '../../services/copilotApi';
import { Logger } from '../../utils/logger';
export declare class CopilotConnectionManager implements vscode.Disposable {
    private readonly copilotApi;
    private readonly logger;
    private isInitialized;
    private retryCount;
    private readonly maxRetries;
    constructor(copilotApi: CopilotApiService, logger: Logger);
    initialize(): Promise<void>;
    reconnect(): Promise<void>;
    isConnected(): boolean;
    wrapError(message: string, error: unknown): Error;
    getErrorMessage(error: unknown): string;
    dispose(): void;
}
