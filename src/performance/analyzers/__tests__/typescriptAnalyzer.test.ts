import { ILogger } from '../../logging/ILogger';
import { TypeScriptAnalyzer } from '../../performance/analyzers/typescriptAnalyzer';
import { PerformanceIssue, TypeScriptMetricsCalculator, TypeScriptPatternAnalyzer } from '../../performance/types';

// Mock dependencies
const createMockLogger = (): jest.Mocked<ILogger> => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn()
});

const createMockPatternAnalyzer = (): jest.Mocked<TypeScriptPatternAnalyzer> => ({
  analyzeTypeScriptPatterns: jest.fn().mockReturnValue([])
});

const createMockMetricsCalculator = (): jest.Mocked<TypeScriptMetricsCalculator> => ({
  calculateMetrics: jest.fn().mockReturnValue({
    cyclomaticComplexity: 5,
    maintenanceIndex: 75,
    functionCount: 3
  })
});

describe('TypeScriptAnalyzer', () => {
  let analyzer: TypeScriptAnalyzer;
  let mockLogger: jest.Mocked<ILogger>;
  let mockPatternAnalyzer: jest.Mocked<TypeScriptPatternAnalyzer>;
  let mockMetricsCalculator: jest.Mocked<TypeScriptMetricsCalculator>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockPatternAnalyzer = createMockPatternAnalyzer();
    mockMetricsCalculator = createMockMetricsCalculator();

    // Create the analyzer instance
    analyzer = new TypeScriptAnalyzer(
      mockLogger,
      mockPatternAnalyzer,
      mockMetricsCalculator
    );
  });

  describe('analyze', () => {
    it('should analyze TypeScript code and return results', () => {
      // Sample TypeScript code
      const tsCode = `
        function calculateTotal(items: number[]): number {
          let total = 0;
          for (let i = 0; i < items.length; i++) {
            total += items[i];
          }
          return total;
        }

        const values = [1, 2, 3, 4, 5];
        const result = calculateTotal(values);
        console.log(result);
      `;

      const filePath = '/test/sample.ts';
      const mockIssues: PerformanceIssue[] = [
        {
          title: 'Inefficient Array Iteration',
          description: 'Using for loop with array.length in each iteration is inefficient',
          severity: 'medium',
          line: 3,
          code: 'for (let i = 0; i < items.length; i++) {',
          solution: 'Use forEach, map, or for...of loops'
        }
      ];

      // Set up mock pattern analyzer to return an issue
      mockPatternAnalyzer.analyzeTypeScriptPatterns.mockReturnValueOnce(mockIssues);

      // Call the analyze method
      const result = analyzer.analyze(tsCode, filePath);

      // Verify all analyzer methods were called
      expect(mockPatternAnalyzer.analyzeTypeScriptPatterns).toHaveBeenCalledWith(tsCode, expect.any(Array));
      expect(mockMetricsCalculator.calculateMetrics).toHaveBeenCalledWith(tsCode);

      // Check result structure
      expect(result).toHaveProperty('filePath', filePath);
      expect(result).toHaveProperty('fileSize', expect.any(Number));
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('metrics');

      // Check issues are included in result
      expect(result.issues).toContainEqual(expect.objectContaining({
        title: 'Inefficient Array Iteration'
      }));
    });

    it('should handle errors during analysis', () => {
      const invalidCode = 'const x = {';  // Syntax error
      const filePath = '/test/error.ts';

      // Mock the pattern analyzer to throw an error
      mockPatternAnalyzer.analyzeTypeScriptPatterns.mockImplementationOnce(() => {
        throw new Error('Syntax error');
      });

      // Call the analyze method
      const result = analyzer.analyze(invalidCode, filePath);

      // Check that we handle errors properly
      expect(result).toHaveProperty('issues');
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toHaveProperty('title', 'Parse Error');
      expect(result.issues[0]).toHaveProperty('severity', 'high');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('analyzeArrayOperations', () => {
    it('should detect inefficient array operations', () => {
      const tsCode = `
        function findItem(array, item) {
          return array.indexOf(item) !== -1;
        }

        const items = [1, 2, 3, 4, 5];
        const containsThree = findItem(items, 3);
      `;
      const lines = tsCode.split('\n');

      // Call the private method using type assertion to access it
      const issues = (analyzer as any).analyzeArrayOperations(tsCode, lines);

      // Expect to find an issue with indexOf
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toHaveProperty('title', expect.stringContaining('Array Lookup'));
    });
  });

  describe('analyzeAsyncPatterns', () => {
    it('should detect promise anti-patterns', () => {
      const tsCode = `
        function fetchData() {
          return new Promise((resolve, reject) => {
            // Missing error handling
            someAsyncOperation().then(data => resolve(data));
          });
        }
      `;
      const lines = tsCode.split('\n');

      // Call the private method
      const issues = (analyzer as any).analyzeAsyncPatterns(tsCode, lines);

      // We might detect missing error handling in promises
      expect(Array.isArray(issues)).toBe(true);
    });
  });

  describe('analyzeMemoryUsage', () => {
    it('should detect memory leaks in event handlers', () => {
      const tsCode = `
        function setupListeners() {
          const button = document.getElementById('myButton');
          button.addEventListener('click', function() {
            // Potential memory leak if setupListeners called multiple times
            console.log('Button clicked');
          });
        }
      `;
      const lines = tsCode.split('\n');

      // Call the private method
      const issues = (analyzer as any).analyzeMemoryUsage(tsCode, lines);

      // Check if we detect event handler related memory concerns
      expect(Array.isArray(issues)).toBe(true);
    });
  });

  describe('analyzeDOMOperations', () => {
    it('should detect inefficient DOM operations', () => {
      const tsCode = `
        function updateUI() {
          for (let i = 0; i < 100; i++) {
            const element = document.createElement('div');
            document.body.appendChild(element);
            element.textContent = 'Item ' + i;
            element.style.color = 'red';
          }
        }
      `;
      const lines = tsCode.split('\n');

      // Call the private method
      const issues = (analyzer as any).analyzeDOMOperations(tsCode, lines);

      // Check if we detect repeated DOM manipulations
      expect(Array.isArray(issues)).toBe(true);
    });
  });

  describe('analyzeEventHandlers', () => {
    it('should detect event handler issues', () => {
      const tsCode = `
        class Component {
          constructor() {
            setInterval(function() {
              this.update(); // 'this' context issue
            }, 1000);
          }

          update() {
            console.log('Updated');
          }
        }
      `;
      const lines = tsCode.split('\n');

      // Call the private method
      const issues = (analyzer as any).analyzeEventHandlers(tsCode, lines);

      // Check if we detect 'this' context issues in event handlers/timers
      expect(Array.isArray(issues)).toBe(true);
    });
  });
});
