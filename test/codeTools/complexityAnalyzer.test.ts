import { ComplexityAnalyzer } from 'd:/___coding/tools/copilot_ppa/src/codeTools/complexityAnalyzer';

describe('ComplexityAnalyzer', () => {
  let analyzer: ComplexityAnalyzer;

  beforeEach(() => {
    // Mock context and output channel for non-VSCode test environment
    analyzer = new ComplexityAnalyzer();
    (analyzer as any).outputChannel = { clear: jest.fn(), show: jest.fn(), dispose: jest.fn() };
    (analyzer as any).reportService = { dispose: jest.fn() };
  });

  it('calculates cyclomatic complexity for simple code', () => {
    const code = 'if (a) { b(); }';
    expect(analyzer.calculateCyclomaticComplexity(code)).toBe(2);
  });

  it('calculates nesting depth for nested code', () => {
    const code = '{ if (a) { while (b) { c(); } } }';
    expect(analyzer.calculateNestingDepth(code)).toBeGreaterThanOrEqual(2);
  });

  it('analyzes function metrics', () => {
    const code = 'function foo() { if (a) { b(); } }';
    const result = analyzer.analyzeFunction(code, 'foo');
    expect(result.name).toBe('foo');
    expect(result.complexity).toBeGreaterThanOrEqual(2);
    expect(result.nestingDepth).toBeGreaterThanOrEqual(1);
    expect(result.linesOfCode).toBeGreaterThanOrEqual(1);
    expect(result.maintainabilityIndex).toBeLessThanOrEqual(100);
    expect(result.grade).toMatch(/[A-E]/);
  });

  it('analyzes code metrics', () => {
    const code = '// comment\nfunction bar() { return 1; }';
    const metrics = analyzer.analyzeMetrics(code);
    expect(metrics.cyclomaticComplexity).toBeGreaterThanOrEqual(1);
    expect(metrics.nestingDepth).toBeGreaterThanOrEqual(0);
    expect(metrics.linesOfCode).toBeGreaterThanOrEqual(1);
    expect(metrics.maintainabilityIndex).toBeLessThanOrEqual(100);
    expect(metrics.commentDensity).toBeGreaterThanOrEqual(0);
  });

  it('returns correct complexity grade', () => {
    expect(analyzer.getComplexityGrade(3)).toBe('A');
    expect(analyzer.getComplexityGrade(7)).toBe('B');
    expect(analyzer.getComplexityGrade(15)).toBe('C');
    expect(analyzer.getComplexityGrade(25)).toBe('D');
    expect(analyzer.getComplexityGrade(40)).toBe('E');
  });

  it('calculateMaintainabilityIndex returns value in range', () => {
    const code = 'function x() { return 1; }';
    const mi = analyzer.calculateMaintainabilityIndex(code);
    expect(mi).toBeGreaterThanOrEqual(0);
    expect(mi).toBeLessThanOrEqual(100);
  });

  it('dispose does not throw', () => {
    expect(() => analyzer.dispose()).not.toThrow();
  });
});
