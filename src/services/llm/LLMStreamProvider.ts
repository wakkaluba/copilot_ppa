/**
 * LLM Stream Provider - Handles streaming responses from LLM services
 */
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMConnectionManager } from './LLMConnectionManager';
import { ConnectionState } from '../../types/llm';
import { LLMMessagePayload, LLMSessionConfig } from './LLMSessionManager';
import { LLMStreamProcessor } from './services/LLMStreamProcessor';
import { LLMChunkExtractor } from './services/LLMChunkExtractor';
import { LLMStreamManager } from './services/LLMStreamManager';
import { LLMStreamError } from './errors/LLMStreamError';

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
export class LLMStreamProvider extends EventEmitter {
    private readonly streamProcessor: LLMStreamProcessor;
    private readonly chunkExtractor: LLMChunkExtractor;
    private readonly streamManager: LLMStreamManager;
    private readonly connectionManager: LLMConnectionManager;
    
    /**
     * Creates a new LLM stream provider
     * @param streamEndpoint URL endpoint for streaming
     */
    constructor(streamEndpoint = 'http://localhost:11434/api/chat') {
        super();
        this.connectionManager = LLMConnectionManager.getInstance();
        this.streamProcessor = new LLMStreamProcessor();
        this.chunkExtractor = new LLMChunkExtractor();
        this.streamManager = new LLMStreamManager(streamEndpoint);

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.streamProcessor.on('data', chunk => this.emit('data', chunk));
        this.streamProcessor.on('error', error => this.handleError(error));
        this.streamProcessor.on('end', text => this.emit('end', text));
    }
    
    /**
     * Streams a message request to the LLM
     * 
     * @param payload The message payload
     * @param config Optional session configuration
     * @returns Promise that resolves when streaming ends
     */
    public async streamMessage(
        payload: LLMMessagePayload,
        config?: Partial<LLMSessionConfig>
    ): Promise<void> {
        try {
            await this.ensureConnection();
            this.streamManager.resetState();
            
            const response = await this.streamManager.startStream(payload, config);
            await this.streamProcessor.processStream(response);
        } catch (error) {
            this.handleError(error instanceof Error ? error : new LLMStreamError(String(error)));
            throw error;
        }
    }
    
    private async ensureConnection(): Promise<void> {
        if (this.connectionManager.connectionState !== ConnectionState.CONNECTED) {
            const connected = await this.connectionManager.connectToLLM();
            if (!connected) {
                throw new LLMStreamError('Failed to connect to LLM service');
            }
        }
    }
    
    private handleError(error: Error): void {
        console.error('LLM stream error:', error);
        this.emit('error', error);
        this.streamManager.cleanup();
    }
    
    /**
     * Aborts the current stream if active
     */
    public abort(): void {
        this.streamManager.abort();
    }
    
    /**
     * Add typings for event listeners
     */
    public on(event: 'data', listener: (chunk: LLMStreamChunk) => void): this;
    public on(event: 'error', listener: (error: Error) => void): this;
    public on(event: 'end', listener: (finalText: string) => void): this;
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
    
    /**
     * Add typings for once event listeners
     */
    public once(event: 'data', listener: (chunk: LLMStreamChunk) => void): this;
    public once(event: 'error', listener: (error: Error) => void): this;
    public once(event: 'end', listener: (finalText: string) => void): this;
    public once(event: string, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }
}