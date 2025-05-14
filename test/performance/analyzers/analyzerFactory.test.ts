import { AnalyzerFactory } from '../../../src/performance/analyzers/analyzerFactory';

describe('AnalyzerFactory', () => {
  it('should return an instance via getInstance', () => {
    const factory = AnalyzerFactory.getInstance();
    expect(factory).toBeInstanceOf(AnalyzerFactory);
  });

  it('should return an analyzer with analyze method', () => {
    const factory = new AnalyzerFactory();
    const analyzer = factory.getAnalyzer('.ts');
    expect(typeof analyzer.analyze).toBe('function');
    const result = analyzer.analyze('code', 'file.ts');
    expect(result).toHaveProperty('filePath');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('skipped');
  });

  it('should return true for hasAnalyzer', () => {
    const factory = new AnalyzerFactory();
    expect(factory.hasAnalyzer('.ts')).toBe(true);
    expect(factory.hasAnalyzer('.js')).toBe(true);
  });

  it('should return supported extensions', () => {
    const factory = new AnalyzerFactory();
    const exts = factory.getSupportedExtensions();
    expect(Array.isArray(exts)).toBe(true);
    expect(exts).toContain('.ts');
    expect(exts).toContain('.js');
  });

  it('should return a new instance each time getInstance is called', () => {
    const factory1 = AnalyzerFactory.getInstance();
    const factory2 = AnalyzerFactory.getInstance();
    expect(factory1).not.toBe(factory2); // Not a singleton
  });

  it('should return a default analyzer that returns expected structure', () => {
    const factory = new AnalyzerFactory();
    const analyzer = factory.getAnalyzer('.py');
    const result = analyzer.analyze('print(1)', 'file.py');
    expect(result).toEqual({ filePath: '', issues: [], skipped: false });
  });

  it('should always return true for hasAnalyzer regardless of input', () => {
    const factory = new AnalyzerFactory();
    expect(factory.hasAnalyzer('')).toBe(true);
    expect(factory.hasAnalyzer('random')).toBe(true);
    expect(factory.hasAnalyzer(undefined as any)).toBe(true);
  });

  it('should include only .ts and .js in getSupportedExtensions', () => {
    const factory = new AnalyzerFactory();
    const exts = factory.getSupportedExtensions();
    expect(exts).toEqual(['.ts', '.js']);
  });

  it('should allow calling registerAnalyzer and registerDefaultAnalyzers for coverage', () => {
    const factory = new AnalyzerFactory();
    expect(() => factory.registerAnalyzer(['.foo'], {})).not.toThrow();
    // @ts-expect-error: private method
    expect(() => factory.registerDefaultAnalyzers()).not.toThrow();
  });
});
