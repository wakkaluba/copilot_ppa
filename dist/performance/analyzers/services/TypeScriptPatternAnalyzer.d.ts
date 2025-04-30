import { ILogger } from '../../../logging/ILogger';
import { PerformanceIssue } from '../../types';
export declare class TypeScriptPatternAnalyzer {
    private readonly logger;
    constructor(logger: ILogger);
    analyzeTypeScriptPatterns(fileContent: string, lines: string[]): PerformanceIssue[];
    private checkAnyTypeUsage;
    private findLineNumber;
    private extractCodeSnippet;
}
