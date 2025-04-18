import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { LLMService } from '../../services/llm/llmService';

export interface MemoryIssue {
    file: string;
    line: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
    affectedMemory?: string;
}

export class MemoryOptimizer {
    private llmService: LLMService;
    private context: vscode.ExtensionContext;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private outputChannel: vscode.OutputChannel;
    private disposables: vscode.Disposable[] = [];
    private contentCache: Map<string, { timestamp: number, analysis: MemoryIssue[] }>;
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    constructor(context: vscode.ExtensionContext, llmService: LLMService) {
        this.context = context;
        this.llmService = llmService;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('memory-issues');
        this.outputChannel = vscode.window.createOutputChannel('Memory Optimization');
        this.contentCache = new Map();
        
        context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzeMemoryUsage', 
                this.analyzeCurrentFile.bind(this)),
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceMemory',
                this.analyzeWorkspace.bind(this)),
            vscode.commands.registerCommand('vscode-local-llm-agent.findMemoryLeaks',
                this.findMemoryLeaks.bind(this)),
            this.diagnosticCollection,
            this.outputChannel
        );

        // Clean up cache periodically
        const cleanupInterval = setInterval(() => this.cleanupCache(), 60000);
        this.disposables.push(new vscode.Disposable(() => clearInterval(cleanupInterval)));
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.contentCache.clear();
    }

    private cleanupCache(): void {
        const now = Date.now();
        const beforeSize = this.contentCache.size;
        
        // Batch delete expired entries
        const expiredKeys = Array.from(this.contentCache.entries())
            .filter(([_, value]) => now - value.timestamp > MemoryOptimizer.CACHE_TTL)
            .map(([key]) => key);
        
        expiredKeys.forEach(key => this.contentCache.delete(key));
        
        if (expiredKeys.length > 0) {
            const memoryFreed = process.memoryUsage().heapUsed / 1024 / 1024;
            this.outputChannel.appendLine(
                `Memory cleanup: Removed ${expiredKeys.length} entries. ` +
                `Cache size reduced from ${beforeSize} to ${this.contentCache.size}. ` +
                `Current heap usage: ${memoryFreed.toFixed(2)} MB`
            );
        }
    }

    private getCachedAnalysis(content: string): MemoryIssue[] | null {
        const cached = this.contentCache.get(content);
        if (cached && Date.now() - cached.timestamp < MemoryOptimizer.CACHE_TTL) {
            return cached.analysis;
        }
        return null;
    }

    private cacheAnalysis(content: string, analysis: MemoryIssue[]): void {
        this.contentCache.set(content, {
            timestamp: Date.now(),
            analysis
        });
    }
    
    /**
     * Analyzes memory usage in the currently active file
     */
    public async analyzeCurrentFile(): Promise<MemoryIssue[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        
        const document = editor.document;
        return this.analyzeFile(document.uri);
    }
    
    /**
     * Analyzes memory usage in a specific file
     */
    public async analyzeFile(fileUri: vscode.Uri): Promise<MemoryIssue[]> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const fileContent = document.getText();
        const fileName = path.basename(fileUri.fsPath);
        const fileExtension = path.extname(fileUri.fsPath).substring(1);
        
        // Clear previous diagnostics for this file
        this.diagnosticCollection.delete(fileUri);
        
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Analyzing memory usage in ${fileName}`,
            cancellable: true
        }, async (progress, token) => {
            progress.report({ increment: 0 });
            
            // Perform static analysis
            const staticIssues = await this.performStaticMemoryAnalysis(fileContent, fileExtension);
            progress.report({ increment: 40, message: 'Static analysis complete' });
            
            if (token.isCancellationRequested) {
                return [];
            }
            
            // Use LLM for more advanced analysis
            const llmIssues = await this.performLLMMemoryAnalysis(fileContent, fileExtension);
            progress.report({ increment: 60, message: 'LLM analysis complete' });
            
            // Combine results
            const issues = [...staticIssues, ...llmIssues].map(issue => ({
                ...issue,
                file: fileUri.fsPath
            }));
            
            // Add diagnostics
            this.addDiagnostics(fileUri, issues, document);
            
            // Show results
            this.displayResults(issues);
            
            return issues;
        });
    }
    
    /**
     * Analyzes memory usage across the workspace
     */
    public async analyzeWorkspace(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace memory usage',
            cancellable: true
        }, async (progress, token) => {
            // Find relevant files
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,c,cpp}', '**/node_modules/**');
            
            let processedFiles = 0;
            const totalFiles = files.length;
            let allIssues: MemoryIssue[] = [];
            
            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                
                const issues = await this.analyzeFile(file);
                allIssues = [...allIssues, ...issues];
                
                processedFiles++;
                progress.report({
                    increment: (100 / totalFiles),
                    message: `Processed ${processedFiles} of ${totalFiles} files`
                });
            }
            
            // Generate summary report
            this.generateMemoryReport(allIssues);
        });
    }
    
    /**
     * Specifically looks for memory leaks in code
     */
    public async findMemoryLeaks(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return;
        }
        
        const document = editor.document;
        const fileContent = document.getText();
        const fileExtension = path.extname(document.fileName).substring(1);
        
        this.outputChannel.clear();
        this.outputChannel.appendLine('Analyzing for memory leaks...');
        this.outputChannel.show();
        
        // Check for memory leak patterns based on the language
        let leakPatterns: string[] = [];
        
        if (['js', 'ts', 'jsx', 'tsx'].includes(fileExtension)) {
            leakPatterns = [
                // Event listeners without cleanup
                'addEventListener(?!.*removeEventListener)',
                // Unmanaged timers
                'setInterval(?!.*clearInterval)',
                'setTimeout(?!.*clearTimeout)',
                // Circular references
                'this\\.\\w+\\s*=.*this',
                // Global cache without cleanup
                'cache\\s*=\\s*\\{\\}',
                'const\\s+\\w+\\s*=\\s*\\{\\};\\s*// cache|storage|store',
                // DOM references stored in closures
                'const\\s+\\w+\\s*=\\s*document\\.querySelector'
            ];
        } else if (['py'].includes(fileExtension)) {
            leakPatterns = [
                // Circular references
                'self\\.\\w+\\s*=.*self',
                // Large collections
                'cache\\s*=\\s*\\{\\}',
                // Unmanaged resources
                'open\\((?!.*with)',
                // Thread or process creation without join
                'Thread\\((?!.*join\\()',
                'Process\\((?!.*join\\()'
            ];
        } else if (['java'].includes(fileExtension)) {
            leakPatterns = [
                // Unclosed resources
                'new\\s+\\w*(Reader|Writer|Stream|Socket)(?!.*close\\()',
                // Inner class referencing outer class
                'class\\s+\\w+\\s*\\{.*class\\s+\\w+',
                // ThreadLocal without remove
                'ThreadLocal<',
                // Unclosed connections
                'getConnection(?!.*close\\()'
            ];
        } else if (['c', 'cpp'].includes(fileExtension)) {
            leakPatterns = [
                // Memory allocation without free
                'malloc\\((?!.*free\\()',
                'calloc\\((?!.*free\\()',
                'new\\s+(?!.*delete)',
                // File handles not closed
                'fopen\\((?!.*fclose\\()',
                // Resource handles
                'Create\\w+\\((?!.*Release\\w+\\(|Close\\w+\\()'
            ];
        }
        
        const lines = fileContent.split('\n');
        let foundLeaks = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            for (const pattern of leakPatterns) {
                if (new RegExp(pattern).test(line)) {
                    foundLeaks = true;
                    this.outputChannel.appendLine(`Potential memory leak at line ${i + 1}:`);
                    this.outputChannel.appendLine(`  ${line.trim()}`);
                    this.outputChannel.appendLine(`  Pattern: ${pattern}`);
                    this.outputChannel.appendLine('');
                    
                    // Add diagnostic
                    const range = new vscode.Range(i, 0, i, line.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Potential memory leak: ${this.getLeakDescription(pattern)}`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    
                    diagnostic.source = 'Memory Optimizer';
                    
                    // Get current diagnostics for this file
                    const currentDiagnostics = this.diagnosticCollection.get(document.uri) || [];
                    this.diagnosticCollection.set(document.uri, [...currentDiagnostics, diagnostic]);
                }
            }
        }
        
        if (!foundLeaks) {
            this.outputChannel.appendLine('No obvious memory leaks detected.');
        } else {
            // Add suggestions based on language
            this.outputChannel.appendLine('\nGeneral suggestions to prevent memory leaks:');
            
            if (['js', 'ts', 'jsx', 'tsx'].includes(fileExtension)) {
                this.outputChannel.appendLine('- Always remove event listeners when components unmount');
                this.outputChannel.appendLine('- Clear intervals and timeouts when no longer needed');
                this.outputChannel.appendLine('- Avoid storing DOM references in closures');
                this.outputChannel.appendLine('- Watch for circular references, especially in objects');
                this.outputChannel.appendLine('- Use WeakMap/WeakSet for caches that reference objects');
            } else if (['py'].includes(fileExtension)) {
                this.outputChannel.appendLine('- Use context managers (with statements) for resource handling');
                this.outputChannel.appendLine('- Be careful with cyclic references, especially in class instances');
                this.outputChannel.appendLine('- Consider using weakref for observer patterns');
                this.outputChannel.appendLine('- Always join threads and processes');
            } else if (['java'].includes(fileExtension)) {
                this.outputChannel.appendLine('- Use try-with-resources for all closeable resources');
                this.outputChannel.appendLine('- Be careful with inner classes capturing outer class references');
                this.outputChannel.appendLine('- Always remove ThreadLocal values when done');
                this.outputChannel.appendLine('- Use weak references for caches and listeners');
            } else if (['c', 'cpp'].includes(fileExtension)) {
                this.outputChannel.appendLine('- Every malloc/calloc needs a corresponding free');
                this.outputChannel.appendLine('- Every new needs a corresponding delete (or use smart pointers)');
                this.outputChannel.appendLine('- Always close file handles with fclose');
                this.outputChannel.appendLine('- Consider RAII pattern for resource management');
                this.outputChannel.appendLine('- Use smart pointers like std::unique_ptr or std::shared_ptr');
            }
        }
        
        // Use LLM for advanced leak detection
        this.outputChannel.appendLine('\nPerforming advanced memory leak analysis with LLM...');
        
        try {
            const prompt = `
            Analyze the following ${fileExtension} code for potential memory leaks and inefficient memory usage.
            Focus specifically on resource management issues, unclosed resources, and memory management patterns.
            
            Code:
            \`\`\`${fileExtension}
            ${fileContent}
            \`\`\`
            
            Provide your analysis as a JSON array of potential issues with the following structure:
            [
              {
                "line": <line number>,
                "issue": "<description of the memory leak or issue>",
                "severity": "<low|medium|high>",
                "suggestion": "<specific suggestion to fix the issue>"
              }
            ]
            
            Return only the JSON array with no additional text.
            `;
            
            const response = await this.llmService.generateResponse(prompt);
            
            try {
                // Extract and parse JSON
                const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
                if (jsonMatch) {
                    const issues = JSON.parse(jsonMatch[0]) as Array<Omit<MemoryIssue, 'file'>>;
                    
                    if (issues.length > 0) {
                        this.outputChannel.appendLine('\nAdvanced Analysis Results:');
                        
                        issues.forEach(issue => {
                            this.outputChannel.appendLine(`Line ${issue.line + 1}: ${issue.issue} (${issue.severity})`);
                            this.outputChannel.appendLine(`  Suggestion: ${issue.suggestion}`);
                            this.outputChannel.appendLine('');
                            
                            // Add diagnostic
                            const line = issue.line < lines.length ? issue.line : 0;
                            const lineText = lines[line];
                            const range = new vscode.Range(line, 0, line, lineText.length);
                            const diagnostic = new vscode.Diagnostic(
                                range,
                                `${issue.issue}: ${issue.suggestion}`,
                                this.getSeverity(issue.severity)
                            );
                            
                            diagnostic.source = 'Memory Optimizer (LLM)';
                            
                            // Get current diagnostics for this file
                            const currentDiagnostics = this.diagnosticCollection.get(document.uri) || [];
                            this.diagnosticCollection.set(document.uri, [...currentDiagnostics, diagnostic]);
                        });
                    } else {
                        this.outputChannel.appendLine('No additional memory issues found in advanced analysis.');
                    }
                } else {
                    this.outputChannel.appendLine('Advanced analysis completed, but no structured results were returned.');
                    this.outputChannel.appendLine(response);
                }
            } catch (error) {
                this.outputChannel.appendLine(`Error parsing LLM response: ${error}`);
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error getting LLM analysis: ${error}`);
        }
    }
    
    /**
     * Get a description for a leak pattern
     */
    private getLeakDescription(pattern: string): string {
        if (pattern.includes('addEventListener')) {
            return 'Event listener added without corresponding removal';
        } else if (pattern.includes('setInterval') || pattern.includes('setTimeout')) {
            return 'Timer created without being cleared';
        } else if (pattern.includes('this')) {
            return 'Potential circular reference';
        } else if (pattern.includes('cache')) {
            return 'Global cache without cleanup mechanism';
        } else if (pattern.includes('document.querySelector')) {
            return 'DOM reference stored in closure';
        } else if (pattern.includes('malloc') || pattern.includes('calloc')) {
            return 'Memory allocated without corresponding free()';
        } else if (pattern.includes('new')) {
            return 'Object created without being deleted';
        } else if (pattern.includes('open') || pattern.includes('fopen')) {
            return 'File opened without being closed';
        } else if (pattern.includes('Thread') || pattern.includes('Process')) {
            return 'Thread/Process created without join';
        } else if (pattern.includes('getConnection')) {
            return 'Database connection opened without being closed';
        } else {
            return 'Potential resource leak';
        }
    }
    
    /**
     * Static analysis for memory issues
     */
    private async performStaticMemoryAnalysis(content: string, fileType: string): Promise<MemoryIssue[]> {
        const issues: MemoryIssue[] = [];
        const lines = content.split('\n');
        
        // Check for general memory issues across languages
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for large array/object creation
            if (line.includes('new Array(') || line.includes('Array(')) {
                const match = line.match(/new\s+Array\s*\(\s*(\d+)/);
                if (match && parseInt(match[1]) > 10000) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Large array initialization',
                        severity: 'medium',
                        suggestion: 'Consider lazy loading or paginating large arrays',
                        affectedMemory: `~${Math.round(parseInt(match[1]) * 8 / 1024)} KB`
                    });
                }
            }
            
            // Check for large string concatenation in loops
            if ((line.includes('+=') || line.includes('+')) && 
                (line.includes('\'') || line.includes('"')) && 
                content.includes('for')) {
                // Look back to see if we're in a loop
                let isInLoop = false;
                for (let j = Math.max(0, i - 10); j < i; j++) {
                    if (lines[j].includes('for') || lines[j].includes('while')) {
                        isInLoop = true;
                        break;
                    }
                }
                
                if (isInLoop) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'String concatenation in loop',
                        severity: 'medium',
                        suggestion: 'Use an array and join() instead of string concatenation in loops'
                    });
                }
            }
            
            // Language-specific checks
            if (['js', 'ts', 'jsx', 'tsx'].includes(fileType)) {
                // JavaScript/TypeScript specific
                
                // Check for memory-intensive operations
                if (line.includes('.map') && line.includes('.filter') && line.includes('.forEach')) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Multiple array operations chained',
                        severity: 'medium',
                        suggestion: 'Multiple array transformations create intermediate arrays. Consider a single loop.'
                    });
                }
                
                // Check for closure memory leaks
                if ((line.includes('function') || line.includes('=>')) && 
                    line.includes('this') && !content.includes('bind')) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Possible closure holding reference to this',
                        severity: 'low',
                        suggestion: 'Consider binding the function or using arrow function to avoid context issues'
                    });
                }
            } else if (['py'].includes(fileType)) {
                // Python specific
                
                // Check for mutable default arguments
                if (line.match(/def\s+\w+\s*\(.*=\s*\[\]/)) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Mutable default argument',
                        severity: 'medium',
                        suggestion: 'Use None as default and initialize mutable objects inside the function'
                    });
                }
                
                // Global variables holding large data
                if (line.match(/^\w+\s*=\s*\[/) && !line.match(/^\s+\w+/)) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Global variable holding potentially large data',
                        severity: 'low',
                        suggestion: 'Consider loading data only when needed or using generator expressions'
                    });
                }
            } else if (['java'].includes(fileType)) {
                // Java specific
                
                // Check for static collections
                if (line.match(/static\s+(final\s+)?(List|Map|Set|Collection)/)) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Static collection',
                        severity: 'medium',
                        suggestion: 'Static collections can lead to memory leaks. Consider alternative design patterns.'
                    });
                }
                
                // Large object creation
                if (line.match(/new\s+\w+\s*\(\s*\d{5,}/)) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Large object creation',
                        severity: 'medium',
                        suggestion: 'Creating very large objects can strain memory. Consider chunking or streaming.'
                    });
                }
            } else if (['c', 'cpp'].includes(fileType)) {
                // C/C++ specific
                
                // Check for potential buffer overflows
                if (line.match(/\[\s*\d+\s*\]/) && !line.match(/sizeof/)) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Fixed-size buffer without bounds checking',
                        severity: 'high',
                        suggestion: 'Use safer alternatives like std::vector or add bounds checking'
                    });
                }
                
                // Check for raw pointers vs smart pointers
                if (line.match(/\w+\s*\*\s*\w+\s*=\s*new/) && !content.includes('unique_ptr') && !content.includes('shared_ptr')) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Raw pointer with new operator',
                        severity: 'medium',
                        suggestion: 'Consider using smart pointers like std::unique_ptr or std::shared_ptr'
                    });
                }
            }
        }
        
        return issues;
    }
    
    /**
     * LLM-based memory analysis
     */
    private async performLLMMemoryAnalysis(content: string, fileType: string): Promise<MemoryIssue[]> {
        try {
            // Truncate large files to avoid excessive memory usage
            if (content.length > 10000) {
                content = content.substring(0, 10000) + "\n... (content truncated for analysis)";
            }

            const prompt = `
                Analyze the following ${fileType} code for memory usage issues:
                \`\`\`${fileType}
                ${content}
                \`\`\`
            `.trim();

            const response = await this.llmService.generateResponse(prompt, {
                model: "code-analysis",
                temperature: 0.3,
                maxTokens: 1000
            });

            try {
                const jsonStr = response.trim().replace(/```json|```/g, '').trim();
                const issues = JSON.parse(jsonStr) as Array<Omit<MemoryIssue, 'file'>>;
                return issues.map(issue => ({
                    file: '',
                    ...issue
                }));
            } catch (error) {
                this.logger.error('Failed to parse LLM response:', error);
                return [];
            }
        } catch (error) {
            this.logger.error('Error in memory analysis:', error);
            return [];
        }
    }

    private async analyzeMemoryUsage(content: string, fileType: string): Promise<MemoryIssue[]> {
        const cached = this.getCachedAnalysis(content);
        if (cached) {
            return cached;
        }

        const startHeap = process.memoryUsage().heapUsed;
        const analysis = await this.performLLMMemoryAnalysis(content, fileType);
        const endHeap = process.memoryUsage().heapUsed;
        const memoryUsed = (endHeap - startHeap) / 1024 / 1024;

        this.outputChannel.appendLine(
            `Memory analysis completed. Memory used: ${memoryUsed.toFixed(2)} MB`
        );

        this.cacheAnalysis(content, analysis);
        return analysis;
    }
    
    /**
     * Adds diagnostics to the file
     */
    private addDiagnostics(fileUri: vscode.Uri, issues: MemoryIssue[], document: vscode.TextDocument): void {
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            const line = Math.min(issue.line, document.lineCount - 1);
            const lineText = document.lineAt(line).text;
            const range = new vscode.Range(line, 0, line, lineText.length);
            
            const message = issue.affectedMemory 
                ? `${issue.issue} (est. ${issue.affectedMemory}): ${issue.suggestion}`
                : `${issue.issue}: ${issue.suggestion}`;
                
            const diagnostic = new vscode.Diagnostic(
                range,
                message,
                this.getSeverity(issue.severity)
            );
            
            diagnostic.source = 'Memory Optimizer';
            return diagnostic;
        });
        
        this.diagnosticCollection.set(fileUri, diagnostics);
    }
    
    /**
     * Maps the severity level to a vscode.DiagnosticSeverity
     */
    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
    
    /**
     * Displays memory analysis results
     */
    private displayResults(issues: MemoryIssue[]): void {
        this.outputChannel.clear();
        
        if (issues.length === 0) {
            this.outputChannel.appendLine('No memory usage issues detected.');
            return;
        }
        
        this.outputChannel.appendLine(`Found ${issues.length} potential memory issues:`);
        this.outputChannel.appendLine('');
        
        issues.forEach(issue => {
            this.outputChannel.appendLine(`File: ${issue.file}`);
            this.outputChannel.appendLine(`Line: ${issue.line + 1}`);
            this.outputChannel.appendLine(`Severity: ${issue.severity.toUpperCase()}`);
            this.outputChannel.appendLine(`Issue: ${issue.issue}`);
            if (issue.affectedMemory) {
                this.outputChannel.appendLine(`Affected Memory: ${issue.affectedMemory}`);
            }
            this.outputChannel.appendLine(`Suggestion: ${issue.suggestion}`);
            this.outputChannel.appendLine('-------------------------------------------');
        });
        
        this.outputChannel.show();
    }
    
    /**
     * Generate a comprehensive memory usage report
     */
    private generateMemoryReport(issues: MemoryIssue[]): void {
        const reportFile = path.join(this.context.extensionPath, 'memory-report.md');
        
        let report = '# Memory Usage Analysis Report\n\n';
        report += `Generated on: ${new Date().toLocaleString()}\n\n`;
        
        // Group by file
        const issuesByFile: { [key: string]: MemoryIssue[] } = {};
        
        issues.forEach(issue => {
            if (!issuesByFile[issue.file]) {
                issuesByFile[issue.file] = [];
            }
            issuesByFile[issue.file].push(issue);
        });
        
        // Group by severity
        const highIssues = issues.filter(b => b.severity === 'high');
        const mediumIssues = issues.filter(b => b.severity === 'medium');
        const lowIssues = issues.filter(b => b.severity === 'low');
        
        report += '## Summary\n\n';
        report += `- Total memory issues detected: ${issues.length}\n`;
        report += `- High impact issues: ${highIssues.length}\n`;
        report += `- Medium impact issues: ${mediumIssues.length}\n`;
        report += `- Low impact issues: ${lowIssues.length}\n`;
        report += `- Files affected: ${Object.keys(issuesByFile).length}\n\n`;
        
        report += '## High Impact Issues\n\n';
        if (highIssues.length === 0) {
            report += 'No high impact memory issues detected.\n\n';
        } else {
            highIssues.forEach(issue => {
                report += `### ${issue.issue}\n`;
                report += `- File: \`${path.basename(issue.file)}\`\n`;
                report += `- Line: ${issue.line + 1}\n`;
                if (issue.affectedMemory) {
                    report += `- Affected Memory: ${issue.affectedMemory}\n`;
                }
                report += `- Suggestion: ${issue.suggestion}\n\n`;
            });
        }
        
        report += '## Findings by File\n\n';
        
        Object.keys(issuesByFile).forEach(file => {
            report += `### ${path.basename(file)}\n\n`;
            
            issuesByFile[file].forEach(issue => {
                report += `- **${issue.issue}** (${issue.severity})\n`;
                report += `  Line: ${issue.line + 1}\n`;
                if (issue.affectedMemory) {
                    report += `  Affected Memory: ${issue.affectedMemory}\n`;
                }
                report += `  Suggestion: ${issue.suggestion}\n\n`;
            });
        });
        
        report += '## General Memory Optimization Recommendations\n\n';
        report += '### JavaScript/TypeScript\n\n';
        report += '- Avoid creating unnecessary objects and arrays, especially in loops\n';
        report += '- Use object pooling for frequently created/destroyed objects\n';
        report += '- Remove event listeners when components are destroyed\n';
        report += '- Clear references to DOM elements when no longer needed\n';
        report += '- Be cautious with closures that capture large variables\n';
        report += '- Use WeakMap and WeakSet for caches that reference objects\n\n';
        
        report += '### Python\n\n';
        report += '- Use generators instead of lists for large datasets\n';
        report += '- Avoid mutable default arguments in function definitions\n';
        report += '- Use context managers (with statements) for resource management\n';
        report += '- Consider using __slots__ for classes with many instances\n';
        report += '- Be careful with cyclic references\n\n';
        
        report += '### Java\n\n';
        report += '- Use try-with-resources for all closeable resources\n';
        report += '- Be cautious with static collections and singletons\n';
        report += '- Consider using weak references for caches and listeners\n';
        report += '- Use StringBuilder for string concatenation in loops\n';
        report += '- Release resources in finally blocks\n\n';
        
        report += '### C/C++\n\n';
        report += '- Use smart pointers instead of raw pointers\n';
        report += '- Follow RAII (Resource Acquisition Is Initialization) principle\n';
        report += '- Use std::vector instead of fixed-size arrays where appropriate\n';
        report += '- Always check return values from memory allocation functions\n';
        report += '- Beware of memory fragmentation with frequent allocations/deallocations\n';
        
        fs.writeFileSync(reportFile, report);
        
        vscode.window.showInformationMessage(
            'Memory analysis report generated', 
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
