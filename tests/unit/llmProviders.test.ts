import { OllamaProvider } from '../../src/providers/ollamaProvider';
import { LMStudioProvider } from '../../src/providers/lmStudioProvider';
import { LLMProviderFactory } from '../../src/providers/llmProviderFactory';

// Mock fetch function
global.fetch = jest.fn();

describe('LLM Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        response: 'Test response',
        choices: [{ message: { content: 'Test response' } }]
      }),
      text: jest.fn().mockResolvedValue('Test response')
    });
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

      const response = await provider.sendPrompt('Hello, world!');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
      expect(response).toBe('Test response');
    });

    test('handles connection errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
      
      const provider = new OllamaProvider({
        host: 'http://localhost',
        port: 11434,
        model: 'llama2'
      });

      await expect(provider.sendPrompt('Hello, world!')).rejects.toThrow();
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

      const response = await provider.sendPrompt('Hello, world!');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
      expect(response).toBe('Test response');
    });
  });

  describe('LLMProviderFactory', () => {
    test('creates appropriate provider based on type', () => {
      const factory = new LLMProviderFactory();
      
      const ollamaProvider = factory.createProvider('ollama', {
        host: 'http://localhost',
        port: 11434,
        model: 'llama2'
      });
      
      const lmStudioProvider = factory.createProvider('lmstudio', {
        host: 'http://localhost',
        port: 1234,
        model: 'mistral'
      });
      
      expect(ollamaProvider).toBeInstanceOf(OllamaProvider);
      expect(lmStudioProvider).toBeInstanceOf(LMStudioProvider);
    });

    test('throws error for unknown provider type', () => {
      const factory = new LLMProviderFactory();
      
      expect(() => {
        factory.createProvider('unknown' as any, {
          host: 'http://localhost',
          port: 8000,
          model: 'model'
        });
      }).toThrow();
    });
  });
});
