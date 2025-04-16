/**
 * Tests for the DesignIssue interface
 */
import { DesignIssue } from '../../../../src/services/codeQuality/designImprovementSuggester';

describe('DesignIssue interface', () => {
  it('should create a valid design issue object', () => {
    const issue: DesignIssue = {
      file: '/path/to/file.ts',
      line: 42,
      column: 5,
      severity: 'recommendation',
      description: 'This class has too many methods',
      improvement: 'Consider breaking it into smaller classes',
      category: 'patterns'
    };

    expect(issue).toBeDefined();
    expect(issue.file).toBe('/path/to/file.ts');
    expect(issue.line).toBe(42);
    expect(issue.column).toBe(5);
    expect(issue.severity).toBe('recommendation');
    expect(issue.description).toBe('This class has too many methods');
    expect(issue.improvement).toBe('Consider breaking it into smaller classes');
    expect(issue.category).toBe('patterns');
  });

  it('should allow different severity levels', () => {
    const criticalIssue: DesignIssue = createMockDesignIssue({
      severity: 'critical'
    });

    const recommendationIssue: DesignIssue = createMockDesignIssue({
      severity: 'recommendation'
    });

    const suggestionIssue: DesignIssue = createMockDesignIssue({
      severity: 'suggestion'
    });

    expect(criticalIssue.severity).toBe('critical');
    expect(recommendationIssue.severity).toBe('recommendation');
    expect(suggestionIssue.severity).toBe('suggestion');
  });

  it('should allow different issue categories', () => {
    const architectureIssue: DesignIssue = createMockDesignIssue({
      category: 'architecture'
    });

    const patternsIssue: DesignIssue = createMockDesignIssue({
      category: 'patterns'
    });

    const structureIssue: DesignIssue = createMockDesignIssue({
      category: 'structure'
    });

    const modularizationIssue: DesignIssue = createMockDesignIssue({
      category: 'modularization'
    });

    const couplingIssue: DesignIssue = createMockDesignIssue({
      category: 'coupling'
    });

    expect(architectureIssue.category).toBe('architecture');
    expect(patternsIssue.category).toBe('patterns');
    expect(structureIssue.category).toBe('structure');
    expect(modularizationIssue.category).toBe('modularization');
    expect(couplingIssue.category).toBe('coupling');
  });

  it('should work with React component issues', () => {
    const issue: DesignIssue = {
      file: '/src/components/ComplexComponent.tsx',
      line: 10,
      column: 1,
      severity: 'critical',
      description: 'React component is too large (350 lines)',
      improvement: 'Break this component into smaller, more focused components',
      category: 'structure'
    };

    expect(issue).toBeDefined();
    expect(issue.file).toContain('Component');
    expect(issue.severity).toBe('critical');
    expect(issue.description).toContain('React component');
    expect(issue.category).toBe('structure');
  });

  it('should work with dependency issues', () => {
    const issue: DesignIssue = {
      file: '/package.json',
      line: 1,
      column: 1,
      severity: 'recommendation',
      description: 'Multiple related dependencies for lodash',
      improvement: 'Consider consolidating related dependencies to reduce complexity',
      category: 'coupling'
    };

    expect(issue).toBeDefined();
    expect(issue.file).toBe('/package.json');
    expect(issue.description).toContain('dependencies');
    expect(issue.category).toBe('coupling');
  });
});

/**
 * Helper function to create mock design issues
 */
export function createMockDesignIssue(overrides?: Partial<DesignIssue>): DesignIssue {
  const defaultIssue: DesignIssue = {
    file: '/path/to/file.ts',
    line: 42,
    column: 5,
    severity: 'recommendation',
    description: 'This class has too many methods',
    improvement: 'Consider breaking it into smaller classes',
    category: 'patterns'
  };

  return { ...defaultIssue, ...overrides };
}