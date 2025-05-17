// Minimal implementation for test coverage
export class BottleneckDetector {
  private static instance: BottleneckDetector;
  private cache = new Map<string, any>();
  static getInstance() {
    if (!BottleneckDetector.instance) {
      BottleneckDetector.instance = new BottleneckDetector();
    }
    return BottleneckDetector.instance;
  }
  analyzeOperation(key: string, data: any) {
    if (!this.cache.has(key)) {
      this.cache.set(key, { ...data });
    }
    return this.cache.get(key);
  }
  clearCache() {
    this.cache.clear();
  }
  setEnabled(_enabled: boolean) {}
  analyzeAll() {
    return { critical: [], warnings: [] };
  }
}
