/**
 * Tests for Code Complexity analyzer interfaces
 */
import { ComplexityResult, FunctionComplexity } from '../../../../src/tools/codeComplexityAnalyzer';

describe('FunctionComplexity interface', () => {
  it('should create a valid function complexity object', () => {
    const functionComplexity: FunctionComplexity = {
      name: 'calculateTotal',
      complexity: 5,
      startLine: 10,
      endLine: 25,
      startColumn: 2,
      endColumn: 3
    };

    expect(functionComplexity).toBeDefined();
    expect(functionComplexity.name).toBe('calculateTotal');
    expect(functionComplexity.complexity).toBe(5);
    expect(functionComplexity.startLine).toBe(10);
    expect(functionComplexity.endLine).toBe(25);
    expect(functionComplexity.startColumn).toBe(2);
    expect(functionComplexity.endColumn).toBe(3);
  });

  it('should create a function complexity for an anonymous function', () => {
    const functionComplexity: FunctionComplexity = {
      name: '<anonymous>',
      complexity: 3,
      startLine: 30,
      endLine: 35,
      startColumn: 12,
      endColumn: 2
    };

    expect(functionComplexity).toBeDefined();
    expect(functionComplexity.name).toBe('<anonymous>');
    expect(functionComplexity.complexity).toBe(3);
  });

  it('should create a function complexity for a complex function', () => {
    const functionComplexity: FunctionComplexity = {
      name: 'processUserInput',
      complexity: 15, // High complexity
      startLine: 42,
      endLine: 142,
      startColumn: 0,
      endColumn: 1
    };

    expect(functionComplexity).toBeDefined();
    expect(functionComplexity.name).toBe('processUserInput');
    expect(functionComplexity.complexity).toBe(15);
    expect(functionComplexity.startLine).toBe(42);
    expect(functionComplexity.endLine).toBe(142);
  });
});

describe('ComplexityResult interface', () => {
  it('should create a valid complexity result for a file', () => {
    const functions: FunctionComplexity[] = [
      {
        name: 'function1',
        complexity: 3,
        startLine: 10,
        endLine: 20,
        startColumn: 2,
        endColumn: 3
      },
      {
        name: 'function2',
        complexity: 5,
        startLine: 25,
        endLine: 40,
        startColumn: 2,
        endColumn: 3
      }
    ];

    const result: ComplexityResult = {
      filePath: '/project/src/file.ts',
      fileName: 'file.ts',
      totalComplexity: 8,
      functions,
      averageComplexity: 4
    };

    expect(result).toBeDefined();
    expect(result.filePath).toBe('/project/src/file.ts');
    expect(result.fileName).toBe('file.ts');
    expect(result.totalComplexity).toBe(8);
    expect(result.functions).toHaveLength(2);
    expect(result.functions[0].name).toBe('function1');
    expect(result.functions[1].name).toBe('function2');
    expect(result.averageComplexity).toBe(4);
  });

  it('should create a complexity result for an empty file', () => {
    const result: ComplexityResult = {
      filePath: '/project/src/empty.ts',
      fileName: 'empty.ts',
      totalComplexity: 0,
      functions: [],
      averageComplexity: 0
    };

    expect(result).toBeDefined();
    expect(result.filePath).toBe('/project/src/empty.ts');
    expect(result.fileName).toBe('empty.ts');
    expect(result.totalComplexity).toBe(0);
    expect(result.functions).toHaveLength(0);
    expect(result.averageComplexity).toBe(0);
  });

  it('should create a complexity result for a highly complex file', () => {
    const functions: FunctionComplexity[] = [
      {
        name: 'complexFunction1',
        complexity: 20,
        startLine: 10,
        endLine: 100,
        startColumn: 0,
        endColumn: 1
      },
      {
        name: 'complexFunction2',
        complexity: 25,
        startLine: 110,
        endLine: 200,
        startColumn: 0,
        endColumn: 1
      },
      {
        name: 'simpleFunction',
        complexity: 1,
        startLine: 210,
        endLine: 220,
        startColumn: 0,
        endColumn: 1
      }
    ];

    const result: ComplexityResult = {
      filePath: '/project/src/complex.ts',
      fileName: 'complex.ts',
      totalComplexity: 46,
      functions,
      averageComplexity: 15.33
    };

    expect(result).toBeDefined();
    expect(result.filePath).toBe('/project/src/complex.ts');
    expect(result.fileName).toBe('complex.ts');
    expect(result.totalComplexity).toBe(46);
    expect(result.functions).toHaveLength(3);
    expect(result.averageComplexity).toBeCloseTo(15.33, 2);
  });
});

/**
 * Mock factory functions for code complexity interfaces
 */

export function createMockFunctionComplexity(overrides?: Partial<FunctionComplexity>): FunctionComplexity {
  const defaultComplexity: FunctionComplexity = {
    name: 'mockFunction',
    complexity: 4,
    startLine: 10,
    endLine: 20,
    startColumn: 0,
    endColumn: 2
  };

  return { ...defaultComplexity, ...overrides };
}

export function createMockComplexityResult(overrides?: Partial<ComplexityResult>): ComplexityResult {
  const functions = [
    createMockFunctionComplexity(),
    createMockFunctionComplexity({
      name: 'anotherFunction',
      complexity: 8,
      startLine: 25,
      endLine: 40
    })
  ];

  const defaultResult: ComplexityResult = {
    filePath: '/mock/src/mockFile.ts',
    fileName: 'mockFile.ts',
    totalComplexity: 12,
    functions,
    averageComplexity: 6
  };

  return { ...defaultResult, ...overrides };
}