import { OllamaProvider } from '../../src/llmProviders/ollamaProvider';
import { LMStudioProvider } from '../../src/llmProviders/lmStudioProvider';
import { LLMProviderFactory } from '../../src/llmProviders/llmProviderFactory';

describe('LLM Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OllamaProvider', () => {
    test('initializes with correct configuration', () => {
      const provider = new OllamaProvider({
        host: 'http://localhost',
        port: 11434,
        model: 'llama2'
      });

      expect(provider.getHost()).toBe('http://localhost');
      expect(provider.getPort()).toBe(11434);
      expect(provider.getModel()).toBe('llama2');
    });

    test('sends prompt and receives response', async () => {
      const provider = new OllamaProvider({
        host: 'http://localhost',
        port: 11434,
        model: 'llama2'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          response: 'Test response',
          model: 'llama2'
        })
      });

      const response = await provider.sendPrompt('Hello, world!');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(response).toContain('Test response');
    });

    test('handles connection errors gracefully', async () => {
      const provider = new OllamaProvider({
        host: 'http://localhost',
        port: 11434,
        model: 'llama2'
      });

      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await expect(provider.sendPrompt('Hello, world!')).rejects.toThrow('Connection failed');
    });
  });

  describe('LMStudioProvider', () => {
    test('initializes with correct configuration', () => {
      const provider = new LMStudioProvider({
        host: 'http://localhost',
        port: 1234,
        model: 'mistral'
      });

      expect(provider.getHost()).toBe('http://localhost');
      expect(provider.getPort()).toBe(1234);
      expect(provider.getModel()).toBe('mistral');
    });

    test('sends prompt and receives response', async () => {
      const provider = new LMStudioProvider({
        host: 'http://localhost',
        port: 1234,
        model: 'mistral'
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Test response'
            }
          }]
        })
      });

      const response = await provider.sendPrompt('Hello, world!');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(response).toContain('Test response');
    });

    test('handles connection errors gracefully', async () => {
      const provider = new LMStudioProvider({
        host: 'http://localhost',
        port: 1234,
        model: 'mistral'
      });

      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await expect(provider.sendPrompt('Hello, world!')).rejects.toThrow('Connection failed');
    });
  });

  describe('LLMProviderFactory', () => {
    test('creates Ollama provider', () => {
      const factory = new LLMProviderFactory();
      const provider = factory.createProvider('ollama', {
        host: 'http://localhost',
        port: 11434,
        model: 'llama2'
      });

      expect(provider).toBeInstanceOf(OllamaProvider);
    });

    test('creates LM Studio provider', () => {
      const factory = new LLMProviderFactory();
      const provider = factory.createProvider('lmstudio', {
        host: 'http://localhost',
        port: 1234,
        model: 'mistral'
      });

      expect(provider).toBeInstanceOf(LMStudioProvider);
    });

    test('throws error for invalid provider', () => {
      const factory = new LLMProviderFactory();
      expect(() => factory.createProvider('invalid' as any, {})).toThrow();
    });
  });
});
