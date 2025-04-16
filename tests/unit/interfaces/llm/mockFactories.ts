import { LLMPromptOptions, HardwareSpecs } from '../../../../src/llm/types';

/**
 * Creates a mock LLMPromptOptions object with default or custom values
 */
export function createMockLLMPromptOptions(overrides?: Partial<LLMPromptOptions>): LLMPromptOptions {
  return {
    maxTokens: 100,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
    stopSequences: ['###', 'END'],
    ...overrides
  };
}

/**
 * Creates a mock HardwareSpecs object with default or custom values
 */
export function createMockHardwareSpecs(overrides?: Partial<HardwareSpecs>): HardwareSpecs {
  const defaultSpecs: HardwareSpecs = {
    gpu: {
      available: true,
      name: 'NVIDIA GeForce RTX 3080',
      vram: 10240,
      cudaSupport: true
    },
    ram: {
      total: 32768,
      free: 16384
    },
    cpu: {
      cores: 8,
      model: 'Intel Core i7-10700K'
    }
  };

  if (!overrides) {
    return defaultSpecs;
  }

  return {
    gpu: {
      ...defaultSpecs.gpu,
      ...(overrides.gpu || {})
    },
    ram: {
      ...defaultSpecs.ram,
      ...(overrides.ram || {})
    },
    cpu: {
      ...defaultSpecs.cpu,
      ...(overrides.cpu || {})
    }
  };
}