export type StaticAnalysisTool = 'eslint' | 'tslint' | 'prettier' | 'stylelint' | 'sonarqube' | 'custom';

export interface StaticAnalysisOptions {
    tool?: StaticAnalysisTool;
    path?: string;
    files?: string[];
    config?: Record<string, any>;
    ignorePatterns?: string[];
    configPath?: string;
    fix?: boolean;
}

export interface StaticAnalysisIssue {
    filePath: string;
    line: number;
    column: number;
    message: string;
    ruleId: string;
    severity: string;
    fix?: string;
    category?: string;
}

export interface StaticAnalysisResult {
    raw: string;
    issueCount: number;
    issues: StaticAnalysisIssue[];
}

// Re-export everything for convenience
export * from './StaticAnalysisTool';
