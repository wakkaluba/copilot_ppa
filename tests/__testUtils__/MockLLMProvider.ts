import { LLMProvider } from '../../src/services/llm/llm-provider';

export class MockLLMProvider implements LLMProvider {
    private isConnected = false;
    private mockResponses: Map<string, string> = new Map();
    public name = 'MockProvider';

    async connect(): Promise<boolean> {
        this.isConnected = true;
        return true;
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
    }

    async generateCompletion(prompt: string, systemPrompt?: string): Promise<string> {
        if (!this.isConnected) {
            throw new Error('Provider not connected');
        }
        return this.mockResponses.get(prompt) || 'Mock response';
    }

    async generateStreamingCompletion(
        prompt: string,
        systemPrompt: string,
        options: any,
        callback: (content: { content: string; done: boolean }) => void
    ): Promise<void> {
        if (!this.isConnected) {
            throw new Error('Provider not connected');
        }

        // Simulate streaming response
        setTimeout(() => callback({ content: 'Mock streaming ', done: false }), 10);
        setTimeout(() => callback({ content: 'response', done: true }), 20);
    }

    setMockResponse(prompt: string, response: string): void {
        this.mockResponses.set(prompt, response);
    }

    getIsConnected(): boolean {
        return this.isConnected;
    }

    dispose(): void {
        this.mockResponses.clear();
        this.isConnected = false;
    }
}