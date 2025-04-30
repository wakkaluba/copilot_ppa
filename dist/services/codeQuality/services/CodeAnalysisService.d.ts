import * as vscode from 'vscode';
import { CodeAnalysis } from '../types';
export declare class CodeAnalysisService {
    private readonly context;
    private readonly logger;
    constructor(context: vscode.ExtensionContext);
    analyzeFile(filePath: string): Promise<CodeAnalysis>;
    dispose(): void;
}
