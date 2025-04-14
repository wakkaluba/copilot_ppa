import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

export interface Bottleneck {
    file: string;
    startLine: number;
    endLine: number;
    description: string;
    impact: 'low' | 'medium' | 'high';
    suggestions: string[];
}

export class BottleneckDetector {
    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel('Bottleneck Detector');
        
        context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.detectBottlenecks', 
                this.detectBottlenecksInCurrentFile.bind(this)),
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceBottlenecks',
                this.analyzeWorkspaceBottlenecks.bind(this)),
            this.outputChannel
        );
    }
    
    /**
     * Analyzes the current file for potential bottlenecks
     */
    public async detectBottlenecksInCurrentFile(): Promise<Bottleneck[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        
        const document = editor.document;
        return this.detectBottlenecks(document.uri);
    }
    
    /**
     * Detects bottlenecks in a specific file
     */
    public async detectBottlenecks(fileUri: vscode.Uri): Promise<Bottleneck[]> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const fileContent = document.getText();
        const fileName = path.basename(fileUri.fsPath);
        const fileExtension = path.extname(fileUri.fsPath).substring(1);
        
        // Only support certain file types for now
        if (!['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp'].includes(fileExtension)) {
            vscode.window.showInformationMessage(`Bottleneck detection not supported for .${fileExtension} files`);
            return [];
        }
        
        const results = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Analyzing ${fileName} for bottlenecks`,
            cancellable: true
        }, async (progress, token) => {
            progress.report({ increment: 0 });
            
            // First analyze code structure
            const structuralBottlenecks = this.detectStructuralBottlenecks(fileContent, fileExtension);
            progress.report({ increment: 30 });
            
            if (token.isCancellationRequested) {
                return [];
            }
            
            // Then analyze algorithmic complexity
            const algorithmicBottlenecks = this.detectAlgorithmicBottlenecks(fileContent, fileExtension);
            progress.report({ increment: 30 });
            
            if (token.isCancellationRequested) {
                return [];
            }
            
            // Finally check for I/O and resource bottlenecks
            const resourceBottlenecks = this.detectResourceBottlenecks(fileContent, fileExtension);
            progress.report({ increment: 40 });
            
            // Combine all bottlenecks
            const allBottlenecks = [
                ...structuralBottlenecks,
                ...algorithmicBottlenecks,
                ...resourceBottlenecks
            ].map(b => ({
                ...b,
                file: fileUri.fsPath
            }));
            
            // Display results
            this.displayBottleneckResults(allBottlenecks);
            
            return allBottlenecks;
        });
        
        return results || [];
    }
    
    /**
     * Detects bottlenecks across all workspace files
     */
    public async analyzeWorkspaceBottlenecks(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace for bottlenecks',
            cancellable: true
        }, async (progress, token) => {
            // Get all relevant files in workspace
            const files = await vscode.workspace.findFiles(
                '**/*.{js,ts,jsx,tsx,py,java,c,cpp}', 
                '**/node_modules/**'
            );
            
            const totalFiles = files.length;
            let processedFiles = 0;
            let allBottlenecks: Bottleneck[] = [];
            
            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                
                const bottlenecks = await this.detectBottlenecks(file);
                allBottlenecks = [...allBottlenecks, ...bottlenecks];
                
                processedFiles++;
                progress.report({
                    increment: (100 / totalFiles),
                    message: `Processed ${processedFiles} of ${totalFiles} files`
                });
            }
            
            // Generate comprehensive report
            this.generateBottleneckReport(allBottlenecks);
        });
    }
    
    /**
     * Detects structural bottlenecks like deeply nested loops, complex conditions
     */
    private detectStructuralBottlenecks(content: string, fileType: string): Bottleneck[] {
        const bottlenecks: Bottleneck[] = [];
        const lines = content.split('\n');
        
        // Track nesting level
        let nestingLevels: number[] = [];
        let currentNestingLevel = 0;
        let nestingStartLine = -1;
        
        // Detect loop nesting
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for loop starts
            if (this.isLoopStart(line, fileType)) {
                if (currentNestingLevel === 0) {
                    nestingStartLine = i;
                }
                currentNestingLevel++;
                nestingLevels[i] = currentNestingLevel;
            }
            
            // Check for loop ends
            if (this.isBlockEnd(line, fileType) && currentNestingLevel > 0) {
                currentNestingLevel--;
                
                // If we're back to zero nesting and we had deep nesting
                if (currentNestingLevel === 0 && Math.max(...nestingLevels.slice(nestingStartLine, i+1)) >= 3) {
                    bottlenecks.push({
                        file: '',
                        startLine: nestingStartLine,
                        endLine: i,
                        description: 'Deeply nested loops detected',
                        impact: 'high',
                        suggestions: [
                            'Consider refactoring deeply nested loops to reduce time complexity',
                            'Extract inner loops into separate functions',
                            'Consider using more efficient data structures to avoid nested iterations'
                        ]
                    });
                }
                
                nestingLevels[i] = currentNestingLevel;
            }
            
            // Check for complex conditions
            if (line.includes('if') || line.includes('while') || line.includes('for')) {
                const conditionComplexity = (line.match(/&&|\|\|/g) || []).length;
                if (conditionComplexity >= 3) {
                    bottlenecks.push({
                        file: '',
                        startLine: i,
                        endLine: i,
                        description: 'Complex condition with multiple logical operators',
                        impact: 'medium',
                        suggestions: [
                            'Break complex conditions into separate if statements or variables',
                            'Extract condition logic into a separate function with a meaningful name'
                        ]
                    });
                }
            }
        }
        
        return bottlenecks;
    }
    
    /**
     * Detects algorithmic inefficiencies
     */
    private detectAlgorithmicBottlenecks(content: string, fileType: string): Bottleneck[] {
        const bottlenecks: Bottleneck[] = [];
        const lines = content.split('\n');
        
        // Look for potential inefficient sorting or search algorithms
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for bubble sort-like patterns (two nested loops with swapping)
            if (this.isLoopStart(line, fileType)) {
                const nextLines = lines.slice(i, i + 15).join('\n');
                if (this.containsNestedLoop(nextLines, fileType) && 
                    (nextLines.includes('swap') || 
                     (nextLines.includes('temp') && nextLines.includes('=')))) {
                    bottlenecks.push({
                        file: '',
                        startLine: i,
                        endLine: this.findBlockEnd(lines, i),
                        description: 'Potentially inefficient sorting algorithm detected',
                        impact: 'high',
                        suggestions: [
                            'Consider using built-in sort functions which implement efficient algorithms',
                            'If custom sorting is required, consider using quicksort or mergesort instead of bubble/selection sort'
                        ]
                    });
                }
            }
            
            // Check for linear search in large arrays
            if (line.includes('find(') || 
                line.includes('includes(') || 
                line.includes('indexOf(') ||
                (line.includes('for') && line.includes('==='))) {
                bottlenecks.push({
                    file: '',
                    startLine: i,
                    endLine: i,
                    description: 'Potential linear search operation',
                    impact: 'medium',
                    suggestions: [
                        'For frequent lookups, consider using a Map or object for O(1) access instead of array linear search',
                        'If the array is sorted, binary search could be more efficient'
                    ]
                });
            }
            
            // Check for excessive string concatenation
            if ((line.match(/\+=/g) || []).length > 2 && line.includes('string') || line.includes('"') || line.includes("'")) {
                bottlenecks.push({
                    file: '',
                    startLine: i,
                    endLine: i,
                    description: 'Excessive string concatenation',
                    impact: 'medium',
                    suggestions: [
                        'Use string interpolation or template literals instead of multiple concatenations',
                        'For building large strings in loops, use array.join() or a string builder pattern'
                    ]
                });
            }
        }
        
        return bottlenecks;
    }
    
    /**
     * Detects I/O and resource usage bottlenecks
     */
    private detectResourceBottlenecks(content: string, fileType: string): Bottleneck[] {
        const bottlenecks: Bottleneck[] = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for synchronous file operations
            if ((line.includes('readFileSync') || line.includes('writeFileSync')) && 
                !content.includes('performance critical')) {
                bottlenecks.push({
                    file: '',
                    startLine: i,
                    endLine: i,
                    description: 'Synchronous file I/O operation',
                    impact: 'high',
                    suggestions: [
                        'Use asynchronous file operations to prevent blocking the event loop',
                        'Consider using streams for large files to reduce memory usage'
                    ]
                });
            }
            
            // Check for resource leaks
            if ((line.includes('new ') || line.includes('create')) && 
                (line.includes('Stream') || line.includes('Connection') || line.includes('Socket'))) {
                // Look for corresponding close/dispose in the next 30 lines
                const nextLines = lines.slice(i, i + 30).join('\n');
                if (!nextLines.includes('close(') && !nextLines.includes('dispose(') && !nextLines.includes('finally')) {
                    bottlenecks.push({
                        file: '',
                        startLine: i,
                        endLine: i,
                        description: 'Potential resource leak detected',
                        impact: 'high',
                        suggestions: [
                            'Ensure resources are properly closed/disposed with finally blocks',
                            'Consider using a try-with-resources pattern or resource management pattern'
                        ]
                    });
                }
            }
            
            // Check for inefficient DOM operations in loops
            if (fileType === 'js' || fileType === 'ts' || fileType === 'jsx' || fileType === 'tsx') {
                if (this.isLoopStart(line, fileType)) {
                    const loopBody = this.getLoopBody(lines, i);
                    if (loopBody.includes('document.') || loopBody.includes('getElementById') || 
                        loopBody.includes('querySelector')) {
                        bottlenecks.push({
                            file: '',
                            startLine: i,
                            endLine: this.findBlockEnd(lines, i),
                            description: 'DOM operations inside loops',
                            impact: 'high',
                            suggestions: [
                                'Cache DOM elements outside of loops',
                                'Minimize reflows by batching DOM updates',
                                'Consider using DocumentFragment for multiple DOM insertions'
                            ]
                        });
                    }
                }
            }
        }
        
        return bottlenecks;
    }
    
    /**
     * Helper to check if a line starts a loop
     */
    private isLoopStart(line: string, fileType: string): boolean {
        if (['js', 'ts', 'jsx', 'tsx', 'java', 'c', 'cpp'].includes(fileType)) {
            return /^\s*(for|while|do)\s*\(/.test(line) || /^\s*for\s*\(/.test(line) || 
                   /^\s*while\s*\(/.test(line) || /^\s*forEach/.test(line);
        } else if (fileType === 'py') {
            return /^\s*for\s+\w+\s+in/.test(line) || /^\s*while\s+/.test(line);
        }
        return false;
    }
    
    /**
     * Helper to check if a line ends a block
     */
    private isBlockEnd(line: string, fileType: string): boolean {
        if (['js', 'ts', 'jsx', 'tsx', 'java', 'c', 'cpp'].includes(fileType)) {
            return /^\s*}/.test(line);
        } else if (fileType === 'py') {
            return /^\s*\w/.test(line) && line.trim() !== '';
        }
        return false;
    }
    
    /**
     * Helper to check if content contains nested loops
     */
    private containsNestedLoop(content: string, fileType: string): boolean {
        const lines = content.split('\n');
        let nestingLevel = 0;
        
        for (const line of lines) {
            if (this.isLoopStart(line, fileType)) {
                nestingLevel++;
                if (nestingLevel >= 2) {
                    return true;
                }
            }
            
            if (this.isBlockEnd(line, fileType) && nestingLevel > 0) {
                nestingLevel--;
            }
        }
        
        return false;
    }
    
    /**
     * Find the ending line for a block starting at the given line
     */
    private findBlockEnd(lines: string[], startLine: number): number {
        const fileType = 'js'; // Default to JS-like syntax
        let nestingLevel = 0;
        let inBlock = false;
        
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('{')) {
                nestingLevel++;
                inBlock = true;
            }
            
            if (line.includes('}') && inBlock) {
                nestingLevel--;
                if (nestingLevel === 0) {
                    return i;
                }
            }
        }
        
        return startLine + 5; // Fallback if we can't find the end
    }
    
    /**
     * Extract the body of a loop
     */
    private getLoopBody(lines: string[], loopStartLine: number): string {
        const endLine = this.findBlockEnd(lines, loopStartLine);
        return lines.slice(loopStartLine + 1, endLine).join('\n');
    }
    
    /**
     * Display bottleneck results in output channel
     */
    private displayBottleneckResults(bottlenecks: Bottleneck[]): void {
        this.outputChannel.clear();
        
        if (bottlenecks.length === 0) {
            this.outputChannel.appendLine('No bottlenecks detected.');
            return;
        }
        
        this.outputChannel.appendLine(`Found ${bottlenecks.length} potential bottlenecks:`);
        this.outputChannel.appendLine('');
        
        bottlenecks.forEach(bottleneck => {
            this.outputChannel.appendLine(`File: ${bottleneck.file}`);
            this.outputChannel.appendLine(`Location: Lines ${bottleneck.startLine + 1}-${bottleneck.endLine + 1}`);
            this.outputChannel.appendLine(`Impact: ${bottleneck.impact.toUpperCase()}`);
            this.outputChannel.appendLine(`Issue: ${bottleneck.description}`);
            this.outputChannel.appendLine('Suggestions:');
            bottleneck.suggestions.forEach(suggestion => {
                this.outputChannel.appendLine(`  - ${suggestion}`);
            });
            this.outputChannel.appendLine('-------------------------------------------');
        });
        
        this.outputChannel.show();
    }
    
    /**
     * Generate a comprehensive report of all bottlenecks
     */
    private generateBottleneckReport(bottlenecks: Bottleneck[]): void {
        const reportFile = path.join(this.context.extensionPath, 'bottleneck-report.md');
        
        let report = '# Code Bottleneck Analysis Report\n\n';
        report += `Generated on: ${new Date().toLocaleString()}\n\n`;
        
        // Group by file
        const bottlenecksByFile: { [key: string]: Bottleneck[] } = {};
        
        bottlenecks.forEach(bottleneck => {
            if (!bottlenecksByFile[bottleneck.file]) {
                bottlenecksByFile[bottleneck.file] = [];
            }
            bottlenecksByFile[bottleneck.file].push(bottleneck);
        });
        
        // Group by impact
        const highImpact = bottlenecks.filter(b => b.impact === 'high');
        const mediumImpact = bottlenecks.filter(b => b.impact === 'medium');
        const lowImpact = bottlenecks.filter(b => b.impact === 'low');
        
        report += '## Summary\n\n';
        report += `- Total bottlenecks detected: ${bottlenecks.length}\n`;
        report += `- High impact issues: ${highImpact.length}\n`;
        report += `- Medium impact issues: ${mediumImpact.length}\n`;
        report += `- Low impact issues: ${lowImpact.length}\n`;
        report += `- Files affected: ${Object.keys(bottlenecksByFile).length}\n\n`;
        
        report += '## High Impact Issues\n\n';
        if (highImpact.length === 0) {
            report += 'No high impact issues detected.\n\n';
        } else {
            highImpact.forEach(bottleneck => {
                report += `### ${bottleneck.description}\n`;
                report += `- File: \`${path.basename(bottleneck.file)}\`\n`;
                report += `- Lines: ${bottleneck.startLine + 1}-${bottleneck.endLine + 1}\n`;
                report += `- Suggestions:\n`;
                bottleneck.suggestions.forEach(suggestion => {
                    report += `  - ${suggestion}\n`;
                });
                report += '\n';
            });
        }
        
        report += '## Findings by File\n\n';
        
        Object.keys(bottlenecksByFile).forEach(file => {
            report += `### ${path.basename(file)}\n\n`;
            
            bottlenecksByFile[file].forEach(bottleneck => {
                report += `- **${bottleneck.description}** (${bottleneck.impact})\n`;
                report += `  Lines: ${bottleneck.startLine + 1}-${bottleneck.endLine + 1}\n`;
                report += `  Suggestions:\n`;
                bottleneck.suggestions.forEach(suggestion => {
                    report += `  - ${suggestion}\n`;
                });
                report += '\n';
            });
        });
        
        fs.writeFileSync(reportFile, report);
        
        vscode.window.showInformationMessage(
            'Bottleneck analysis report generated', 
            'Open Report'
        ).then(selection => {
            if (selection === 'Open Report') {
                vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(reportFile));
            }
        });
        
        this.outputChannel.appendLine(`Report saved to: ${reportFile}`);
        this.outputChannel.show();
    }
}
