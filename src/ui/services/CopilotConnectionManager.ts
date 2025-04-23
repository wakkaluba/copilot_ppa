import * as vscode from 'vscode';
import { CopilotApiService } from '../../services/copilotApi';
import { Logger } from '../../utils/logger';

export class CopilotConnectionManager implements vscode.Disposable {
    private isInitialized: boolean = false;
    private retryCount: number = 0;
    private readonly maxRetries: number = 3;

    constructor(
        private readonly copilotApi: CopilotApiService,
        private readonly logger: Logger
    ) {}

    public async initialize(): Promise<void> {
        try {
            this.isInitialized = await this.copilotApi.initialize();
        } catch (error) {
            this.logger.error('Failed to initialize Copilot connection', error);
            this.isInitialized = false;
            throw this.wrapError('Failed to initialize Copilot connection', error);
        }
    }

    public async reconnect(): Promise<void> {
        if (this.retryCount >= this.maxRetries) {
            throw new Error('Max reconnection attempts reached. Please try again later.');
        }

        try {
            this.retryCount++;
            this.isInitialized = await this.copilotApi.initialize();

            if (this.isInitialized) {
                this.retryCount = 0;
            }
        } catch (error) {
            this.logger.error('Reconnection failed', error);
            throw this.wrapError('Failed to reconnect to Copilot', error);
        }
    }

    public isConnected(): boolean {
        return this.isInitialized;
    }

    public wrapError(message: string, error: unknown): Error {
        return new Error(`${message}: ${this.getErrorMessage(error)}`);
    }

    public getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    public dispose(): void {
        this.isInitialized = false;
        this.retryCount = 0;
    }
}