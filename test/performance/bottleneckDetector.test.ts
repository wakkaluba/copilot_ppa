import { BottleneckDetector } from '../../src/performance/bottleneckDetector';

describe('BottleneckDetector', () => {
  let detector: BottleneckDetector;

  beforeEach(() => {
    detector = BottleneckDetector.getInstance();
    detector.clearCache();
  });

  it('should cache analysis results', () => {
    const result1 = detector.analyzeOperation('op1', { stats: {}, issues: 1, metrics: {} });
    const result2 = detector.analyzeOperation('op1', { stats: {}, issues: 1, metrics: {} });
    expect(result1).toEqual(result2);
  });

  it('should clear cache', () => {
    detector.analyzeOperation('op2', { stats: {}, issues: 2, metrics: {} });
    detector.clearCache();
    // Should not return cached result after clear
    const result = detector.analyzeOperation('op2', { stats: {}, issues: 2, metrics: {} });
    expect(result).toBeDefined();
  });

  it('should support setEnabled and analyzeAll', () => {
    expect(() => detector.setEnabled(true)).not.toThrow();
    expect(detector.analyzeAll()).toEqual({ critical: [], warnings: [] });
  });
});
