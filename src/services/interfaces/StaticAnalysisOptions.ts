export interface StaticAnalysisOptions {
    files: string[];
    fix?: boolean;
    configPath?: string;
}

export interface ESLintIssue {
    filePath: string;
    line: number;
    column: number;
    message: string;
    ruleId: string;
    severity: number;
}