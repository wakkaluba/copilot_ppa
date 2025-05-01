import * as vscode from 'vscode';
import { AnalysisResult } from '../types';

export interface ICodeAnalyzer {
    analyzeDocument(document: vscode.TextDocument): Promise<AnalysisResult>;
    dispose(): void;
}
