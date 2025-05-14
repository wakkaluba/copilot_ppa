import { PerformanceMetricsService } from '../../../src/performance/services/PerformanceMetricsService';

describe('PerformanceMetricsService', () => {
  let service: PerformanceMetricsService;

  beforeEach(() => {
    service = new PerformanceMetricsService();
  });

  it('should memoize expensive calculations', () => {
    const spy = jest.spyOn(service as any, 'expensiveCalculation');
    service.analyzeFile('file1');
    service.analyzeFile('file1');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should clear cache on dispose', () => {
    service.analyzeFile('file2');
    service.dispose();
    expect((service as any).cache.size).toBe(0);
  });

  it('should return consistent metrics for the same file', () => {
    const result1 = service.analyzeFile('file3');
    const result2 = service.analyzeFile('file3');
    expect(result1).toEqual(result2);
  });

  it('should compute new metrics for different files', () => {
    const result1 = service.analyzeFile('fileA');
    const result2 = service.analyzeFile('fileB');
    expect(result1).not.toEqual(result2);
  });

  it('should allow manual cache inspection and clearing', () => {
    service.analyzeFile('fileX');
    expect((service as any).cache.has('fileX')).toBe(true);
    service.dispose();
    expect((service as any).cache.size).toBe(0);
  });

  it('should return undefined for non-existent cache entries', () => {
    expect((service as any).cache.get('nonexistent')).toBeUndefined();
  });

  it('should allow custom metrics via subclassing (with compatible shape)', () => {
    class CustomMetricsService extends PerformanceMetricsService {
      expensiveCalculation(file: string) {
        return { file, metrics: { a: file.length } };
      }
    }
    const customService = new CustomMetricsService();
    const result = customService.analyzeFile('abc');
    expect(result.metrics.a).toBe(3);
  });
});
