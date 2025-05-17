import * as vscode from 'vscode';
import { AnalyzerFactory } from '../analyzers/analyzerFactory';

export type PerformanceAnalysisResult = {
  filePath: string;
  issues: any[];
  skipped?: boolean;
  metrics?: Record<string, number>;
  skipReason?: string;
};
export type AnalyzerConfiguration = {
  minSeverity: 'error' | 'critical' | 'warning' | 'info';
  maxFileSizeKB: number;
};
export type PerformanceMetrics = {
  lastAnalysisTime: number;
  totalIssuesFound: number;
  issuesByType: {
    performance: number;
    'memory-leak': number;
    'cpu-intensive': number;
    'memory-management': number;
  };
};

export class PerformanceAnalyzerService {
  private readonly analyzerFactory: AnalyzerFactory;
  private metrics: PerformanceMetrics = {
    lastAnalysisTime: 0,
    totalIssuesFound: 0,
    issuesByType: {
      performance: 0,
      'memory-leak': 0,
      'cpu-intensive': 0,
      'memory-management': 0,
    },
  };
  private configuration: AnalyzerConfiguration = {
    minSeverity: 'info',
    maxFileSizeKB: 1000,
  };
  private analysisCache: Map<string, PerformanceAnalysisResult> = new Map();

  constructor(
    private readonly context: vscode.ExtensionContext,
    analyzerFactory?: AnalyzerFactory,
  ) {
    this.analyzerFactory = analyzerFactory ?? AnalyzerFactory.getInstance();
  }

  public hasAnalyzer(language: string): boolean {
    return this.analyzerFactory.hasAnalyzer(language);
  }

  public canAnalyze(fileExtension: string): boolean {
    return this.analyzerFactory.getSupportedExtensions().includes(fileExtension);
  }

  public async analyzeDocument(document: vscode.TextDocument): Promise<PerformanceAnalysisResult> {
    // Defensive: check for fileName and getText
    if (
      !document ||
      typeof document.getText !== 'function' ||
      (!document.fileName && !(document as any).uri)
    ) {
      return {
        filePath: document?.fileName ?? (document as any)?.uri?.toString?.() ?? '',
        issues: [],
        skipped: true,
        skipReason: 'Missing fileName or getText on document',
      };
    }

    // Use uri.toString() as cache key if available, else fallback to fileName
    const fileKey = (document as any).uri?.toString?.() ?? document.fileName;
    if (this.analysisCache.has(fileKey)) {
      return this.analysisCache.get(fileKey)!;
    }
    const startTime = Date.now();
    try {
      // Check file size
      const fileSize = Buffer.from(document.getText()).length / 1024;
      if (fileSize > this.configuration.maxFileSizeKB) {
        const result: PerformanceAnalysisResult = {
          filePath: document.fileName,
          issues: [],
          skipped: true,
          skipReason: `File size (${fileSize}KB) exceeds limit (${this.configuration.maxFileSizeKB}KB)`,
        };
        this.analysisCache.set(fileKey, result);
        return result;
      }

      const analyzer = this.analyzerFactory.getAnalyzer(document.fileName);
      if (!analyzer) {
        const result: PerformanceAnalysisResult = {
          filePath: document.fileName,
          issues: [],
          skipped: true,
          skipReason: 'No analyzer available for this file type',
        };
        this.analysisCache.set(fileKey, result);
        return result;
      }

      // analyzer.analyze expects (fileContent, filePath)
      const fileContent = document.getText();
      const result = await Promise.resolve(analyzer.analyze(fileContent, document.fileName));
      if (result == null) {
        return {
          filePath: document.fileName,
          issues: [],
          skipped: true,
          skipReason: 'Analyzer returned null or undefined',
        };
      }
      // Ensure 'skipped' is always boolean
      if (typeof result.skipped === 'undefined') {
        result.skipped = false;
      }
      this.analysisCache.set(fileKey, result);
      return result;
    } catch (error) {
      // Ensure error path returns a consistent result
      return {
        filePath: document.fileName,
        issues: [],
        skipped: true,
        skipReason: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.metrics.lastAnalysisTime = Date.now() - startTime;
    }
  }

  public clearCache(): void {
    this.analysisCache.clear();
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public setConfiguration(config: Partial<AnalyzerConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }

  public generateRecommendations(result: PerformanceAnalysisResult): string[] {
    return result.issues.map((issue) => {
      switch (issue.type) {
        case 'performance':
          return `Consider using a Set for faster lookups`;
        case 'memory-leak':
          return `Consider implementing proper cleanup in intervals/timeouts`;
        case 'cpu-intensive':
          return `Consider memoization or dynamic programming approach`;
        case 'memory-management':
          return `Consider implementing a cache eviction policy`;
        default:
          return `Review the ${issue.type} issue`;
      }
    });
  }

  public getOptimizationExamples(
    result: PerformanceAnalysisResult,
  ): Array<{ original: string; optimized: string }> {
    return result.issues.map((issue) => {
      switch (issue.type) {
        case 'performance':
          return {
            original: 'const items = []; for(let i = 0; i < 1000; i++) { items.push(i); }',
            optimized: 'const items = Array(1000).fill().map((_, i) => i);',
          };
        default:
          return {
            original: issue.code || '',
            optimized: 'Optimization example not available',
          };
      }
    });
  }

  private getSeverityLevel(severity: string): number {
    const levels: Record<string, number> = {
      error: 4,
      critical: 3,
      warning: 2,
      info: 1,
    };
    return levels[severity] ?? 0;
  }
}
