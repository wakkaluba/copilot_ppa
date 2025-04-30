import * as vscode from 'vscode';
import { ILanguageAnalyzer } from './ILanguageAnalyzer';
export declare class TypeScriptAnalyzer implements ILanguageAnalyzer {
    findUnusedCode(document: vscode.TextDocument, selection?: vscode.Selection): Promise<vscode.Diagnostic[]>;
    private analyzeSourceFile;
    private getElementType;
    private isWithinRange;
    private convertToDiagnostics;
    dispose(): void;
}
