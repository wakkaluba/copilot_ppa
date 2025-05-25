// Remove unused import

// Only export the metrics logic for testability
export interface ICodeMetrics {
  cyclomaticComplexity: number;
  nestingDepth: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  commentDensity?: number;
}

export interface IFunctionAnalysis {
  name: string;
  complexity: number;
  nestingDepth: number;
  linesOfCode: number;
  maintainabilityIndex: number;
  grade: string;
}

export class ComplexityAnalyzer {
  // Remove VSCode/service dependencies for testability
  constructor() {}

  public calculateCyclomaticComplexity(code: string): number {
    let complexity = 1;
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*\{/g,
      /\bfor\s*\(/g,
      /\bcase\s+[^:]+:/g,
      /\bcatch\s*\(/g,
      /\breturn\s+.+\?/g,
      /&&|\|\|/g,
    ];
    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    return complexity;
  }

  public calculateNestingDepth(code: string): number {
    // Improved: count all open/close braces per character, not per line
    let currentDepth = 0;
    let maxDepth = 0;
    for (const char of code) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      if (char === '}' || char === ')' || char === ']') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
    return maxDepth;
  }

  public analyzeFunction(code: string, functionName: string): IFunctionAnalysis {
    const functionRegex = new RegExp(
      `(?:function|class|const|let|var)\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`,
      'g',
    );
    const methodRegex = new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`, 'g');
    const functionMatch = functionRegex.exec(code) || methodRegex.exec(code);
    const functionCode = functionMatch ? functionMatch[0] : code;
    const complexity = this.calculateCyclomaticComplexity(functionCode);
    const nestingDepth = this.calculateNestingDepth(functionCode);
    const linesOfCode = functionCode.split('\n').length;
    const maintainabilityIndex = this.calculateMaintainabilityIndex(functionCode);
    return {
      name: functionName,
      complexity,
      nestingDepth,
      linesOfCode,
      maintainabilityIndex,
      grade: this.getComplexityGrade(complexity),
    };
  }

  public analyzeMetrics(code: string): ICodeMetrics {
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    const nestingDepth = this.calculateNestingDepth(code);
    const linesOfCode = code.split('\n').length;
    const maintainabilityIndex = this.calculateMaintainabilityIndex(code);
    const commentLines = (code.match(/\/\/.*$|\/\*[\s\S]*?\*\//gm) || []).length;
    const commentDensity = linesOfCode ? (commentLines / linesOfCode) * 100 : 0;
    return {
      cyclomaticComplexity,
      nestingDepth,
      maintainabilityIndex,
      linesOfCode,
      commentDensity,
    };
  }

  public calculateMaintainabilityIndex(code: string): number {
    const complexity = this.calculateCyclomaticComplexity(code);
    const linesOfCode = code.split('\n').length;
    let mi = 100 - complexity * 0.25 - Math.log(linesOfCode) * 15;
    if (complexity > 30) {
      mi -= (complexity - 30) * 0.5;
    }
    if (linesOfCode > 1000) {
      mi -= (linesOfCode - 1000) * 0.01;
    }
    return Math.max(0, Math.min(100, mi));
  }

  public getComplexityGrade(complexity: number): string {
    if (complexity <= 5) return 'A';
    if (complexity <= 10) return 'B';
    if (complexity <= 20) return 'C';
    if (complexity <= 30) return 'D';
    return 'E';
  }

  public dispose(): void {
    // No-op for testable version
  }
}
