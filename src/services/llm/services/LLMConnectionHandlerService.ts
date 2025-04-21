import { EventEmitter } from 'events';
import { ConnectionState, LLMConnectionOptions, ConnectionStatus, ILLMConnectionProvider } from '../types';
import { LLMProvider } from '../../../llm/llm-provider';
import { LLMConnectionError, LLMConnectionErrorCode } from '../errors';

export class LLMConnectionHandlerService extends EventEmitter {
    private _currentState: ConnectionState = ConnectionState.DISCONNECTED;
    private _activeProvider: LLMProvider | null = null;
    private _activeConnection: ILLMConnectionProvider | null = null;
    private _lastError: Error | undefined;
    private readonly options: LLMConnectionOptions;

    constructor(options: Partial<LLMConnectionOptions> = {}) {
        super();
        this.options = {
            maxRetries: options.maxRetries || 3,
            initialRetryDelay: options.initialRetryDelay || 1000,
            maxRetryDelay: options.maxRetryDelay || 30000,
            retryBackoffFactor: options.retryBackoffFactor || 2,
            connectionTimeout: options.connectionTimeout || 30000,
            reconnectOnError: options.reconnectOnError ?? true,
            healthCheckInterval: options.healthCheckInterval || 30000
        };
    }

    public get currentState(): ConnectionState {
        return this._currentState;
    }

    public get activeProvider(): LLMProvider | null {
        return this._activeProvider;
    }

    public get activeProviderName(): string | undefined {
        return this._activeProvider?.name;
    }

    public get lastError(): Error | undefined {
        return this._lastError;
    }

    public async setActiveProvider(provider: LLMProvider): Promise<void> {
        if (this._activeConnection) {
            await this.disconnect();
        }
        this._activeProvider = provider;
        this._currentState = ConnectionState.DISCONNECTED;
        this.emit('providerChanged', provider);
    }

    public async connect(connection: ILLMConnectionProvider): Promise<void> {
        if (!this._activeProvider) {
            throw new LLMConnectionError(
                LLMConnectionErrorCode.ProviderNotFound,
                'No active provider set'
            );
        }

        try {
            this._currentState = ConnectionState.CONNECTING;
            this.emit('stateChanged', this._currentState);

            await connection.connect({
                ...this.options,
                provider: this._activeProvider
            });

            this._activeConnection = connection;
            this._currentState = ConnectionState.CONNECTED;
            this._lastError = undefined;
            
            this.emit('connected', await this.getConnectionStatus());
            this.emit('stateChanged', this._currentState);
        } catch (error) {
            this._lastError = error instanceof Error ? error : new Error(String(error));
            this._currentState = ConnectionState.ERROR;
            this.emit('error', this._lastError);
            this.emit('stateChanged', this._currentState);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this._activeConnection) {
            try {
                await this._activeConnection.disconnect();
            } catch (error) {
                console.error('Error disconnecting:', error);
            }
            this._activeConnection = null;
        }

        this._currentState = ConnectionState.DISCONNECTED;
        this.emit('disconnected');
        this.emit('stateChanged', this._currentState);
    }

    private async getConnectionStatus(): Promise<ConnectionStatus> {
        return {
            state: this._currentState,
            provider: this._activeProvider?.name || 'unknown',
            modelInfo: this._activeConnection ? await this._activeConnection.getModelInfo() : undefined,
            error: this._lastError?.message
        };
    }

    public dispose(): void {
        this.disconnect().catch(console.error);
        this.removeAllListeners();
    }
}