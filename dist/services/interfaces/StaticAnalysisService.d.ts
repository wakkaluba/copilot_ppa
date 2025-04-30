import { TestResult } from '../../testRunner/testTypes';
import { StaticAnalysisOptions } from './StaticAnalysisOptions';
export interface StaticAnalysisService {
    runESLintAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    runPrettierAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
}
