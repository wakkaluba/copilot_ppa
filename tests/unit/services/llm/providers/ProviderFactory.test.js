const assert = require('assert');
const sinon = require('sinon');
const { ProviderFactory, ProviderType } = require('../../../../src/services/llm/providers/ProviderFactory');
const { LLMProvider } = require('../../../../src/services/llm/llmProvider');

// Mock LLM Provider implementation for testing
class MockLLMProvider {
  constructor(id = 'mock-provider', name = 'Mock Provider') {
    this.id = id;
    this.name = name;
    this._connected = false;
  }

  isConnected() {
    return this._connected;
  }

  async connect() {
    this._connected = true;
  }

  async disconnect() {
    this._connected = false;
  }

  async isAvailable() {
    return true;
  }

  async listModels() {
    return [
      { name: 'mock-model-1', modified_at: '2023-01-01', size: 7000000000 },
      { name: 'mock-model-2', modified_at: '2023-02-01', size: 13000000000 }
    ];
  }

  async generateCompletion(model, prompt, systemPrompt, options) {
    return {
      content: `Mock response for: ${prompt}`,
      model: model,
      usage: {
        promptTokens: prompt.length,
        completionTokens: 20,
        totalTokens: prompt.length + 20
      }
    };
  }

  async streamCompletion(model, prompt, systemPrompt, options, callback) {
    if (callback) {
      callback({ content: 'Mock', done: false });
      callback({ content: ' streaming', done: false });
      callback({ content: ' response', done: true });
    }
  }

  async getModelInfo(modelId) {
    return {
      id: modelId,
      name: `Mock ${modelId}`,
      provider: this.id,
      parameters: 7,
      contextLength: 4096
    };
  }
}

describe('ProviderFactory Tests', () => {
  let sandbox;
  let originalEnv;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    sandbox.restore();
    process.env = originalEnv;
  });

  test('Should be implemented as a singleton', () => {
    const instance1 = ProviderFactory.getInstance();
    const instance2 = ProviderFactory.getInstance();

    assert.strictEqual(instance1, instance2, 'getInstance should always return the same instance');
  });

  test('Should use provided mock provider in test environment', async () => {
    process.env.NODE_ENV = 'test';

    const factory = ProviderFactory.getInstance();
    const mockProvider = new MockLLMProvider('test-mock', 'Test Mock Provider');

    const provider = await factory.createProvider(ProviderType.Mock, {
      provider: mockProvider
    });

    assert.strictEqual(provider, mockProvider);
    assert.strictEqual(provider.id, 'test-mock');
    assert.strictEqual(provider.name, 'Test Mock Provider');
  });

  test('Should throw error when creating provider in production environment', async () => {
    process.env.NODE_ENV = 'production';

    const factory = ProviderFactory.getInstance();

    await assert.rejects(
      async () => {
        await factory.createProvider(ProviderType.Ollama, {});
      },
      {
        name: 'Error',
        message: 'Not implemented in tests'
      }
    );
  });

  test('Should throw error when no mock provider provided in test environment', async () => {
    process.env.NODE_ENV = 'test';

    const factory = ProviderFactory.getInstance();

    await assert.rejects(
      async () => {
        await factory.createProvider(ProviderType.Ollama, {});
      },
      (err) => {
        // This will throw a type error when trying to access methods on undefined
        return true;
      }
    );
  });

  test('Should support different provider types', () => {
    assert.strictEqual(ProviderType.Ollama, 'ollama');
    assert.strictEqual(ProviderType.LMStudio, 'lmstudio');
    assert.strictEqual(ProviderType.Mock, 'mock');
  });
});
