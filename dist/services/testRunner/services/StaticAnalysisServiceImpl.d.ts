import * as vscode from 'vscode';
import { TestResult } from '../testRunnerTypes';
import { StaticAnalysisOptions } from '../staticAnalysisService';
import { ILogger } from '../../logging/ILogger';
export declare class StaticAnalysisServiceImpl implements vscode.Disposable {
    private readonly logger;
    private readonly outputChannel;
    constructor(logger: ILogger, outputChannel: vscode.OutputChannel);
    runESLint(options: StaticAnalysisOptions): Promise<TestResult>;
    runPrettier(options: StaticAnalysisOptions): Promise<TestResult>;
    runAnalysis(options: StaticAnalysisOptions): Promise<TestResult>;
    private createErrorResult;
    dispose(): void;
}
