import { StaticAnalysisService } from '../../services/interfaces/StaticAnalysisService';
import { StaticAnalysisOptions } from '../../services/interfaces/StaticAnalysisOptions';
import { TestResult } from '../../testRunner/testTypes';
export declare class StaticAnalysisServiceImpl implements StaticAnalysisService {
    private eslintInstance;
    private useRealEslint;
    private useRealPrettier;
    private prettier;
    constructor();
    private initializeLinters;
    runESLintAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    runPrettierAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    private lintFiles;
    private convertMockResults;
    private checkFormatting;
    private formatIssuesDetails;
    private formatPrettierDetails;
}
