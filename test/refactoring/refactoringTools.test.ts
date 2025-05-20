import { RefactoringTools } from '../../src/codeTools/refactoringTools';

describe('RefactoringTools', () => {
  let tools: RefactoringTools;

  beforeEach(() => {
    tools = new RefactoringTools();
  });

  it('should instantiate without errors', () => {
    expect(tools).toBeInstanceOf(RefactoringTools);
  });

  it('should have a method to initialize', () => {
    expect(typeof tools.initialize).toBe('function');
  });

  it('should have a method to get suggestions', () => {
    expect(typeof tools.getSuggestions).toBe('function');
  });

  it('should handle getSuggestions with empty input', () => {
    expect(() => tools.getSuggestions('')).not.toThrow();
    expect(tools.getSuggestions('')).toBeDefined();
  });

  it('should handle getSuggestions with code input', () => {
    const code = 'function foo() { return 42; }';
    const suggestions = tools.getSuggestions(code);
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
