import { EventEmitter } from 'events';
import { Logger } from '../../../utils/logger';
import { LLMProvider } from '../../llm/llm-provider';
import { LLMConnectionError } from '../errors';
import {
  ConnectionState,
  ConnectionStatus,
  ILLMConnectionProvider,
  LLMConnectionOptions,
} from '../types';

/**
 * Handles LLM provider connection lifecycle with structured error handling and logging.
 */
export class LLMConnectionHandlerService extends EventEmitter {
  private _currentState: ConnectionState = ConnectionState.DISCONNECTED;
  private _activeProvider: LLMProvider | null = null;
  private _activeConnection: ILLMConnectionProvider | null = null;
  private _lastError?: Error;
  private readonly options: LLMConnectionOptions;
  private readonly logger: Logger = Logger.getInstance();

  constructor(options: Partial<LLMConnectionOptions> = {}) {
    super();
    this.options = {
      maxRetries: options.maxRetries || 3,
      initialRetryDelay: options.initialRetryDelay || 1000,
      maxRetryDelay: options.maxRetryDelay || 30000,
      retryBackoffFactor: options.retryBackoffFactor || 2,
      connectionTimeout: options.connectionTimeout || 30000,
      reconnectOnError: options.reconnectOnError ?? true,
      healthCheckInterval: options.healthCheckInterval || 30000,
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

  /**
   * Set the active LLM provider, disconnecting any existing connection.
   */
  public async setActiveProvider(provider: LLMProvider): Promise<void> {
    if (this._activeConnection) {
      await this.disconnect();
    }
    this._activeProvider = provider;
    this._currentState = ConnectionState.DISCONNECTED;
    this.emit('providerChanged', provider);
  }

  /**
   * Connect to the active provider using the given connection instance.
   * Throws LLMConnectionError on failure.
   */
  public async connect(connection: ILLMConnectionProvider): Promise<void> {
    if (!this._activeProvider) {
      throw new LLMConnectionError('ProviderNotFound', 'No active provider set', {
        method: 'connect',
      });
    }
    try {
      this._currentState = ConnectionState.CONNECTING;
      this.emit('stateChanged', this._currentState);

      await connection.connect({
        ...this.options,
        provider: this._activeProvider,
      });

      this._activeConnection = connection;
      this._currentState = ConnectionState.CONNECTED;
      this._lastError = undefined;

      this.emit('connected', await this.getConnectionStatus());
      this.emit('stateChanged', this._currentState);
    } catch (error) {
      const err =
        error instanceof LLMConnectionError
          ? error
          : new LLMConnectionError(
              'Unknown',
              error instanceof Error ? error.message : String(error),
              { method: 'connect', provider: this._activeProvider?.name },
            );
      this._lastError = err;
      this._currentState = ConnectionState.ERROR;
      this.logger.error('Connection error', {
        error: err,
        provider: this._activeProvider?.name,
        state: this._currentState,
      });
      this.emit('error', err);
      this.emit('stateChanged', this._currentState);
      throw err;
    }
  }

  /**
   * Disconnect from the active provider, if connected.
   * Logs and emits errors using structured logger.
   */
  public async disconnect(): Promise<void> {
    if (this._activeConnection) {
      try {
        await this._activeConnection.disconnect();
      } catch (error) {
        const err =
          error instanceof LLMConnectionError
            ? error
            : new LLMConnectionError(
                'DisconnectError',
                error instanceof Error ? error.message : String(error),
                { method: 'disconnect', provider: this._activeProvider?.name },
              );
        this.logger.error('Error disconnecting', {
          error: err,
          provider: this._activeProvider?.name,
        });
      }
      this._activeConnection = null;
    }
    this._currentState = ConnectionState.DISCONNECTED;
    this.emit('disconnected');
    this.emit('stateChanged', this._currentState);
  }

  /**
   * Get the current connection status, including error context if present.
   */
  private async getConnectionStatus(): Promise<ConnectionStatus> {
    return {
      state: this._currentState,
      provider: this._activeProvider?.name || 'unknown',
      modelInfo: this._activeConnection ? await this._activeConnection.getModelInfo() : undefined,
      error: this._lastError?.message,
    };
  }

  /**
   * Dispose the handler, disconnecting and cleaning up listeners.
   */
  public dispose(): void {
    this.disconnect().catch((error) => {
      const err =
        error instanceof LLMConnectionError
          ? error
          : new LLMConnectionError(
              'DisposeError',
              error instanceof Error ? error.message : String(error),
              { method: 'dispose', provider: this._activeProvider?.name },
            );
      this.logger.error('Error during dispose disconnect', {
        error: err,
        provider: this._activeProvider?.name,
      });
    });
    this.removeAllListeners();
  }
}
