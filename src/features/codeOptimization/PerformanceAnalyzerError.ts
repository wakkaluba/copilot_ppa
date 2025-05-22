// Custom error for PerformanceAnalyzer
export class PerformanceAnalyzerError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PerformanceAnalyzerError';
  }
}
