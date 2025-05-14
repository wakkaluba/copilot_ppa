export class AnalyzerFactory {
  static getInstance() { return new AnalyzerFactory(); }
  getAnalyzer(_: string) { return { analyze: (_: any, __: any) => ({ filePath: '', issues: [], skipped: false }) }; }
  hasAnalyzer(_: string) { return true; }
  getSupportedExtensions() { return ['.ts', '.js']; }
}
