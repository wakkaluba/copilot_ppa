import * as assert from 'assert';
import * as sinon from 'sinon';
import { LLMProvider } from '../../../../src/services/llm/llmProvider';
import { ProviderFactory, ProviderType } from '../../../../src/services/llm/providers/ProviderFactory';

// Mock LLM Provider implementation for testing
class MockLLMProvider implements LLMProvider {
  id: string;
  name: string;
  private _connected: boolean;

  constructor(id: string = 'mock-provider', name: string = 'Mock Provider') {
    this.id = id;
    this.name = name;
    this._connected = false;
  }

  isConnected(): boolean {
    return this._connected;
  }

  async connect(): Promise<void> {
    this._connected = true;
  }

  async disconnect(): Promise<void> {
    this._connected = false;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async listModels(): Promise<Array<{name: string, modified_at: string, size: number}>> {
    return [
      { name: 'mock-model-1', modified_at: '2023-01-01', size: 7000000000 },
      { name: 'mock-model-2', modified_at: '2023-02-01', size: 13000000000 }
    ];
  }

  async generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: any): Promise<{ content: string; model: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number; }}> {
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

  async streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: any, callback?: (event: { content: string; done: boolean }) => void): Promise<void> {
    if (callback) {
      callback({ content: 'Mock', done: false });
      callback({ content: ' streaming', done: false });
      callback({ content: ' response', done: true });
    }
  }

  async getModelInfo(modelId: string): Promise<{id: string; name: string; provider: string; parameters: number; contextLength: number;}> {
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
  let sandbox: sinon.SinonSandbox;
  let originalEnv: NodeJS.ProcessEnv;

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
      (err: Error) => {
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
