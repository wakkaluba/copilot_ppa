import * as vscode from 'vscode';
import * as sinon from 'sinon';
import assert from 'assert';
import { ComplexityAnalyzer } from '../../../src/codeTools/complexityAnalyzer';

// Interface to define additional methods for testing that might not be in the actual class
interface ComplexityAnalyzerInterface {
  initialize(): Promise<void>;
  analyzeFile(): Promise<void>;
  analyzeComplexity(code: string, language: string): { 
      score: number; 
      details: { 
          cyclomaticComplexity: number; 
          functions: any[]; 
          conditionals: number; 
          loops: number; 
      } 
  };
  getComplexityHighlights(document: vscode.TextDocument): Array<{
      range: vscode.Range;
      decoration: any;
  }>;
  dispose(): void;
}

describe('Complexity Analyzer Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let complexityAnalyzer: ComplexityAnalyzer;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    complexityAnalyzer = new ComplexityAnalyzer();
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('analyzeComplexity', () => {
    it('should calculate cyclomatic complexity for JavaScript code', () => {
      const jsCode = `
        function calculateComplexity(value) {
          let result = 0;
          
          if (value < 0) {
            result = -1;
          } else if (value === 0) {
            result = 0;
          } else {
            for (let i = 0; i < value; i++) {
              if (i % 2 === 0) {
                result += i;
              } else {
                result += i * 2;
              }
            }
          }
          
          return result;
        }
      `;
      
      const result = (complexityAnalyzer as unknown as ComplexityAnalyzerInterface).analyzeComplexity(jsCode, 'javascript');
      
      // Verify complexity score is calculated
      assert(result.score > 0, 'Complexity score should be positive');
      // This function has multiple branches and a loop, so complexity should be higher
      assert(result.score >= 5, 'Complex function should have higher score');
      // Check that complexity details are provided
      assert(result.details.cyclomaticComplexity > 0, 'Cyclomatic complexity should be calculated');
      assert(result.details.functions.length === 1, 'Should identify one function');
      assert(result.details.conditionals > 0, 'Should count conditionals');
      assert(result.details.loops > 0, 'Should count loops');
    });
    
    it('should calculate lower complexity for simple code', () => {
      const simpleCode = `
        function simpleFunction(value) {
          return value * 2;
        }
      `;
      
      const result = (complexityAnalyzer as unknown as ComplexityAnalyzerInterface).analyzeComplexity(simpleCode, 'javascript');
      
      assert(result.score > 0, 'Complexity score should be positive');
      assert(result.score < 3, 'Simple function should have low score');
      assert(result.details.cyclomaticComplexity === 1, 'Simple function should have complexity of 1');
      assert(result.details.functions.length === 1, 'Should identify one function');
      assert(result.details.conditionals === 0, 'Should find no conditionals');
      assert(result.details.loops === 0, 'Should find no loops');
    });
    
    it('should handle different programming languages', () => {
      const tsCode = `
        function complexTs(value: number): number {
          let result = 0;
          
          switch(value) {
            case 0:
              return 0;
            case 1:
              return 1;
            default:
              for (let i = 0; i < value; i++) {
                result += i;
              }
              return result;
          }
        }
      `;
      
      const result = (complexityAnalyzer as unknown as ComplexityAnalyzerInterface).analyzeComplexity(tsCode, 'typescript');
      
      assert(result.score > 0, 'Complexity score should be calculated for TypeScript');
      assert(result.details.cyclomaticComplexity > 1, 'Should handle switch statements in complexity');
    });
  });
  
  describe('getComplexityHighlights', () => {
    it('should provide decorations for complex code sections', () => {
      const code = `
        function complexFunction(value) {
          let result = 0;
          
          if (value < 0) {
            return -1;
          }
          
          for (let i = 0; i < value; i++) {
            if (i % 2 === 0) {
              result += i;
            } else {
              result += i * 2;
            }
          }
          
          return result;
        }
        
        function simpleFunction(a, b) {
          return a + b;
        }
      `;
      
      const document = {
        getText: () => code,
        uri: { fsPath: 'test.js' },
        languageId: 'javascript'
      } as any as vscode.TextDocument;
      
      const highlights = (complexityAnalyzer as unknown as ComplexityAnalyzerInterface).getComplexityHighlights(document);
      
      assert(Array.isArray(highlights), 'Should return an array of highlights');
      assert(highlights.length > 0, 'Should find at least one highlight');
      
      // Verify the complex function has a highlight
      const complexFunctionHighlight = highlights.find(h => 
        h.range.start.line <= 1 && h.range.end.line >= 15
      );
      assert(complexFunctionHighlight, 'Should highlight the complex function');
      
      // Simple function should have a different decoration (or none)
      const simpleFunctionHighlight = highlights.find(h => 
        h.range.start.line >= 16 && h.range.end.line <= 18
      );
      
      if (simpleFunctionHighlight) {
        assert.notStrictEqual(
          simpleFunctionHighlight.decoration, 
          complexFunctionHighlight.decoration,
          'Simple function should have different decoration than complex function'
        );
      }
    });
  });
});