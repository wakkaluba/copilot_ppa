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
});
