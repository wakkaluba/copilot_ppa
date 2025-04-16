/**
 * Tests for the LLMModelInfo interface
 */
import { LLMModelInfo } from '../../../../src/llm/modelService';

describe('LLMModelInfo interface', () => {
  it('should create a valid basic model info object', () => {
    const modelInfo: LLMModelInfo = {
      id: 'llama2',
      name: 'Llama 2 (7B)',
      provider: 'ollama',
      description: 'A versatile 7B parameter model for general use',
      tags: ['general', 'chat']
    };

    expect(modelInfo).toBeDefined();
    expect(modelInfo.id).toBe('llama2');
    expect(modelInfo.name).toBe('Llama 2 (7B)');
    expect(modelInfo.provider).toBe('ollama');
    expect(modelInfo.description).toBe('A versatile 7B parameter model for general use');
    expect(modelInfo.tags).toEqual(['general', 'chat']);
  });

  it('should create a valid model info object with all properties', () => {
    const modelInfo: LLMModelInfo = {
      id: 'mistral',
      name: 'Mistral (7B)',
      provider: 'ollama',
      description: 'A powerful 7B model with strong performance',
      tags: ['general', 'reasoning'],
      parameters: 7,
      quantization: 'Q4_0',
      contextLength: 8192
    };

    expect(modelInfo).toBeDefined();
    expect(modelInfo.id).toBe('mistral');
    expect(modelInfo.name).toBe('Mistral (7B)');
    expect(modelInfo.provider).toBe('ollama');
    expect(modelInfo.description).toBe('A powerful 7B model with strong performance');
    expect(modelInfo.tags).toEqual(['general', 'reasoning']);
    expect(modelInfo.parameters).toBe(7);
    expect(modelInfo.quantization).toBe('Q4_0');
    expect(modelInfo.contextLength).toBe(8192);
  });

  it('should create a valid model info object for LM Studio provider', () => {
    const modelInfo: LLMModelInfo = {
      id: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
      name: 'Mistral Instruct (7B) GGUF',
      provider: 'lmstudio',
      description: 'GGUF version of Mistral 7B optimized for instruction following',
      tags: ['general', 'instruction'],
      contextLength: 4096
    };

    expect(modelInfo).toBeDefined();
    expect(modelInfo.id).toBe('TheBloke/Mistral-7B-Instruct-v0.2-GGUF');
    expect(modelInfo.name).toBe('Mistral Instruct (7B) GGUF');
    expect(modelInfo.provider).toBe('lmstudio');
    expect(modelInfo.description).toBe('GGUF version of Mistral 7B optimized for instruction following');
    expect(modelInfo.tags).toEqual(['general', 'instruction']);
    expect(modelInfo.contextLength).toBe(4096);
  });

  it('should create a valid code-specific model info object', () => {
    const modelInfo: LLMModelInfo = {
      id: 'codellama',
      name: 'Code Llama (7B)',
      provider: 'ollama',
      description: 'Specialized for code generation and understanding',
      tags: ['code', 'programming'],
      parameters: 7
    };

    expect(modelInfo).toBeDefined();
    expect(modelInfo.id).toBe('codellama');
    expect(modelInfo.name).toBe('Code Llama (7B)');
    expect(modelInfo.provider).toBe('ollama');
    expect(modelInfo.description).toBe('Specialized for code generation and understanding');
    expect(modelInfo.tags).toEqual(['code', 'programming']);
    expect(modelInfo.parameters).toBe(7);
  });
});

// Helper function to create model info objects for testing
export function createTestModelInfo(overrides?: Partial<LLMModelInfo>): LLMModelInfo {
  const defaultModelInfo: LLMModelInfo = {
    id: 'llama2',
    name: 'Llama 2 (7B)',
    provider: 'ollama',
    description: 'A versatile 7B parameter model for general use',
    tags: ['general', 'chat']
  };

  return { ...defaultModelInfo, ...overrides };
}