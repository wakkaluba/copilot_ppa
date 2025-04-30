import { TestResult } from '../../testRunnerTypes';
import { StaticAnalysisOptions } from '../../staticAnalysisService';
export interface IStaticAnalysisService extends vscode.Disposable {
    runESLint(options: StaticAnalysisOptions): Promise<TestResult>;
    runPrettier(options: StaticAnalysisOptions): Promise<TestResult>;
    runAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
}
