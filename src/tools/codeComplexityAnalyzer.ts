import * as vscode from 'vscode';
import { CodeComplexityService } from '../services/codeAnalysis/CodeComplexityService';
import { ComplexityResult, ComplexityVisualization } from '../types/complexity';

/**
 * Analyzes and visualizes code complexity metrics
 */
export class CodeComplexityAnalyzer {
    private readonly service: CodeComplexityService;
    private readonly disposables: vscode.Disposable[] = [];

    constructor() {
        this.service = new CodeComplexityService();
    }

    /**
     * Analyzes complexity metrics for a specific file
     */
    public async analyzeFile(filePath: string): Promise<ComplexityResult | null> {
        try {
            return await this.service.analyzeFile(filePath);
        } catch (error) {
            this.handleError('File analysis failed', error);
            return null;
        }
    }

    /**
     * Analyzes complexity metrics for an entire workspace
     */
    public async analyzeWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<ComplexityResult[]> {
        try {
            return await this.service.analyzeWorkspace(workspaceFolder);
        } catch (error) {
            this.handleError('Workspace analysis failed', error);
            return [];
        }
    }

    /**
     * Generates a formatted complexity report
     */
    public generateComplexityReport(results: ComplexityResult[]): string {
        try {
            return this.service.generateComplexityReport(results);
        } catch (error) {
            this.handleError('Report generation failed', error);
            return 'Error generating complexity report';
        }
    }

    /**
     * Visualizes complexity metrics in the editor
     */
    public visualizeComplexity(editor: vscode.TextEditor, result: ComplexityResult): vscode.Disposable[] {
        try {
            const visualizations = this.service.visualizeComplexity(editor, result);
            this.disposables.push(...visualizations);
            return visualizations;
        } catch (error) {
            this.handleError('Visualization failed', error);
            return [];
        }
    }

    /**
     * Cleans up resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.service.dispose();
    }

    private handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
        console.error(`CodeComplexityAnalyzer error: ${message}`, error);
    }
}
