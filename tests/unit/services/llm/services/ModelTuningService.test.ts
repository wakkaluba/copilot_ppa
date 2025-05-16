// Test coverage for src/services/llm/services/ModelTuningService.ts error handling
import { LLMResourceError } from '../../../../src/services/llm/errors';
import { ModelTuningService } from '../../../../src/services/llm/services/ModelTuningService';

describe('ModelTuningService error handling', () => {
  let service: ModelTuningService;
  let mockLogger: any;
  let mockMetricsService: any;
  const modelId = 'test-model';
  const request = { maxIterations: 2 };

  beforeEach(() => {
    mockLogger = { error: jest.fn() };
    mockMetricsService = { getMetrics: jest.fn().mockResolvedValue({}) };
    service = new ModelTuningService(mockLogger, mockMetricsService);
  });

  it('throws LLMResourceError if tuning already in progress', async () => {
    service['activeTuning'].add(modelId);
    await expect(service.tuneModel(modelId, request)).rejects.toThrow(LLMResourceError);
  });

  it('throws LLMResourceError if no metrics available', async () => {
    mockMetricsService.getMetrics.mockResolvedValue(undefined);
    await expect(service.tuneModel(modelId, request)).rejects.toThrow(LLMResourceError);
  });
});
