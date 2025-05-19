import { BottleneckDetector } from '../../src/performance/bottleneckDetector';

describe('BottleneckDetector', () => {
  let detector: BottleneckDetector;

  beforeEach(() => {
    detector = BottleneckDetector.getInstance();
  });

  it('should enable and disable detection', () => {
    expect(() => detector.setEnabled(true)).not.toThrow();
    expect(() => detector.setEnabled(false)).not.toThrow();
  });

  it('should analyze valid data', () => {
    const data = { op: 'test', duration: 100 };
    expect(detector.analyze(data)).toBeDefined();
  });

  it('should handle analyze with missing data gracefully', () => {
    expect(() => detector.analyze(undefined as any)).not.toThrow();
    expect(() => detector.analyze(null as any)).not.toThrow();
    expect(() => detector.analyze({})).not.toThrow();
  });
});
