import { EventEmitter } from 'events';
import { ConnectionState, LLMConnectionOptions, ILLMConnectionProvider } from '../types';
import { LLMProvider } from '../../../llm/llm-provider';
export declare class LLMConnectionHandlerService extends EventEmitter {
    private _currentState;
    private _activeProvider;
    private _activeConnection;
    private _lastError?;
    private readonly options;
    constructor(options?: Partial<LLMConnectionOptions>);
    get currentState(): ConnectionState;
    get activeProvider(): LLMProvider | null;
    get activeProviderName(): string | undefined;
    get lastError(): Error | undefined;
    setActiveProvider(provider: LLMProvider): Promise<void>;
    connect(connection: ILLMConnectionProvider): Promise<void>;
    disconnect(): Promise<void>;
    private getConnectionStatus;
    dispose(): void;
}
