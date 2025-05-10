import { JavaScriptAnalyzer } from '../../performance/analyzers/javascriptAnalyzer';
import { PerformanceAnalysisResult } from '../../performance/types';

describe('JavaScriptAnalyzer', () => {
  let analyzer: JavaScriptAnalyzer;

  beforeEach(() => {
    analyzer = new JavaScriptAnalyzer();
  });

  describe('analyze', () => {
    it('should analyze JavaScript code and return results', () => {
      // Sample JavaScript code
      const jsCode = `
        function calculateTotal(items) {
          var total = 0;
          for (var i = 0; i < items.length; i++) {
            total += items[i];
          }
          return total;
        }

        var values = [1, 2, 3, 4, 5];
        var result = calculateTotal(values);
        console.log(result);
      `;

      const filePath = '/test/sample.js';

      // Call analyze method
      const result = analyzer.analyze(jsCode, filePath);

      // Check the structure of the result
      expect(result).toHaveProperty('filePath', filePath);
      expect(result).toHaveProperty('fileSize');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);

      // Metrics should have been calculated
      expect(result.metrics).toHaveProperty('cyclomaticComplexity');
      expect(result.metrics).toHaveProperty('maxNestingDepth');
    });

    it('should handle parse errors gracefully', () => {
      // Invalid JavaScript with syntax error
      const invalidCode = `
        function brokenFunction( {
          return 'missing closing parenthesis';
        }
      `;
      const filePath = '/test/broken.js';

      // Call analyze method
      const result = analyzer.analyze(invalidCode, filePath);

      // Should still return a result object
      expect(result).toHaveProperty('filePath', filePath);
      expect(result).toHaveProperty('issues');

      // Should report the parse error as an issue
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toHaveProperty('title', 'Parse Error');
      expect(result.issues[0]).toHaveProperty('severity', 'high');
    });

    it('should skip analysis for excluded files', () => {
      // Create an analyzer that excludes files with 'skip' in the path
      const analyzerWithExclusions = new JavaScriptAnalyzer({
        maxFileSize: 1024 * 1024,
        excludePatterns: ['**/skip/**'],
        includeTests: false,
        thresholds: {
          cyclomaticComplexity: [10, 20],
          nestedBlockDepth: [3, 5],
          functionLength: [50, 100],
          parameterCount: [4, 7],
          maintainabilityIndex: [65, 85],
          commentRatio: [10, 20]
        }
      });

      const jsCode = 'const x = 1;';
      const excludedFilePath = '/test/skip/file.js';

      // Call analyze method
      const result = analyzerWithExclusions.analyze(jsCode, excludedFilePath);

      // Should return basic result without detailed analysis
      expect(result.issues.length).toBe(0);
      expect(result.filePath).toBe(excludedFilePath);
    });
  });

  describe('private methods', () => {
    describe('analyzeAst', () => {
      it('should detect and measure code complexity', () => {
        // Code with high complexity
        const complexCode = `
          function complexFunction(a, b, c) {
            let result = 0;
            if (a > 0) {
              if (b > 0) {
                if (c > 0) {
                  result = a + b + c;
                } else {
                  result = a + b;
                }
              } else {
                result = a;
              }
            } else {
              result = 0;
            }
            return result;
          }
        `;

        // Parse and analyze the AST
        const ast = (analyzer as any).parseCode(complexCode, '/test/complex.js');
        const result: PerformanceAnalysisResult = {
          filePath: '/test/complex.js',
          fileSize: complexCode.length,
          issues: [],
          metrics: {
            cyclomaticComplexity: 0,
            maxNestingDepth: 0
          }
        };

        (analyzer as any).analyzeAst(ast, complexCode, result);

        // Should measure complexity
        expect(result.metrics.cyclomaticComplexity).toBeGreaterThan(1);
        expect(result.metrics.maxNestingDepth).toBeGreaterThanOrEqual(3);

        // Should detect complexity issues
        if (result.metrics.cyclomaticComplexity > 10) {
          expect(result.issues.some(i => i.title.includes('Complexity'))).toBe(true);
        }
      });
    });

    describe('analyzeFunctionComplexity', () => {
      it('should identify complex functions', () => {
        // Function with many parameters and statements
        const complexFunction = `
          function complexFunction(a, b, c, d, e, f, g, h) {
            let result = 0;
            if (a > b) result += a;
            if (b > c) result += b;
            if (c > d) result += c;
            if (d > e) result += d;
            if (e > f) result += e;
            if (f > g) result += f;
            if (g > h) result += g;
            return result;
          }
        `;

        const ast = (analyzer as any).parseCode(complexFunction, '/test/function.js');
        // Get the function node - simplified for test
        const functionNode = ast.program.body[0];

        const result: PerformanceAnalysisResult = {
          filePath: '/test/function.js',
          fileSize: complexFunction.length,
          issues: [],
          metrics: { parameterCount: 0 }
        };

        // Analyze the function complexity
        (analyzer as any).analyzeFunctionComplexity(functionNode, complexFunction, result);

        // Should detect an issue with too many parameters
        expect(result.metrics.parameterCount).toBeGreaterThan(4);
        const paramIssue = result.issues.find(i => i.title.includes('Parameter Count'));
        expect(paramIssue).toBeDefined();
      });
    });

    describe('getCodeContext', () => {
      it('should extract context around a position', () => {
        const code = 'line1\nline2\nline3\nline4\nline5';
        const position = code.indexOf('line3');

        const context = (analyzer as any).getCodeContext(code, position);

        expect(context).toContain('line3');
        expect(context.split('\n').length).toBeGreaterThan(1);
      });
    });

    describe('findLineNumber', () => {
      it('should calculate the correct line number for a position', () => {
        const code = 'line1\nline2\nline3\nline4\nline5';
        const position = code.indexOf('line3');

        const lineNumber = (analyzer as any).findLineNumber(code, position);

        expect(lineNumber).toBe(3); // Line numbers are often 1-based
      });
    });

    describe('createIssue', () => {
      it('should create a properly formatted issue object', () => {
        const issue = (analyzer as any).createIssue(
          'Test Issue',
          'This is a test issue',
          'medium',
          42,
          'const x = y;',
          'Use a better approach',
          'const x = z;'
        );

        expect(issue).toEqual({
          title: 'Test Issue',
          description: 'This is a test issue',
          severity: 'medium',
          line: 42,
          code: 'const x = y;',
          solution: 'Use a better approach',
          solutionCode: 'const x = z;'
        });
      });
    });
  });
});
