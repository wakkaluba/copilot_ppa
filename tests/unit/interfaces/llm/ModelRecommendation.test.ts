/**
 * Tests for the ModelRecommendation interface
 */
import { ModelRecommendation, LLMModelInfo } from '../../../../src/llm/modelService';
import { createTestModelInfo } from './LLMModelInfo.test';

describe('ModelRecommendation interface', () => {
  it('should create a valid basic recommendation object', () => {
    const modelInfo: LLMModelInfo = createTestModelInfo();
    
    const recommendation: ModelRecommendation = {
      modelInfo,
      suitability: 85,
      reason: 'This model performs well on most systems',
      systemRequirements: {
        minRAM: 8192 // 8GB
      }
    };

    expect(recommendation).toBeDefined();
    expect(recommendation.modelInfo).toBe(modelInfo);
    expect(recommendation.suitability).toBe(85);
    expect(recommendation.reason).toBe('This model performs well on most systems');
    expect(recommendation.systemRequirements.minRAM).toBe(8192);
  });

  it('should create a valid recommendation with full system requirements', () => {
    const modelInfo: LLMModelInfo = createTestModelInfo({
      id: 'mistral',
      name: 'Mistral (7B)',
      parameters: 7
    });
    
    const recommendation: ModelRecommendation = {
      modelInfo,
      suitability: 92,
      reason: 'Mistral models typically offer good performance on modest hardware',
      systemRequirements: {
        minRAM: 8192, // 8GB
        minVRAM: 4096, // 4GB
        minCPUCores: 4,
        cudaRequired: false
      }
    };

    expect(recommendation).toBeDefined();
    expect(recommendation.modelInfo.id).toBe('mistral');
    expect(recommendation.suitability).toBe(92);
    expect(recommendation.systemRequirements.minRAM).toBe(8192);
    expect(recommendation.systemRequirements.minVRAM).toBe(4096);
    expect(recommendation.systemRequirements.minCPUCores).toBe(4);
    expect(recommendation.systemRequirements.cudaRequired).toBe(false);
  });

  it('should create a valid high-resource recommendation', () => {
    const modelInfo: LLMModelInfo = createTestModelInfo({
      id: 'llama2:13b',
      name: 'Llama 2 (13B)',
      parameters: 13,
      quantization: 'Q5_K_M',
      contextLength: 4096
    });
    
    const recommendation: ModelRecommendation = {
      modelInfo,
      suitability: 65,
      reason: 'This model may require significant memory resources',
      systemRequirements: {
        minRAM: 16384, // 16GB
        minVRAM: 6144, // 6GB
        minCPUCores: 8,
        cudaRequired: true
      }
    };

    expect(recommendation).toBeDefined();
    expect(recommendation.modelInfo.id).toBe('llama2:13b');
    expect(recommendation.modelInfo.parameters).toBe(13);
    expect(recommendation.suitability).toBe(65);
    expect(recommendation.systemRequirements.minRAM).toBe(16384);
    expect(recommendation.systemRequirements.minVRAM).toBe(6144);
    expect(recommendation.systemRequirements.cudaRequired).toBe(true);
  });

  it('should create a valid recommendation for code-specific model', () => {
    const modelInfo: LLMModelInfo = createTestModelInfo({
      id: 'codellama',
      name: 'Code Llama (7B)',
      provider: 'ollama',
      description: 'Specialized for code generation and understanding',
      tags: ['code', 'programming'],
      parameters: 7
    });
    
    const recommendation: ModelRecommendation = {
      modelInfo,
      suitability: 95,
      reason: "Code Llama is optimized for programming tasks. Your system has sufficient RAM to run it well.",
      systemRequirements: {
        minRAM: 8192, // 8GB
        minCPUCores: 4
      }
    };

    expect(recommendation).toBeDefined();
    expect(recommendation.modelInfo.id).toBe('codellama');
    expect(recommendation.modelInfo.tags).toContain('code');
    expect(recommendation.suitability).toBe(95);
    expect(recommendation.reason).toContain('Code Llama is optimized for programming tasks');
    expect(recommendation.systemRequirements.minRAM).toBe(8192);
  });
});

// Helper function to create recommendation objects for testing
export function createTestModelRecommendation(overrides?: Partial<ModelRecommendation>): ModelRecommendation {
  const defaultRecommendation: ModelRecommendation = {
    modelInfo: createTestModelInfo(),
    suitability: 85,
    reason: 'This model performs well on most systems',
    systemRequirements: {
      minRAM: 8192 // 8GB
    }
  };

  if (overrides?.modelInfo) {
    return {
      ...defaultRecommendation,
      ...overrides,
      modelInfo: {
        ...defaultRecommendation.modelInfo,
        ...overrides.modelInfo
      }
    };
  }

  return { ...defaultRecommendation, ...overrides };
}