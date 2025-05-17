export class AnalyzerFactory {
  static getInstance() {
    return new AnalyzerFactory();
  }
  getAnalyzer(_: string) {
    return { analyze: (_: any, __: any) => ({ filePath: '', issues: [], skipped: false }) };
  }
  hasAnalyzer(_: string) {
    return true;
  }
  getSupportedExtensions() {
    return ['.ts', '.js'];
  }
  /**
   * Registers a new analyzer for the given extension(s).
   * (No-op in stub, but included for coverage.)
   */
  registerAnalyzer(exts: string[], analyzer: any) {
    // No-op for stub, but should be callable
    return void 0;
  }

  /**
   * Registers default analyzers (no-op in stub).
   */
  private registerDefaultAnalyzers() {
    // No-op for stub, but should be callable
    return void 0;
  }
}
