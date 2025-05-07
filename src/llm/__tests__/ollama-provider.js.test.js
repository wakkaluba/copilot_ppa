// filepath: d:\___coding\tools\copilot_ppa\src\llm\__tests__\ollama-provider.js.test.js
const axios = require('axios');
const { OllamaProvider } = require('../ollama-provider');
const { Config } = require('../../config');

// Mock axios
jest.mock('axios');

describe('OllamaProvider', () => {
  // Setup for tests
  let provider;
  const defaultBaseUrl = 'http://localhost:11434';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the Axios create method
    axios.create.mockReturnValue(axios);
    // Initialize with a mock config
    Config.ollamaApiUrl = defaultBaseUrl;
    provider = new OllamaProvider();
  });

  describe('Constructor', () => {
    it('should initialize with default URL if not provided', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: defaultBaseUrl,
        timeout: 30000
      });
    });

    it('should initialize with provided URL', () => {
      const customUrl = 'http://custom.ollama:9000';
      const customProvider = new OllamaProvider(customUrl);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: customUrl,
        timeout: 30000
      });
    });
  });

  describe('isAvailable', () => {
    it('should return true when API is available', async () => {
      axios.get.mockResolvedValueOnce({});
      const result = await provider.isAvailable();
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/api/tags');
    });

    it('should return false when API is not available', async () => {
      axios.get.mockRejectedValueOnce(new Error('Connection refused'));
      const result = await provider.isAvailable();
      expect(result).toBe(false);
      expect(axios.get).toHaveBeenCalledWith('/api/tags');
    });
  });

  describe('connect', () => {
    it('should connect successfully when API is available', async () => {
      // Mock isAvailable to return true
      axios.get.mockResolvedValueOnce({});
      await provider.connect();
      expect(axios.get).toHaveBeenCalledWith('/api/tags');
    });

    it('should throw error when API is not available', async () => {
      // Mock isAvailable to return false
      axios.get.mockRejectedValueOnce(new Error('Connection refused'));
      await expect(provider.connect()).rejects.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await provider.disconnect();
      // Since disconnect just updates status, there's no API call to check
      // We can verify it doesn't throw an error
      expect(true).toBe(true);
    });
  });

  describe('getAvailableModels', () => {
    it('should fetch and return available models', async () => {
      const mockModels = {
        data: {
          models: [
            { name: 'llama2', modified_at: '2023-01-01', size: 4000000000 },
            { name: 'codellama', modified_at: '2023-01-02', size: 5000000000 }
          ]
        }
      };

      const mockModelInfo = {
        data: {
          name: 'llama2',
          size: 4000000000,
          digest: 'abc123',
          details: {
            parameter_size: '7B',
            quantization_level: 'Q4_0',
            format: 'GGUF',
            families: ['llama'],
            capabilities: ['chat', 'grammar']
          }
        }
      };

      // Mock the API calls
      axios.get.mockResolvedValueOnce(mockModels);
      axios.post.mockResolvedValue(mockModelInfo);

      const models = await provider.getAvailableModels();

      // Verify API calls
      expect(axios.get).toHaveBeenCalledWith('/api/tags');
      expect(axios.post).toHaveBeenCalledTimes(2); // Once for each model

      // Verify returned models
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('llama2');
      expect(models[0].provider).toBe('ollama');
    });

    it('should handle error when fetching models', async () => {
      axios.get.mockRejectedValueOnce(new Error('Failed to fetch models'));

      // Should handle the error and return an empty array
      await expect(provider.getAvailableModels()).rejects.toThrow();
    });
  });

  describe('generateCompletion', () => {
    it('should generate completion successfully', async () => {
      const mockResponse = {
        data: {
          response: 'This is a generated response',
          prompt_eval_count: 10,
          eval_count: 20
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await provider.generateCompletion('llama2', 'Tell me a joke');

      // Verify API call
      expect(axios.post).toHaveBeenCalledWith('/api/generate', {
        model: 'llama2',
        prompt: 'Tell me a joke',
        options: expect.any(Object)
      });

      // Verify response
      expect(result.content).toBe('This is a generated response');
      expect(result.usage.promptTokens).toBe(10);
      expect(result.usage.completionTokens).toBe(20);
      expect(result.usage.totalTokens).toBe(30);
    });

    it('should pass system prompt when provided', async () => {
      const mockResponse = {
        data: {
          response: 'This is a response with system prompt',
          prompt_eval_count: 15,
          eval_count: 25
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      await provider.generateCompletion(
        'llama2',
        'Tell me a joke',
        'You are a funny assistant'
      );

      // Verify system prompt was included
      expect(axios.post).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        system: 'You are a funny assistant'
      }));
    });

    it('should pass options when provided', async () => {
      const mockResponse = {
        data: {
          response: 'Response with options',
          prompt_eval_count: 5,
          eval_count: 15
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const options = {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        stop: ['END']
      };

      await provider.generateCompletion('llama2', 'Tell me a joke', undefined, options);

      // Verify options were passed correctly
      expect(axios.post).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        options: expect.objectContaining({
          temperature: 0.7,
          num_predict: 1000,
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
          stop: ['END']
        })
      }));
    });

    it('should handle errors during generation', async () => {
      axios.post.mockRejectedValueOnce(new Error('Generation failed'));

      await expect(provider.generateCompletion('llama2', 'Tell me a joke'))
        .rejects.toThrow();
    });
  });

  describe('generateChatCompletion', () => {
    it('should generate chat completion successfully', async () => {
      const mockResponse = {
        data: {
          message: {
            content: 'This is a chat response'
          },
          prompt_eval_count: 12,
          eval_count: 18
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const messages = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello, how are you?' }
      ];

      const result = await provider.generateChatCompletion('llama2', messages);

      // Verify API call
      expect(axios.post).toHaveBeenCalledWith('/api/chat', {
        model: 'llama2',
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello, how are you?' }
        ],
        options: expect.any(Object)
      });

      // Verify response
      expect(result.content).toBe('This is a chat response');
    });

    it('should handle errors during chat generation', async () => {
      axios.post.mockRejectedValueOnce(new Error('Chat generation failed'));

      const messages = [
        { role: 'user', content: 'Hello' }
      ];

      await expect(provider.generateChatCompletion('llama2', messages))
        .rejects.toThrow();
    });
  });

  describe('streamCompletion', () => {
    it('should stream completion successfully', async () => {
      // Mock the stream response with an async iterator
      const mockData = [
        Buffer.from(JSON.stringify({ response: 'First', done: false })),
        Buffer.from(JSON.stringify({ response: 'Second', done: false })),
        Buffer.from(JSON.stringify({ response: 'Last', done: true }))
      ];

      // Create a mock async iterator
      mockData[Symbol.asyncIterator] = async function* () {
        for (const item of mockData) {
          yield item;
        }
      };

      axios.post.mockResolvedValueOnce({ data: mockData });

      // Create a mock callback
      const callback = jest.fn();

      await provider.streamCompletion('llama2', 'Tell me a story', undefined, undefined, callback);

      // Verify API call
      expect(axios.post).toHaveBeenCalledWith(
        '/api/generate',
        expect.objectContaining({
          model: 'llama2',
          prompt: 'Tell me a story',
          stream: true
        }),
        { responseType: 'stream' }
      );

      // Verify callback was called for each chunk
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, { content: 'First', isComplete: false });
      expect(callback).toHaveBeenNthCalledWith(2, { content: 'Second', isComplete: false });
      expect(callback).toHaveBeenNthCalledWith(3, { content: 'Last', isComplete: true });
    });

    it('should handle errors during streaming', async () => {
      axios.post.mockRejectedValueOnce(new Error('Streaming failed'));

      await expect(provider.streamCompletion('llama2', 'Tell me a story'))
        .rejects.toThrow();
    });
  });

  describe('streamChatCompletion', () => {
    it('should stream chat completion successfully', async () => {
      // Mock the stream response with an async iterator
      const mockData = [
        Buffer.from(JSON.stringify({ message: { content: 'Chat1' }, done: false })),
        Buffer.from(JSON.stringify({ message: { content: 'Chat2' }, done: false })),
        Buffer.from(JSON.stringify({ message: { content: 'Chat3' }, done: true }))
      ];

      // Create a mock async iterator
      mockData[Symbol.asyncIterator] = async function* () {
        for (const item of mockData) {
          yield item;
        }
      };

      axios.post.mockResolvedValueOnce({ data: mockData });

      // Create a mock callback
      const callback = jest.fn();

      const messages = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Tell me a story' }
      ];

      await provider.streamChatCompletion('llama2', messages, undefined, callback);

      // Verify API call
      expect(axios.post).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          model: 'llama2',
          messages: expect.any(Array),
          stream: true
        }),
        { responseType: 'stream' }
      );

      // Verify callback was called for each chunk
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should handle errors during chat streaming', async () => {
      axios.post.mockRejectedValueOnce(new Error('Chat streaming failed'));

      const messages = [
        { role: 'user', content: 'Hello' }
      ];

      await expect(provider.streamChatCompletion('llama2', messages))
        .rejects.toThrow();
    });
  });

  describe('getModelInfo', () => {
    it('should get model info successfully', async () => {
      const mockModelInfo = {
        data: {
          name: 'llama2',
          size: 4000000000,
          digest: 'abc123',
          details: {
            parameter_size: '7B',
            quantization_level: 'Q4_0',
            format: 'GGUF',
            families: ['llama'],
            capabilities: ['chat', 'grammar']
          }
        }
      };

      axios.post.mockResolvedValueOnce(mockModelInfo);

      const modelInfo = await provider.getModelInfo('llama2');

      // Verify API call
      expect(axios.post).toHaveBeenCalledWith('/api/show', { name: 'llama2' });

      // Verify returned info
      expect(modelInfo.id).toBe('llama2');
      expect(modelInfo.name).toBe('llama2');
      expect(modelInfo.provider).toBe('ollama');
      expect(modelInfo.parameters).toBeDefined();
      expect(modelInfo.capabilities).toContain('chat');
    });

    it('should handle error getting model info', async () => {
      axios.post.mockRejectedValueOnce(new Error('Failed to get model info'));

      await expect(provider.getModelInfo('invalid-model'))
        .rejects.toThrow();
    });
  });
});
