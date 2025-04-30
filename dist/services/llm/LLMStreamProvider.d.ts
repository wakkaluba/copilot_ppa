import { EventEmitter } from 'events';
import { LLMMessagePayload, LLMSessionConfig } from './LLMSessionManager';
/**
 * Chunk of text from a streaming LLM response
 */
export interface LLMStreamChunk {
    text: string;
    done: boolean;
    id?: string;
    model?: string;
    finishReason?: string;
}
/**
 * Events emitted by the stream provider
 */
export interface LLMStreamEvents {
    data: (chunk: LLMStreamChunk) => void;
    error: (error: Error) => void;
    end: (finalText: string) => void;
}
/**
 * Provider for handling streaming LLM responses
 */
export declare class LLMStreamProvider extends EventEmitter {
    private readonly streamProcessor;
    private readonly chunkExtractor;
    private readonly streamManager;
    private readonly connectionManager;
    /**
     * Creates a new LLM stream provider
     * @param streamEndpoint URL endpoint for streaming
     */
    constructor(streamEndpoint?: string);
    private setupEventHandlers;
    /**
     * Streams a message request to the LLM
     *
     * @param payload The message payload
     * @param config Optional session configuration
     * @returns Promise that resolves when streaming ends
     */
    streamMessage(payload: LLMMessagePayload, config?: Partial<LLMSessionConfig>): Promise<void>;
    private ensureConnection;
    private handleError;
    /**
     * Aborts the current stream if active
     */
    abort(): void;
    /**
     * Add typings for event listeners
     */
    on(event: 'data', listener: (chunk: LLMStreamChunk) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'end', listener: (finalText: string) => void): this;
    /**
     * Add typings for once event listeners
     */
    once(event: 'data', listener: (chunk: LLMStreamChunk) => void): this;
    once(event: 'error', listener: (error: Error) => void): this;
    once(event: 'end', listener: (finalText: string) => void): this;
}
