import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderStatus, LLMRequestOptions, LLMModelInfo, LLMStreamEvent, LLMMessage, LLMResponse } from '../../src/llm/llm-provider';

/**
 * Mock LLM Provider for testing purposes
 */
export class MockLLMProvider extends EventEmitter implements LLMProvider {
    readonly name: string;
    private _status: LLMProviderStatus = { 
        isConnected: false, 
        activeModel: null,
        modelInfo: null,
        error: null
    };
    private _offlineMode = false;
    private _lastResponse: string | null = null;
    private _cachedResponses: Map<string, string> = new Map();

    constructor(name = 'MockProvider') {
        super();
        this.name = name;
    }

    async isAvailable(): Promise<boolean> {
        return true;
    }

    async connect(): Promise<void> {
        this._status.isConnected = true;
        this.emit('stateChanged', this.getStatus());
        return Promise.resolve();
    }

    async disconnect(): Promise<void> {
        this._status.isConnected = false;
        this.emit('stateChanged', this.getStatus());
        return Promise.resolve();
    }

    getStatus(): LLMProviderStatus {
        return { ...this._status };
    }

    async getAvailableModels(): Promise<LLMModelInfo[]> {
        return [
            { id: 'model1', name: 'Model 1', provider: this.name, parameter_size: '7B' },
            { id: 'model2', name: 'Model 2', provider: this.name, parameter_size: '13B' }
        ];
    }

    async getModelInfo(modelId: string): Promise<LLMModelInfo> {
        return { 
            id: modelId, 
            name: `Model ${modelId}`, 
            provider: this.name,
            parameter_size: '7B'
        };
    }

    async generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        if (this._offlineMode) {
            const cached = await this.useCachedResponse(prompt);
            if (cached) {
                return { content: cached };
            }

            if (this._lastResponse) {
                return { content: this._lastResponse };
            }

            return { content: "Offline mode - no cached response available" };
        }

        const response = `Mock response for: ${prompt}${systemPrompt ? ' (with system prompt)' : ''}`;
        this._lastResponse = response;
        await this.cacheResponse(prompt, response);
        
        return {
            content: response,
            usage: {
                promptTokens: prompt.length,
                completionTokens: response.length,
                totalTokens: prompt.length + response.length
            }
        };
    }

    async generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const systemMessage = messages.find(m => m.role === 'system');
        
        return this.generateCompletion(model, prompt, systemMessage?.content, options);
    }

    async streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        if (!callback) {
            return;
        }

        const words = `Mock response for: ${prompt}`.split(' ');
        
        // Simulate streaming by sending one word at a time
        for (let i = 0; i < words.length; i++) {
            callback({
                content: words[i] + (i < words.length - 1 ? ' ' : ''),
                done: i === words.length - 1
            });
            
            // Short delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    async streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const systemMessage = messages.find(m => m.role === 'system');
        
        return this.streamCompletion(model, prompt, systemMessage?.content, options, callback);
    }

    async setOfflineMode(enabled: boolean): Promise<void> {
        this._offlineMode = enabled;
    }

    async useCachedResponse(prompt: string): Promise<string | null> {
        return this._cachedResponses.get(prompt) || null;
    }

    async cacheResponse(prompt: string, response: string): Promise<void> {
        this._cachedResponses.set(prompt, response);
    }

    getLastResponse(): string | null {
        return this._lastResponse;
    }
}