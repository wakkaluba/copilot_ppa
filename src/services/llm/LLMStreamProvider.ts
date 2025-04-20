/**
 * LLM Stream Provider - Handles streaming responses from LLM services
 */
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMConnectionManager } from './LLMConnectionManager';
import { ConnectionState } from '../../types/llm';
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
export class LLMStreamProvider extends EventEmitter {
    private connectionManager: LLMConnectionManager;
    private controller: AbortController | null = null;
    private streamEndpoint: string;
    private accumulatedText = '';
    
    /**
     * Creates a new LLM stream provider
     * @param streamEndpoint URL endpoint for streaming
     */
    constructor(streamEndpoint = 'http://localhost:11434/api/chat') {
        super();
        this.connectionManager = LLMConnectionManager.getInstance();
        this.streamEndpoint = streamEndpoint;
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
        // Ensure we're connected
        if (this.connectionManager.connectionState !== ConnectionState.CONNECTED) {
            const connected = await this.connectionManager.connectToLLM();
            if (!connected) {
                throw new Error('Failed to connect to LLM service');
            }
        }
        
        // Reset state
        this.accumulatedText = '';
        this.abort();
        
        // Create abort controller
        this.controller = new AbortController();
        
        try {
            await this.handleStream(payload, config);
        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    
    /**
     * Handles the streaming request
     */
    private async handleStream(
        payload: LLMMessagePayload,
        config?: Partial<LLMSessionConfig>
    ): Promise<void> {
        if (!this.controller) {
            throw new Error('No active controller');
        }
        
        const requestBody = {
            prompt: payload.prompt,
            system: payload.system,
            stream: true,
            ...config,
            ...payload.options
        };
        
        const response = await fetch(this.streamEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: this.controller.signal
        });
        
        if (!response.ok) {
            throw new Error(`Stream request failed: ${response.status} ${response.statusText}`);
        }
        
        if (!response.body) {
            throw new Error('No response body received');
        }
        
        // Process the stream
        await this.processStream(response);
    }
    
    /**
     * Process the response stream
     */
    private async processStream(response: Response): Promise<void> {
        // Get the reader from the stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder('utf-8');
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    // Stream complete
                    this.emitEnd();
                    break;
                }
                
                if (value) {
                    const text = decoder.decode(value, { stream: true });
                    this.processStreamData(text);
                }
            }
        } catch (error) {
            if (this.controller?.signal.aborted) {
                // Aborted by user, not an error
                this.emitEnd();
            } else {
                this.handleError(error instanceof Error ? error : new Error(String(error)));
            }
        } finally {
            reader.releaseLock();
        }
    }
    
    /**
     * Process streaming data chunks
     */
    private processStreamData(data: string): void {
        // Split by lines and process each chunk
        const lines = data.split('\\n').filter(line => line.trim().length > 0);
        
        for (const line of lines) {
            try {
                // Some APIs prefix with "data: " (SSE format)
                const jsonString = line.startsWith('data: ') ? line.slice(6) : line;
                
                // Try to parse as JSON
                if (jsonString.trim() === '[DONE]') {
                    this.emitEnd();
                    continue;
                }
                
                const json = JSON.parse(jsonString);
                
                // Extract text based on different LLM API formats
                const text = this.extractTextFromChunk(json);
                
                if (text) {
                    this.accumulatedText += text;
                    
                    const chunk: LLMStreamChunk = {
                        text,
                        done: false,
                        id: json.id,
                        model: json.model,
                        finishReason: json.finish_reason ?? json.choices?.[0]?.finish_reason
                    };
                    
                    this.emit('data', chunk);
                }
                
                if (json.done || json.choices?.[0]?.finish_reason) {
                    this.emitEnd();
                }
            } catch (e) {
                // Not valid JSON, ignore or treat as raw text
                if (line.trim()) {
                    this.accumulatedText += line;
                    this.emit('data', { text: line, done: false });
                }
            }
        }
    }
    
    /**
     * Extract text from various LLM API response formats
     */
    private extractTextFromChunk(json: any): string {
        // Handle different API formats
        if (json.content) {
            return json.content;
        } else if (json.choices && json.choices.length > 0) {
            if (json.choices[0].delta && json.choices[0].delta.content) {
                return json.choices[0].delta.content;
            } else if (json.choices[0].text) {
                return json.choices[0].text;
            }
        } else if (json.response) {
            return json.response;
        } else if (json.message) {
            return json.message;
        } else if (json.text) {
            return json.text;
        } else if (typeof json === 'string') {
            return json;
        }
        return '';
    }
    
    /**
     * Emits the end event with accumulated text
     */
    private emitEnd(): void {
        const finalText = this.accumulatedText;
        this.emit('end', finalText);
        
        // Clean up
        this.controller = null;
        this.accumulatedText = '';
    }
    
    /**
     * Handle stream errors
     */
    private handleError(error: Error): void {
        console.error('LLM stream error:', error);
        this.emit('error', error);
        
        // Clean up
        this.controller = null;
    }
    
    /**
     * Aborts the current stream if active
     */
    public abort(): void {
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
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