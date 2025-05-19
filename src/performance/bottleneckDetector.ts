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
  /**
   * Analyze performance data (legacy API for compatibility)
   */
  analyze(data: any) {
    // For compatibility with older tests and code
    return this.analyzeOperation('default', data);
  }
  clearCache() {
    this.cache.clear();
  }
  setEnabled(_enabled: boolean) {}
  analyzeAll() {
    return { critical: [], warnings: [] };
  }
  resetStats() {}
  setThreshold(_operationId: string, _thresholds: any) {}
  getOptimizationSuggestions(_operationId: string) { return []; }
  reportPerformanceIssue(_issue: any) {}
  getIssues(_sessionId: string) { return []; }
  getOperationsCount() { return 0; }
  incrementOperationsCount() {}
  resetOperationsCount() {}
  getPatternAnalysis(_sessionId: string) { return {}; }
  getSummary() { return {}; }
  clear() { this.clearCache(); }
}
