// Test scaffold for src/services/llm/services/ModelOptimizationService.ts
import { ModelOptimizationService } from '../../../../src/services/llm/services/ModelOptimizationService';

describe('ModelOptimizationService', () => {
  let service: ModelOptimizationService;
  let mockLogger: any;
  let mockMetricsService: any;
  const modelId = 'test-model';
  const metrics = {
    memoryUsage: 100,
    peakMemoryUsage: 120,
    averageLatency: 200,
    requestCount: 1000,
    uptime: 100,
  };
  const request = { maxIterations: 2 };

  beforeEach(() => {
    mockLogger = { error: jest.fn() };
    mockMetricsService = { getMetrics: jest.fn().mockResolvedValue(metrics) };
    service = new ModelOptimizationService(mockLogger, mockMetricsService);
  });

  afterEach(() => {
    service.dispose();
  });

  it('should instantiate without error', () => {
    expect(() => new ModelOptimizationService(mockLogger, mockMetricsService)).not.toThrow();
  });

  it('should optimize model and emit events', async () => {
    const started = jest.fn();
    const completed = jest.fn();
    const progress = jest.fn();
    service.on('OptimizationStarted', started);
    service.on('OptimizationCompleted', completed);
    service.on('OptimizationProgress', progress);
    const result = await service.optimizeModel(modelId, request);
    expect(result).toHaveProperty('modelId', modelId);
    expect(started).toHaveBeenCalled();
    expect(completed).toHaveBeenCalled();
    expect(progress).toHaveBeenCalled();
    expect(service.getOptimizationHistory(modelId).length).toBe(1);
  });

  it('should throw if optimization already in progress', async () => {
    service['activeOptimizations'].add(modelId);
    await expect(service.optimizeModel(modelId, request)).rejects.toThrow('Optimization already in progress');
  });

  it('should throw if no metrics available', async () => {
    mockMetricsService.getMetrics = jest.fn().mockResolvedValue(undefined);
    await expect(service.optimizeModel(modelId, request)).rejects.toThrow('No metrics available');
  });

  it('should handle error in runOptimization', async () => {
    service['runOptimization'] = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(service.optimizeModel(modelId, request)).rejects.toThrow('fail');
    expect(mockLogger.error).toHaveBeenCalledWith('Optimization failed', expect.anything());
  });

  it('should clear state and listeners on dispose', () => {
    const spy = jest.spyOn(service, 'removeAllListeners');
    service['optimizationHistory'].set('foo', []);
    service['activeOptimizations'].add('foo');
    service.dispose();
    expect(service['optimizationHistory'].size).toBe(0);
    expect(service['activeOptimizations'].size).toBe(0);
    expect(spy).toHaveBeenCalled();
  });
});
