import * as vscode from 'vscode';
import * as path from 'path';
import { DependencyAnalyzer, DependencyAnalysisResult, DependencyGraph } from './dependencyAnalyzer';

export class DependencyAnalysisCommand {
    private readonly dependencyAnalyzer: DependencyAnalyzer;
    
    constructor() {
        this.dependencyAnalyzer = new DependencyAnalyzer();
    }
    
    /**
     * Register all dependency analysis commands
     * @returns Disposable for the commands
     */
    public register(): vscode.Disposable {
        const disposables: vscode.Disposable[] = [];
        
        disposables.push(
            vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeDependencies', this.analyzeDependencies.bind(this)),
            vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileDependencies', this.analyzeFileDependencies.bind(this)),
            vscode.commands.registerCommand('vscodeLocalLLMAgent.showDependencyGraph', this.showDependencyGraph.bind(this))
        );
        
        return vscode.Disposable.from(...disposables);
    }
    
    /**
     * Analyze dependencies of the current project
     */
    private async analyzeDependencies(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder is open');
            return;
        }
        
        let folderToAnalyze: vscode.WorkspaceFolder;
        
        if (workspaceFolders.length === 1) {
            folderToAnalyze = workspaceFolders[0];
        } else {
            const selectedFolder = await vscode.window.showQuickPick(
                workspaceFolders.map(folder => ({
                    label: folder.name,
                    folder
                })),
                { placeHolder: 'Select a workspace folder to analyze' }
            );
            
            if (!selectedFolder) {
                return;
            }
            
            folderToAnalyze = selectedFolder.folder;
        }
        
        const packageJsonFiles = await this.dependencyAnalyzer.findPackageJsonFiles(folderToAnalyze);
        
        if (packageJsonFiles.length === 0) {
            vscode.window.showInformationMessage('No package.json files found in the workspace');
            return;
        }
        
        let fileToAnalyze: string;
        
        if (packageJsonFiles.length === 1) {
            fileToAnalyze = packageJsonFiles[0];
        } else {
            const selectedFile = await vscode.window.showQuickPick(
                packageJsonFiles.map(file => ({
                    label: path.relative(folderToAnalyze.uri.fsPath, file),
                    description: file,
                    file
                })),
                { placeHolder: 'Select a package.json file to analyze' }
            );
            
            if (!selectedFile) {
                return;
            }
            
            fileToAnalyze = selectedFile.file;
        }
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing dependencies...',
            cancellable: false
        }, async () => {
            const result = await this.dependencyAnalyzer.analyzeDependencies(path.dirname(fileToAnalyze));
            
            if (result) {
                this.showDependencyAnalysisResults(result);
            }
        });
    }
    
    /**
     * Analyze dependencies referenced in the current file
     */
    private async analyzeFileDependencies(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showWarningMessage('No file is open');
            return;
        }
        
        const filePath = editor.document.uri.fsPath;
        const ext = path.extname(filePath).toLowerCase();
        
        if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            vscode.window.showWarningMessage('File must be a JavaScript or TypeScript file');
            return;
        }
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing file imports...',
            cancellable: false
        }, async () => {
            const imports = await this.dependencyAnalyzer.analyzeFileImports(filePath);
            
            if (imports.length > 0) {
                const document = await vscode.workspace.openTextDocument({
                    content: this.formatImportsReport(filePath, imports),
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(document);
            } else {
                vscode.window.showInformationMessage('No imports found in the file');
            }
        });
    }
    
    /**
     * Show dependency graph for the current project
     */
    private async showDependencyGraph(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder is open');
            return;
        }
        
        let folderToAnalyze: vscode.WorkspaceFolder;
        
        if (workspaceFolders.length === 1) {
            folderToAnalyze = workspaceFolders[0];
        } else {
            const selectedFolder = await vscode.window.showQuickPick(
                workspaceFolders.map(folder => ({
                    label: folder.name,
                    folder
                })),
                { placeHolder: 'Select a workspace folder to analyze' }
            );
            
            if (!selectedFolder) {
                return;
            }
            
            folderToAnalyze = selectedFolder.folder;
        }
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating dependency graph...',
            cancellable: false
        }, async () => {
            const result = await this.dependencyAnalyzer.analyzeDependencies(folderToAnalyze.uri.fsPath);
            
            if (result) {
                const graph = this.dependencyAnalyzer.generateDependencyGraph(result);
                this.showGraphVisualization(result.fileName, graph);
            }
        });
    }
    
    /**
     * Show dependency analysis results in a new document
     * @param result Analysis result
     */
    private async showDependencyAnalysisResults(result: DependencyAnalysisResult): Promise<void> {
        const content = this.formatDependencyReport(result);
        
        const document = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(document);
    }
    
    /**
     * Format dependency analysis results as markdown
     * @param result Analysis result
     * @returns Formatted markdown content
     */
    private formatDependencyReport(result: DependencyAnalysisResult): string {
        let content = `# Dependency Analysis: ${path.basename(path.dirname(result.filePath))}\n\n`;
        content += `Analysis of: \`${result.filePath}\`\n\n`;
        
        content += `## Dependencies (${result.dependencies.length})\n\n`;
        if (result.dependencies.length > 0) {
            content += '| Package | Version |\n';
            content += '|---------|--------|\n';
            result.dependencies.forEach(dep => {
                content += `| ${dep.name} | ${dep.version} |\n`;
            });
        } else {
            content += '_No dependencies found_\n';
        }
        
        content += `\n## Dev Dependencies (${result.devDependencies.length})\n\n`;
        if (result.devDependencies.length > 0) {
            content += '| Package | Version |\n';
            content += '|---------|--------|\n';
            result.devDependencies.forEach(dep => {
                content += `| ${dep.name} | ${dep.version} |\n`;
            });
        } else {
            content += '_No dev dependencies found_\n';
        }
        
        if (result.peerDependencies && result.peerDependencies.length > 0) {
            content += `\n## Peer Dependencies (${result.peerDependencies.length})\n\n`;
            content += '| Package | Version |\n';
            content += '|---------|--------|\n';
            result.peerDependencies.forEach(dep => {
                content += `| ${dep.name} | ${dep.version} |\n`;
            });
        }
        
        if (result.optionalDependencies && result.optionalDependencies.length > 0) {
            content += `\n## Optional Dependencies (${result.optionalDependencies.length})\n\n`;
            content += '| Package | Version |\n';
            content += '|---------|--------|\n';
            result.optionalDependencies.forEach(dep => {
                content += `| ${dep.name} | ${dep.version} |\n`;
            });
        }
        
        content += '\n## Summary\n\n';
        content += `- Total dependencies: ${result.dependencies.length}\n`;
        content += `- Total dev dependencies: ${result.devDependencies.length}\n`;
        if (result.peerDependencies) {
            content += `- Total peer dependencies: ${result.peerDependencies.length}\n`;
        }
        if (result.optionalDependencies) {
            content += `- Total optional dependencies: ${result.optionalDependencies.length}\n`;
        }
        content += `- Total packages: ${result.dependencies.length + result.devDependencies.length + 
            (result.peerDependencies?.length || 0) + (result.optionalDependencies?.length || 0)}\n`;
        
        return content;
    }
    
    /**
     * Format imports analysis as markdown
     * @param filePath Path of the analyzed file
     * @param imports List of imports found
     * @returns Formatted markdown content
     */
    private formatImportsReport(filePath: string, imports: string[]): string {
        let content = `# File Imports Analysis\n\n`;
        content += `Analysis of: \`${filePath}\`\n\n`;
        
        const nodeModules = imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('/'));
        const localImports = imports.filter(imp => imp.startsWith('.') || imp.startsWith('/'));
        
        content += `## External Dependencies (${nodeModules.length})\n\n`;
        if (nodeModules.length > 0) {
            content += '| Package |\n';
            content += '|---------|\n';
            nodeModules.forEach(dep => {
                content += `| ${dep} |\n`;
            });
        } else {
            content += '_No external dependencies found_\n';
        }
        
        content += `\n## Local Imports (${localImports.length})\n\n`;
        if (localImports.length > 0) {
            content += '| Path |\n';
            content += '|-----|\n';
            localImports.forEach(imp => {
                content += `| ${imp} |\n`;
            });
        } else {
            content += '_No local imports found_\n';
        }
        
        content += '\n## Summary\n\n';
        content += `- Total external dependencies: ${nodeModules.length}\n`;
        content += `- Total local imports: ${localImports.length}\n`;
        content += `- Total imports: ${imports.length}\n`;
        
        return content;
    }
    
    /**
     * Show graph visualization
     * @param title Graph title
     * @param graph Dependency graph
     */
    private showGraphVisualization(title: string, graph: DependencyGraph): void {
        // In a real implementation, this would create a webview panel to visualize the graph
        // For simplicity, we'll just show the graph as JSON in a text document
        
        const content = `# Dependency Graph: ${title}\n\n` +
            '```json\n' +
            JSON.stringify(graph, null, 2) +
            '\n```\n\n' +
            '_Note: In a full implementation, this would be an interactive graph visualization._';
        
        vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        }).then(document => {
            vscode.window.showTextDocument(document);
        });
    }
}
