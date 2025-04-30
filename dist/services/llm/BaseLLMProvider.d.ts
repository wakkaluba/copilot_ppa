import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderOptions } from './llmProvider';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { ConnectionState } from '../../types/llm';
export declare abstract class BaseLLMProvider extends EventEmitter implements LLMProvider {
    readonly id: string;
    readonly name: string;
    protected connectionState: ConnectionState;
    protected metricsTracker: ConnectionMetricsTracker;
    protected lastError?: Error;
    protected currentModel?: string;
    constructor(id: string, name: string);
    abstract generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMProviderOptions): Promise<{
        content: string;
        model: string;
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    }>;
    abstract streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMProviderOptions, callback?: (event: {
        content: string;
        done: boolean;
    }) => void): Promise<void>;
    abstract isAvailable(): Promise<boolean>;
    abstract listModels(): Promise<Array<{
        name: string;
        modified_at: string;
        size: number;
    }>>;
    isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    protected abstract performConnect(): Promise<void>;
    protected abstract performDisconnect(): Promise<void>;
    protected handleError(error: Error): void;
    dispose(): void;
}
