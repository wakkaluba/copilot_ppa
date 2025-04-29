import { LLMProvider, LLMProviderOptions } from '../../src/services/llm/llmProvider';
import { EventEmitter } from 'events';

export class MockLLMProvider extends EventEmitter implements LLMProvider {
    private connected: boolean = false;
    public readonly name: string = 'mock-provider';
    public readonly id: string = 'mock-provider-1';

    public async connect(): Promise<void> {
        this.connected = true;
    }

    public async disconnect(): Promise<void> {
        this.connected = false;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async isAvailable(): Promise<boolean> {
        return true;
    }

    public async listModels(): Promise<Array<{name: string, modified_at: string, size: number}>> {
        return [
            { name: 'mock-model', modified_at: new Date().toISOString(), size: 1000 }
        ];
    }

    public async generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMProviderOptions
    ): Promise<{ content: string; model: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number; } }> {
        return {
            content: 'Mock response',
            model: model,
            usage: {
                promptTokens: 10,
                completionTokens: 10,
                totalTokens: 20
            }
        };
    }

    public async streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMProviderOptions,
        callback?: (event: { content: string; done: boolean }) => void
    ): Promise<void> {
        if (callback) {
            callback({ content: 'Mock streaming response', done: false });
            callback({ content: ' completed.', done: true });
        }
    }

    public async getModelInfo(modelId: string): Promise<{ id: string; name: string; provider: string; parameters: number; contextLength: number; }> {
        return {
            id: modelId,
            name: 'Mock Model',
            provider: this.name,
            parameters: 1000000,
            contextLength: 4096
        };
    }
}