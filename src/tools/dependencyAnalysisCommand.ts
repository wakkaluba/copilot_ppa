import * as vscode from 'vscode';
import { DependencyAnalysisService } from '../services/dependencyAnalysis/DependencyAnalysisService';

export class DependencyAnalysisCommand {
    private service: DependencyAnalysisService;
    
    constructor() {
        this.service = new DependencyAnalysisService();
    }
    
    public register(): vscode.Disposable {
        const disposables: vscode.Disposable[] = [];
        
        disposables.push(
            vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeDependencies', () => this.service.analyzeDependencies()),
            vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileDependencies', () => this.service.analyzeFileDependencies()),
            vscode.commands.registerCommand('vscodeLocalLLMAgent.showDependencyGraph', () => this.service.showDependencyGraph())
        );
        
        return vscode.Disposable.from(...disposables);
    }
}
