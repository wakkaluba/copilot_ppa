import * as vscode from 'vscode';
import { BaseCodeAnalyzer } from '../codeAnalysis/BaseCodeAnalyzer';
import { TypeScriptAnalyzer } from './TypeScriptAnalyzer';
import { JavaScriptAnalyzer } from './JavaScriptAnalyzer';
import { ILanguageAnalyzer } from './ILanguageAnalyzer';

export class UnusedCodeAnalyzer extends BaseCodeAnalyzer {
    private languageAnalyzers: Map<string, ILanguageAnalyzer> = new Map();

    /**
     * Analyzes a document for unused code
     */
    public async analyze(document: vscode.TextDocument, selection?: vscode.Selection): Promise<vscode.Diagnostic[]> {
        const analyzer = this.getLanguageAnalyzer(document);
        const diagnostics = await analyzer.findUnusedCode(document, selection);
        this.updateDiagnostics(document, diagnostics);
        return diagnostics;
    }

    /**
     * Gets the appropriate language-specific analyzer
     */
    private getLanguageAnalyzer(document: vscode.TextDocument): ILanguageAnalyzer {
        const extension = document.uri.fsPath.split('.').pop()?.toLowerCase();
        
        let analyzer = this.languageAnalyzers.get(extension || '');
        if (!analyzer) {
            analyzer = this.createAnalyzer(extension);
            this.languageAnalyzers.set(extension || '', analyzer);
        }
        
        return analyzer;
    }

    private createAnalyzer(extension?: string): ILanguageAnalyzer {
        switch (extension) {
            case 'ts':
            case 'tsx':
                return new TypeScriptAnalyzer();
            case 'js':
            case 'jsx':
                return new JavaScriptAnalyzer();
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    public override dispose(): void {
        super.dispose();
        this.languageAnalyzers.clear();
    }
}