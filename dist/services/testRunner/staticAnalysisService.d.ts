import { ILogger } from '../../logging/ILogger';
import { IStaticAnalysisService } from './services/interfaces/IStaticAnalysisService';
import { StaticAnalysisOptions, StaticAnalysisTool, StaticAnalysisIssue, StaticAnalysisResult } from './services/StaticAnalysisTool';
import { TestResult } from './testRunnerTypes';
import { StaticAnalysisExecutor } from './services/StaticAnalysisExecutor';
export { StaticAnalysisOptions, StaticAnalysisTool, StaticAnalysisIssue, StaticAnalysisResult };
export declare class StaticAnalysisService implements IStaticAnalysisService {
    private readonly logger;
    private readonly executor;
    private readonly outputChannel;
    constructor(logger: ILogger, executor: StaticAnalysisExecutor);
    runESLint(options: StaticAnalysisOptions): Promise<TestResult>;
    runPrettier(options: StaticAnalysisOptions): Promise<TestResult>;
    runAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    private createErrorResult;
    private validateOptions;
    private isValidTool;
    private logIssues;
    dispose(): void;
}
