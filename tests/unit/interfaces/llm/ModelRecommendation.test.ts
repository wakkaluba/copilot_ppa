/**
 * Tests for model recommendations
 */
import { LLMModelInfo } from '../../../../src/llm/types';

describe('ModelRecommendation interface', () => {
  it('should create valid model recommendations', () => {
    const recommendations: LLMModelInfo[] = [
      {
        id: 'model-1',
        name: 'Fast Local Model',
        provider: 'Local',
        description: 'A fast local inference model',
        tags: ['fast', 'local']
      },
      {
        id: 'model-2',
        name: 'Accurate Cloud Model',
        provider: 'OpenAI',
        description: 'A highly accurate cloud model',
        tags: ['accurate', 'cloud']
      }
    ];
    
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0]?.id).toBe('model-1');
    expect(recommendations[1]?.provider).toBe('OpenAI');
  });
  
  it('should create a valid recommendation with minimal fields', () => {
    const recommendation: LLMModelInfo = {
      id: 'minimal-model',
      name: 'Minimal Model',
      provider: 'Local',
      description: 'Minimal model for testing',
      parameters: {
        parameterCount: 7
      }
    };
    
    expect(recommendation).toBeDefined();
    expect(recommendation.id).toBe('minimal-model');
    expect(recommendation.provider).toBe('Local');
  });
  
  it('should create recommendations with advanced parameters', () => {
    const recommendations: LLMModelInfo[] = [
      {
        id: 'advanced-model',
        name: 'Advanced Parameter Model',
        provider: 'Custom',
        description: 'Model with advanced parameters',
        tags: ['optimized', 'fast'],
        parameters: {
          quantization: '8bit',
          temperature: 0.8,
          parameterCount: 13,
          optimizationLevel: 'high'
        },
        contextSize: 16384
      }
    ];
    
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.tags).toContain('optimized');
    expect(recommendations[0]?.parameters?.['quantization']).toBe('8bit');
    expect(recommendations[0]?.parameters?.['parameterCount']).toBe(13);
    expect(recommendations[0]?.contextSize).toBe(16384);
  });
  
  it('should handle compatibility between models', () => {
    const localModel: LLMModelInfo = {
      id: 'local-base',
      name: 'Local Base Model',
      provider: 'Local',
      description: 'Base model for local inference',
      parameters: {
        parameterCount: 7
      }
    };
    
    const cloudModel: LLMModelInfo = {
      id: 'cloud-base',
      name: 'Cloud Base Model',
      provider: 'Remote',
      description: 'Base model for cloud inference'
    };
    
    // Check the recommendations are valid
    expect(localModel).toBeDefined();
    expect(cloudModel).toBeDefined();
    expect(localModel.provider).not.toEqual(cloudModel.provider);
  });
});