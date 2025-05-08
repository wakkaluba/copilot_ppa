const { EventEmitter } = require('events');
const { LLMProviderFactory } = require('../llm-provider-factory');

// Mock LLM Provider implementation for testing
class MockLLMProvider extends EventEmitter {
    constructor(id = 'mock-provider', name = 'Mock Provider') {
        super();
        this.id = id;
        this.name = name;
        this._connected = false;
        this._status = 'inactive';
    }

    getCapabilities() {
        return {
            supportsStreaming: true,
            supportsChatCompletions: true,
            supportsTextCompletions: true,
            supportsEmbeddings: false,
            maxContextLength: 4096
        };
    }

    async isAvailable() {
        return this._status !== 'error';
    }

    getStatus() {
        return this._status;
    }

    async connect() {
        this._connected = true;
        this._status = 'active';
        this.emit('statusChanged', 'active');
    }

    async disconnect() {
        this._connected = false;
        this._status = 'inactive';
        this.emit('statusChanged', 'inactive');
    }

    isConnected() {
        return this._connected;
    }

    async completePrompt(request) {
        return {
            content: `Mock response for: ${request.prompt}`,
            usage: {
                promptTokens: request.prompt.length,
                completionTokens: 20,
                totalTokens: request.prompt.length + 20
            }
        };
    }

    async generateCompletion(model, prompt, systemPrompt, options) {
        return this.completePrompt({
            prompt: systemPrompt ? `${systemPrompt}\n${prompt}` : prompt,
            options
        });
    }

    async streamCompletion(model, prompt, systemPrompt, options, callback) {
        if (!callback) return;

        callback({ content: 'Mock', done: false });
        callback({ content: ' streaming', done: false });
        callback({ content: ' response', done: true });
    }

    async cancelRequest() {
        return true;
    }
}

describe('LLMProviderFactory', () => {
    // Reset any mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('should be implemented as a singleton', () => {
        const factory1 = LLMProviderFactory.getInstance();
        const factory2 = LLMProviderFactory.getInstance();

        expect(factory1).toBe(factory2);
    });

    test('should create Ollama provider', () => {
        const factory = LLMProviderFactory.getInstance();
        const provider = factory.createProvider('ollama', {
            endpoint: 'http://localhost:11434',
            model: 'llama2'
        });

        expect(provider).toBeDefined();
        expect(provider.constructor.name).toContain('OllamaProvider');
    });

    test('should create LM Studio provider', () => {
        const factory = LLMProviderFactory.getInstance();
        const provider = factory.createProvider('lmstudio', {
            endpoint: 'http://localhost:1234',
            model: 'mistral'
        });

        expect(provider).toBeDefined();
        expect(provider.constructor.name).toContain('LMStudioProvider');
    });

    test('should throw error for invalid provider type', () => {
        const factory = LLMProviderFactory.getInstance();
        expect(() => factory.createProvider('invalid', {})).toThrow();
    });

    test('should use cached provider for the same configuration', () => {
        const factory = LLMProviderFactory.getInstance();

        const config = {
            endpoint: 'http://localhost:11434',
            model: 'llama2'
        };

        const provider1 = factory.createProvider('ollama', config);
        const provider2 = factory.createProvider('ollama', config);

        expect(provider1).toBe(provider2);
    });

    test('should create different instances for different configurations', () => {
        const factory = LLMProviderFactory.getInstance();

        const provider1 = factory.createProvider('ollama', {
            endpoint: 'http://localhost:11434',
            model: 'llama2'
        });

        const provider2 = factory.createProvider('ollama', {
            endpoint: 'http://localhost:11434',
            model: 'mistral'
        });

        expect(provider1).not.toBe(provider2);
    });
});
