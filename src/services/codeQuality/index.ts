import { IBestPracticeIssue, IBestPracticesChecker } from './bestPracticesChecker';
import { ICodeReviewComment, ICodeReviewer, ICodeReviewReport } from './codeReviewer';
import { IDesignImprovementSuggester, IDesignIssue } from './designImprovementSuggester';
import { ISecurityIssue, ISecurityScanner } from './securityScanner';
import { ICodeMetrics, ICodeQualityConfig, IQualityIssue, IQualitySnapshot } from './types';

export {
    IBestPracticeIssue as BestPracticeIssue, IBestPracticesChecker as BestPracticesChecker, ICodeOptimizer as CodeOptimizer, ICodeReviewComment as CodeReviewComment, ICodeReviewer as CodeReviewer, ICodeReviewReport as CodeReviewReport,
    IDesignImprovementSuggester as DesignImprovementSuggester,
    IDesignIssue as DesignIssue, IOptimizationIssue as OptimizationIssue, ISecurityIssue as SecurityIssue, ISecurityScanner as SecurityScanner
};

    export type {
        ICodeMetrics as CodeMetrics,
        ICodeQualityConfig as CodeQualityConfig,
        IQualityIssue as QualityIssue,
        IQualitySnapshot as QualitySnapshot
    };

export interface ICodeAnalyzer {
  analyzeDocument(document: import('vscode').TextDocument): Promise<IQualityIssue[]>;
}

export class CodeQualityService {
  private _securityScanner: SecurityScanner;
  private _codeOptimizer: CodeOptimizer;
  private _bestPracticesChecker: BestPracticesChecker;
  private _codeReviewer: CodeReviewer;
  private _designImprovementSuggester: DesignImprovementSuggester;
  private _qualityHistory: Map<string, QualitySnapshot[]>;
  private _config: CodeQualityConfig;
  private readonly _logger: Logger;

  constructor(context: import('vscode').ExtensionContext) {
    this._logger = new Logger('CodeQualityService');
    this._securityScanner = new SecurityScanner(context);
    this._codeOptimizer = new CodeOptimizer(context);
    this._bestPracticesChecker = new BestPracticesChecker(context, this._logger);
    this._codeReviewer = new CodeReviewer(context);
    this._designImprovementSuggester = new DesignImprovementSuggester(context);
    this._qualityHistory = new Map();
    this._config = {
      severityLevels: {
        security: 'error',
        style: 'warning',
        performance: 'info',
      },
      ignorePatterns: [],
      excludeTypes: [],
    };
  }

  public getSecurityScanner(): SecurityScanner {
    return this._securityScanner;
  }

  public getCodeOptimizer(): CodeOptimizer {
    return this._codeOptimizer;
  }

  public getBestPracticesChecker(): BestPracticesChecker {
    return this._bestPracticesChecker;
  }

  public getCodeReviewer(): CodeReviewer {
    return this._codeReviewer;
  }

  public getDesignImprovementSuggester(): DesignImprovementSuggester {
    return this._designImprovementSuggester;
  }

  public configure(config: Partial<CodeQualityConfig>): void {
    this._config = { ...this._config, ...config };
  }

  public async analyzeCode(document: import('vscode').TextDocument): Promise<IQualityIssue[]> {
    const allIssues: IQualityIssue[] = [];

    try {
      const [securityIssues, optimizationIssues, practiceIssues] = await Promise.all([
        this._securityScanner.analyzeDocument(document),
        this._codeOptimizer.analyzeDocument(document),
        this._bestPracticesChecker.analyzeDocument(document),
      ]);

      allIssues.push(
        ...this.applySeverityLevels(securityIssues),
        ...this.applySeverityLevels(optimizationIssues),
        ...this.applySeverityLevels(practiceIssues),
      );

      // Filter based on configuration
      return this.filterIssues(allIssues);
    } catch (error) {
      console.error('Error analyzing code:', error);
      return [];
    }
  }

  public async updateQualityHistory(document: import('vscode').TextDocument): Promise<void> {
    const issues = await this.analyzeCode(document);
    const metrics = await this.calculateMetrics(document);

    const snapshot: QualitySnapshot = {
      timestamp: new Date(),
      issues,
      metrics,
      score: this.calculateQualityScore(issues, metrics),
    };

    const key = document.uri.toString();
    if (!this._qualityHistory.has(key)) {
      this._qualityHistory.set(key, []);
    }
    this._qualityHistory.get(key)!.push(snapshot);
  }

  public getQualityTrends(uri: import('vscode').Uri): QualitySnapshot[] {
    return this._qualityHistory.get(uri.toString()) || [];
  }

  private applySeverityLevels(issues: IQualityIssue[]): IQualityIssue[] {
    return issues.map((issue) => ({
      ...issue,
      severity: this._config.severityLevels[issue.type] || issue.severity,
    }));
  }

  private filterIssues(issues: IQualityIssue[]): IQualityIssue[] {
    return issues.filter(
      (issue) =>
        !this._config.excludeTypes.includes(issue.type) &&
        !this._config.ignorePatterns.some((pattern) =>
          issue.message.toLowerCase().includes(pattern.toLowerCase()),
        ),
    );
  }

  private calculateQualityScore(issues: IQualityIssue[], metrics: ICodeMetrics): number {
    // Weight different factors to calculate a score from 0-100
    const issueScore = Math.max(0, 100 - issues.length * 5);
    const complexityScore = Math.max(0, 100 - metrics.complexity * 10);
    const maintainabilityScore = metrics.maintainability;

    return Math.round((issueScore + complexityScore + maintainabilityScore) / 3);
  }

  public async calculateMetrics(document: import('vscode').TextDocument): Promise<ICodeMetrics> {
    const text = document.getText();

    // Calculate cyclomatic complexity
    const complexity = this.calculateComplexity(text);

    // Calculate maintainability index (0-100)
    const maintainability = this.calculateMaintainability(text);

    // Calculate performance score
    const performance = await this.calculatePerformance(document);

    return { complexity, maintainability, performance };
  }

  private calculateComplexity(text: string): number {
    let complexity = 1; // Base complexity
    const patterns = [
      /\bif\b/g, // if statements
      /\belse\s+if\b/g, // else if
      /\bfor\b/g, // for loops
      /\bwhile\b/g, // while loops
      /\bdo\b/g, // do-while loops
      /\bswitch\b/g, // switch statements
      /\bcatch\b/g, // try-catch blocks
      /\breturn\b/g, // return statements
      /\band\b/g, // logical AND
      /\bor\b/g, // logical OR
      /&&/g, // && operator
      /\|\|/g, // || operator
      /\?/g, // ternary operator
    ];

    // Add complexity for each control flow statement and operator
    patterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    // Add complexity for function declarations/expressions
    const functionMatches = text.match(/\bfunction\b|\b=>\b/g);
    if (functionMatches) {
      complexity += functionMatches.length;
    }

    return complexity;
  }

  private calculateMaintainability(text: string): number {
    // Simplified maintainability calculation
    const lines = text.split('\n').length;
    const commentLines = text
      .split('\n')
      .filter((line) => line.trim().startsWith('//') || line.trim().startsWith('/*')).length;
    const codeLines = lines - commentLines;

    // Factors affecting maintainability:
    // 1. Comment ratio (0-30 points)
    const commentScore = Math.min(30, (commentLines / codeLines) * 100);

    // 2. Average line length (0-30 points)
    const avgLineLength = text.length / lines;
    const lengthScore = Math.max(0, 30 - (avgLineLength - 80) * 0.5);

    // 3. Code structure (0-40 points)
    const complexity = this.calculateComplexity(text);
    const complexityScore = Math.max(0, 40 - complexity * 2);

    return Math.round(commentScore + lengthScore + complexityScore);
  }

  private async calculatePerformance(document: import('vscode').TextDocument): Promise<number> {
    // Get performance issues from optimizer
    const issues = await this._codeOptimizer.analyzeDocument(document);
    const performanceIssues = issues.filter((i) => i.type === 'performance');

    // Start with 100 and deduct points for each performance issue
    return Math.max(0, 100 - performanceIssues.length * 10);
  }
}
