// Performance benchmark for a critical component: PerformanceManager
// This test measures the execution time of a key method and asserts it meets a performance threshold.

import { PerformanceManager } from '../../../src/performance/performanceManager';

describe('PerformanceManager Benchmarks', () => {
  let perfManager: PerformanceManager;

  beforeAll(() => {
    perfManager = new PerformanceManager();
  });

  it('should analyze a file within 100ms', async () => {
    const fakeDocument = { fileName: 'test.ts', getText: () => 'function foo() { return 42; }' };
    const start = Date.now();
    // @ts-ignore: analyzeFile expects a VSCode TextDocument, but we use a mock
    await perfManager.analyzeFile(fakeDocument);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
