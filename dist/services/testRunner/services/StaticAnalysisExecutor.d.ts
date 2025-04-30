import * as vscode from 'vscode';
import { StaticAnalysisOptions, StaticAnalysisResult } from './StaticAnalysisTool';
import { ILogger } from '../../logging/ILogger';
export declare class StaticAnalysisExecutor implements vscode.Disposable {
    private readonly logger;
    private readonly outputChannel;
    constructor(logger: ILogger, outputChannel: vscode.OutputChannel);
    execute(options: StaticAnalysisOptions): Promise<StaticAnalysisResult>;
    private resolveTool;
    private buildCommand;
    private buildSonarOptions;
    private executeCommand;
    private processResult;
    private processESLintOutput;
    private processPrettierOutput;
    private processStylelintOutput;
    private processSonarQubeOutput;
    dispose(): void;
}
