// Migrated from orphaned-code
import * as vscode from 'vscode';
import { ArchitectureAnalysisService } from './services/ArchitectureAnalysisService';
import { DesignDiagnosticService } from './services/DesignDiagnosticService';
import { LanguageDesignAnalyzer } from './services/LanguageDesignAnalyzer';

export interface DesignIssue {
  file: string;
  line: number;
  column: number;
  severity: 'suggestion' | 'recommendation' | 'critical';
  description: string;
  improvement: string;
  category: 'architecture' | 'patterns' | 'structure' | 'modularization' | 'coupling';
}

export class DesignImprovementSuggester {
  private languageAnalyzer: LanguageDesignAnalyzer;
  private architectureService: ArchitectureAnalysisService;
  private diagnosticService: DesignDiagnosticService;

  constructor(context: vscode.ExtensionContext) {
    this.languageAnalyzer = new LanguageDesignAnalyzer();
    this.architectureService = new ArchitectureAnalysisService();
    this.diagnosticService = new DesignDiagnosticService(context);
  }

  public async analyzeDesign(document: vscode.TextDocument): Promise<DesignIssue[]> {
    const issues = await this.languageAnalyzer.analyze(document);
    this.diagnosticService.report(document, issues);
    return issues;
  }

  public async analyzeWorkspaceArchitecture(): Promise<DesignIssue[]> {
    const issues = await this.architectureService.analyzeWorkspace();
    return issues;
  }

  public suggestArchitecturalPatterns(codebase: string): string[] {
    return this.architectureService.suggestPatterns(codebase);
  }
}
