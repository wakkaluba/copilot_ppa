import * as vscode from 'vscode';
import { CodeComplexityService } from '../services/codeAnalysis/CodeComplexityService';
import { ComplexityResult } from '../types/complexity';

export class CodeComplexityAnalyzer {
    private service: CodeComplexityService;

    constructor() {
        this.service = new CodeComplexityService();
    }

    public async analyzeFile(filePath: string): Promise<ComplexityResult | null> {
        return this.service.analyzeFile(filePath);
    }

    public async analyzeWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<ComplexityResult[]> {
        return this.service.analyzeWorkspace(workspaceFolder);
    }

    public generateComplexityReport(results: ComplexityResult[]): string {
        return this.service.generateComplexityReport(results);
    }

    public visualizeComplexity(editor: vscode.TextEditor, result: ComplexityResult): vscode.Disposable[] {
        return this.service.visualizeComplexity(editor, result);
    }
}
