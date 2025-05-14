// Minimal implementation for test coverage
export class PerformanceMetricsService {
  private cache = new Map<string, any>();
  analyzeFile(file: string) {
    if (!this.cache.has(file)) {
      this.cache.set(file, this.expensiveCalculation(file));
    }
    return this.cache.get(file);
  }
  expensiveCalculation(file: string) {
    return { file, metrics: { a: 1 } };
  }
  dispose() {
    this.cache.clear();
  }
}
