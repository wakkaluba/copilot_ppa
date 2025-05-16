// Test coverage for src/services/llm/services/ModelSchedulerService.ts error handling
import { ModelSchedulerService } from '../../../../src/services/llm/services/ModelSchedulerService';
import { LLMResourceError } from '../../../../src/services/llm/errors';

describe('ModelSchedulerService error handling', () => {
  let service: ModelSchedulerService;
  let mockLogger: any;
  let mockMetricsService: any;
  let mockResourceOptimizer: any;
  const modelId = 'test-model';
  const request = { maxIterations: 2 };

  beforeEach(() => {
    mockLogger = { error: jest.fn() };
    mockMetricsService = { getMetrics: jest.fn().mockResolvedValue({}) };
    mockResourceOptimizer = { getAvailableResources: jest.fn().mockResolvedValue({}) };
    service = new ModelSchedulerService(mockLogger, mockResourceOptimizer, mockMetricsService);
  });

  it('throws LLMResourceError if scheduling already in progress', async () => {
    service['processing'].add(modelId);
    await expect(service.scheduleModel(modelId, request)).rejects.toThrow(LLMResourceError);
  });

  it('throws LLMResourceError if no metrics available', async () => {
    mockMetricsService.getMetrics.mockResolvedValue(undefined);
    await expect(service.scheduleModel(modelId, request)).rejects.toThrow(LLMResourceError);
  });
});
