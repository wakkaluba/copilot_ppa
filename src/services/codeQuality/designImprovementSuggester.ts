import * as vscode from 'vscode';
import * as path from 'path';

export interface DesignIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'recommendation' | 'critical';
    description: string;
    improvement: string;
    category: 'architecture' | 'patterns' | 'structure' | 'modularization' | 'coupling';
}

export class DesignImprovementSuggester {
    private _context: vscode.ExtensionContext;
    private _diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('design-improvements');
        context.subscriptions.push(this._diagnosticCollection);
    }

    /**
     * Analyzes a file for potential design improvements
     */
    public async analyzeDesign(document: vscode.TextDocument): Promise<DesignIssue[]> {
        const issues: DesignIssue[] = [];
        const fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        
        // Check based on file type
        if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
            await this.analyzeJavaScriptDesign(document, issues);
        } else if (['.py'].includes(fileExtension)) {
            await this.analyzePythonDesign(document, issues);
        } else if (['.java'].includes(fileExtension)) {
            await this.analyzeJavaDesign(document, issues);
        } else if (['.cs'].includes(fileExtension)) {
            await this.analyzeCSharpDesign(document, issues);
        }
        
        // Update diagnostics
        this.updateDiagnostics(document, issues);
        
        return issues;
    }

    /**
     * Analyzes a workspace for architectural patterns and improvements
     */
    public async analyzeWorkspaceArchitecture(): Promise<DesignIssue[]> {
        const issues: DesignIssue[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (!workspaceFolders) {
            return issues;
        }
        
        // Analyze project structure
        await this.analyzeProjectStructure(workspaceFolders[0].uri.fsPath, issues);
        
        // Analyze dependency graph
        await this.analyzeDependencyGraph(workspaceFolders[0].uri.fsPath, issues);
        
        return issues;
    }

    /**
     * Suggests architectural patterns based on project analysis
     */
    public suggestArchitecturalPatterns(codebase: string): string[] {
        const suggestions: string[] = [];
        
        // Detect potential architectural patterns
        if (this.detectMVCPattern(codebase)) {
            suggestions.push('Consider fully adopting the MVC pattern for better separation of concerns.');
        }
        
        if (this.detectSingletonUsage(codebase)) {
            suggestions.push('Multiple singletons detected. Consider using dependency injection instead to improve testability.');
        }
        
        if (this.detectLargeClasses(codebase)) {
            suggestions.push('Large classes detected. Consider breaking them down using composition or inheritance.');
        }
        
        return suggestions;
    }
    
    private async analyzeJavaScriptDesign(document: vscode.TextDocument, issues: DesignIssue[]): Promise<void> {
        const text = document.getText();
        
        // Check for large React components
        if (text.includes('import React') || text.includes('from "react"')) {
            this.findLargeReactComponents(document, issues);
        }
        
        // Check for tight coupling between modules
        this.findTightCoupling(document, issues);
        
        // Check for inappropriate use of design patterns
        this.findInappropriatePatterns(document, issues);
        
        // Check for missing modularity
        this.findModularityIssues(document, issues);
    }
    
    private async analyzePythonDesign(document: vscode.TextDocument, issues: DesignIssue[]): Promise<void> {
        const text = document.getText();
        
        // Check for violation of SOLID principles
        this.findPythonSOLIDViolations(document, issues);
        
        // Check for improper use of inheritance vs. composition
        this.findImproperInheritance(document, issues);
    }
    
    private async analyzeJavaDesign(document: vscode.TextDocument, issues: DesignIssue[]): Promise<void> {
        const text = document.getText();
        
        // Check for violation of encapsulation
        this.findEncapsulationIssues(document, issues);
        
        // Check for misuse of static methods/classes
        this.findStaticMisuse(document, issues);
    }
    
    private async analyzeCSharpDesign(document: vscode.TextDocument, issues: DesignIssue[]): Promise<void> {
        const text = document.getText();
        
        // Check for proper usage of interfaces
        this.findInterfaceIssues(document, issues);
        
        // Check for proper LINQ usage
        this.findLINQIssues(document, issues);
    }
    
    private async analyzeProjectStructure(rootPath: string, issues: DesignIssue[]): Promise<void> {
        // This would normally involve more complex directory analysis
        try {
            const fs = vscode.workspace.fs;
            const dirEntries = await fs.readDirectory(vscode.Uri.file(rootPath));
            
            // Look for common architectural issues
            let hasSrcFolder = false;
            let hasTestFolder = false;
            let hasConfigFolder = false;
            
            for (const [name, type] of dirEntries) {
                if (type === vscode.FileType.Directory) {
                    if (name === 'src') hasSrcFolder = true;
                    if (name === 'test' || name === 'tests') hasTestFolder = true;
                    if (name === 'config') hasConfigFolder = true;
                }
            }
            
            if (!hasSrcFolder) {
                issues.push({
                    file: rootPath,
                    line: 1,
                    column: 1,
                    severity: 'suggestion',
                    description: 'No dedicated source folder found',
                    improvement: 'Consider organizing your code into a dedicated "src" folder for better structure',
                    category: 'structure'
                });
            }
            
            if (!hasTestFolder) {
                issues.push({
                    file: rootPath,
                    line: 1,
                    column: 1,
                    severity: 'suggestion',
                    description: 'No dedicated test folder found',
                    improvement: 'Consider adding a dedicated "test" or "tests" folder for test files',
                    category: 'structure'
                });
            }
        } catch (error) {
            console.error('Error analyzing project structure:', error);
        }
    }
    
    private async analyzeDependencyGraph(rootPath: string, issues: DesignIssue[]): Promise<void> {
        // This would normally use package.json and imports analysis
        try {
            const fs = vscode.workspace.fs;
            const packageJsonUri = vscode.Uri.file(path.join(rootPath, 'package.json'));
            
            try {
                const packageJsonContent = await fs.readFile(packageJsonUri);
                const packageJson = JSON.parse(packageJsonContent.toString());
                
                // Check for circular dependencies - simplified example
                if (packageJson.dependencies && packageJson.devDependencies) {
                    const allDeps = {
                        ...packageJson.dependencies,
                        ...packageJson.devDependencies
                    };
                    
                    // Check for potential version conflicts
                    const depsWithMultipleVersions = new Map<string, string[]>();
                    Object.keys(allDeps).forEach(dep => {
                        const baseName = dep.split('/')[0];
                        if (!depsWithMultipleVersions.has(baseName)) {
                            depsWithMultipleVersions.set(baseName, []);
                        }
                        depsWithMultipleVersions.get(baseName)?.push(dep);
                    });
                    
                    for (const [baseName, deps] of depsWithMultipleVersions.entries()) {
                        if (deps.length > 1) {
                            issues.push({
                                file: packageJsonUri.fsPath,
                                line: 1,
                                column: 1,
                                severity: 'recommendation',
                                description: `Multiple related dependencies for ${baseName}: ${deps.join(', ')}`,
                                improvement: 'Consider consolidating related dependencies to reduce complexity',
                                category: 'coupling'
                            });
                        }
                    }
                }
            } catch (error) {
                // Package.json not found or invalid, that's okay
            }
        } catch (error) {
            console.error('Error analyzing dependency graph:', error);
        }
    }
    
    private findLargeReactComponents(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Simple heuristic to find component definitions
        const componentRegexes = [
            /class\s+(\w+)\s+extends\s+React\.Component/g,
            /class\s+(\w+)\s+extends\s+Component/g,
            /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
            /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g
        ];
        
        for (const regex of componentRegexes) {
            let match;
            while ((match = regex.exec(text)) !== null) {
                const componentName = match[1];
                const componentStartPos = match.index;
                
                // Find the approximate end of the component
                let componentEndPos = text.indexOf(`export default ${componentName}`, componentStartPos);
                if (componentEndPos === -1) {
                    componentEndPos = text.indexOf('export default', componentStartPos);
                }
                if (componentEndPos === -1) {
                    componentEndPos = text.length;
                }
                
                const componentCode = text.substring(componentStartPos, componentEndPos);
                const lineCount = componentCode.split('\n').length;
                
                // Check component size
                if (lineCount > 200) {
                    const position = document.positionAt(componentStartPos);
                    issues.push({
                        file: document.uri.fsPath,
                        line: position.line + 1,
                        column: position.character + 1,
                        severity: 'critical',
                        description: `React component '${componentName}' is too large (${lineCount} lines)`,
                        improvement: 'Break this component into smaller, more focused components. Consider using composition patterns.',
                        category: 'structure'
                    });
                }
                
                // Check for jsx complexity
                const jsxTagCount = (componentCode.match(/<[A-Z][^>]*>/g) || []).length;
                if (jsxTagCount > 30) {
                    const position = document.positionAt(componentStartPos);
                    issues.push({
                        file: document.uri.fsPath,
                        line: position.line + 1,
                        column: position.character + 1,
                        severity: 'recommendation',
                        description: `React component '${componentName}' has complex JSX (${jsxTagCount} custom elements)`,
                        improvement: 'Extract parts of the JSX into separate components or use composition to reduce complexity.',
                        category: 'structure'
                    });
                }
                
                // Check for prop drilling
                const propUsageMatches = [...componentCode.matchAll(/props\.(\w+)/g)];
                const uniqueProps = new Set(propUsageMatches.map(m => m[1]));
                
                if (uniqueProps.size > 10) {
                    const position = document.positionAt(componentStartPos);
                    issues.push({
                        file: document.uri.fsPath,
                        line: position.line + 1,
                        column: position.character + 1,
                        severity: 'recommendation',
                        description: `React component '${componentName}' has many props (${uniqueProps.size} unique props)`,
                        improvement: 'Consider using Context API, state management library, or restructuring component hierarchy to avoid prop drilling.',
                        category: 'patterns'
                    });
                }
            }
        }
    }
    
    private findTightCoupling(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        const importLines = text.match(/import\s+.*\s+from\s+['"].*['"]/g) || [];
        
        // Check for excessive imports
        if (importLines.length > 15) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'recommendation',
                description: `This file has a high number of imports (${importLines.length})`,
                improvement: 'High number of imports often indicates too many dependencies. Consider refactoring to reduce coupling.',
                category: 'coupling'
            });
        }
        
        // Check for direct imports from deep paths (potentially bypassing abstraction layers)
        const deepImports = importLines.filter(line => {
            const match = line.match(/from\s+['"]([^'"]*)['"]/);
            if (match && match[1].startsWith('.')) {
                const importPath = match[1];
                return importPath.split('/').length > 3; // Arbitrary threshold
            }
            return false;
        });
        
        if (deepImports.length > 0) {
            issues.push({
                file: document.uri.fsPath,
                line: deepImports[0].split('\n')[0].length,
                column: 1,
                severity: 'suggestion',
                description: 'Deep relative imports detected',
                improvement: 'Consider creating intermediate abstraction layers or barrel files to simplify imports and reduce coupling.',
                category: 'coupling'
            });
        }
    }
    
    private findInappropriatePatterns(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Check for singleton pattern misuse
        const singletonPattern = /let\s+(\w+)Instance\s*;[\s\S]*if\s*\(\s*!\s*\1Instance\s*\)/g;
        this.findPatternInDocument(document, singletonPattern, {
            severity: 'recommendation',
            description: 'Potential singleton pattern implementation',
            improvement: 'Singleton pattern can make code harder to test. Consider dependency injection instead.',
            category: 'patterns'
        }, issues);
        
        // Check for god objects (large classes with many methods)
        const classDefRegex = /class\s+(\w+)[\s\n]*{[\s\S]*?}/g;
        let match;
        while ((match = classDefRegex.exec(text)) !== null) {
            const className = match[1];
            const classContent = match[0];
            const methodCount = (classContent.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
            
            if (methodCount > 10) {
                const position = document.positionAt(match.index);
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'recommendation',
                    description: `Class '${className}' has too many methods (${methodCount})`,
                    improvement: 'Large classes with many methods often violate the Single Responsibility Principle. Consider breaking it into smaller, more focused classes.',
                    category: 'patterns'
                });
            }
        }
    }
    
    private findModularityIssues(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        const fileName = path.basename(document.uri.fsPath);
        
        // Check file size as a proxy for modularity
        const lineCount = text.split('\n').length;
        if (lineCount > 300) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'recommendation',
                description: `File is very large (${lineCount} lines)`,
                improvement: 'Consider breaking this file into multiple smaller modules for better maintainability.',
                category: 'modularization'
            });
        }
        
        // Check for multiple exports that could be separated
        const exportedItems = (text.match(/export\s+(default\s+)?(class|function|const|let|var|interface|type)\s+\w+/g) || []);
        if (exportedItems.length > 3 && !fileName.includes('index.')) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: `File exports multiple items (${exportedItems.length})`,
                improvement: 'Consider separating concerns into individual files or using a barrel file pattern.',
                category: 'modularization'
            });
        }
    }
    
    private findPythonSOLIDViolations(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Check for violations of the Single Responsibility Principle
        const classDefRegex = /class\s+(\w+)[\s\n]*(?:\([^)]*\))?[\s\n]*:/g;
        let match;
        while ((match = classDefRegex.exec(text)) !== null) {
            const className = match[1];
            
            // Find class body (simplified)
            const classStart = match.index;
            const nextClassPos = text.indexOf('class ', classStart + 6);
            const classEnd = nextClassPos !== -1 ? nextClassPos : text.length;
            const classContent = text.substring(classStart, classEnd);
            
            // Count methods as a proxy for responsibilities
            const methodCount = (classContent.match(/def\s+\w+\s*\(/g) || []).length;
            const commentTerms = ['read', 'write', 'validate', 'process', 'calculate', 'display', 'format', 'parse'];
            
            // Check for comments indicating multiple responsibilities
            let hasMultipleResponsibilities = false;
            for (const term of commentTerms) {
                if (classContent.match(new RegExp(`#.*${term}`, 'gi')) && 
                    classContent.match(new RegExp(`def\\s+\\w*${term}\\w*\\s*\\(`, 'gi'))) {
                    hasMultipleResponsibilities = true;
                    break;
                }
            }
            
            if (methodCount > 7 || hasMultipleResponsibilities) {
                const position = document.positionAt(match.index);
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'recommendation',
                    description: `Class '${className}' may have too many responsibilities`,
                    improvement: 'Consider breaking this class into multiple classes, each with a single responsibility (SRP).',
                    category: 'patterns'
                });
            }
        }
    }
    
    private findImproperInheritance(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Look for inheritance where composition might be better
        const inheritanceRegex = /class\s+(\w+)\s*\(\s*(\w+)\s*\)/g;
        let match;
        while ((match = inheritanceRegex.exec(text)) !== null) {
            const childClass = match[1];
            const parentClass = match[2];
            
            // Find class body
            const classStart = match.index;
            const nextClassPos = text.indexOf('class ', classStart + 6);
            const classEnd = nextClassPos !== -1 ? nextClassPos : text.length;
            const classContent = text.substring(classStart, classEnd);
            
            // Check for method overrides that don't call super()
            const methodOverrides = classContent.match(/def\s+(\w+)\s*\([^)]*\):/g) || [];
            for (const methodOverride of methodOverrides) {
                const methodName = methodOverride.match(/def\s+(\w+)/) || ['', ''];
                if (methodName[1] && !methodName[1].startsWith('__') && 
                    !classContent.includes(`super().${methodName[1]}(`)) {
                    
                    const position = document.positionAt(classStart);
                    issues.push({
                        file: document.uri.fsPath,
                        line: position.line + 1,
                        column: position.character + 1,
                        severity: 'suggestion',
                        description: `Class '${childClass}' overrides methods from '${parentClass}' without calling super()`,
                        improvement: 'Consider using composition instead of inheritance if you\'re completely replacing parent behavior.',
                        category: 'patterns'
                    });
                    break;
                }
            }
        }
    }
    
    private findEncapsulationIssues(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Check for public fields that should be private/protected
        const publicFieldRegex = /public\s+(?!static\s+final|final\s+static|void|class|interface|enum)[A-Za-z<>\\[\],\s]+\s+(\w+)\s*;/g;
        let match;
        while ((match = publicFieldRegex.exec(text)) !== null) {
            const fieldName = match[1];
            
            // Skip constants (likely all uppercase)
            if (fieldName === fieldName.toUpperCase()) {
                continue;
            }
            
            const position = document.positionAt(match.index);
            issues.push({
                file: document.uri.fsPath,
                line: position.line + 1,
                column: position.character + 1,
                severity: 'suggestion',
                description: `Public field '${fieldName}' may violate encapsulation`,
                improvement: 'Consider making this field private and providing accessor methods if needed.',
                category: 'patterns'
            });
        }
    }
    
    private findStaticMisuse(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Check for static methods that could be instance methods
        const staticMethodRegex = /public\s+static\s+(?!void\s+main|final)[A-Za-z<>\\[\],\s]+\s+(\w+)\s*\([^)]*\)/g;
        let match;
        while ((match = staticMethodRegex.exec(text)) !== null) {
            const methodName = match[1];
            
            // Find context - look for 'this' references
            const methodMatch = text.substring(match.index).match(new RegExp(`${methodName}\\s*\\([^{]*\\{([\\s\\S]*?)\\}`));
            if (methodMatch && !methodMatch[1].includes('this.')) {
                const position = document.positionAt(match.index);
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'suggestion',
                    description: `Static method '${methodName}' might be better as an instance method`,
                    improvement: 'Consider making it an instance method if it conceptually belongs to objects of this class.',
                    category: 'patterns'
                });
            }
        }
    }
    
    private findInterfaceIssues(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Check for interfaces with only one implementation
        const interfaceRegex = /interface\s+I(\w+)/g;
        let match;
        while ((match = interfaceRegex.exec(text)) !== null) {
            const interfaceName = match[1];
            
            // Simplified check - in real implementation would check other files
            const implementations = text.match(new RegExp(`class\\s+\\w+\\s*:\\s*I${interfaceName}`));
            if (!implementations) {
                const position = document.positionAt(match.index);
                issues.push({
                    file: document.uri.fsPath,
                    line: position.line + 1,
                    column: position.character + 1,
                    severity: 'suggestion',
                    description: `Interface 'I${interfaceName}' might have only one implementation`,
                    improvement: 'Consider if this interface is necessary. Interfaces with single implementations might add unnecessary complexity.',
                    category: 'patterns'
                });
            }
        }
    }
    
    private findLINQIssues(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const text = document.getText();
        
        // Check for multiple LINQ operations that could be combined
        const multipleLinqOpsRegex = /\.Select\([^)]+\)\s*\.\s*Where\(/g;
        this.findPatternInDocument(document, multipleLinqOpsRegex, {
            severity: 'suggestion',
            description: 'Potentially inefficient LINQ operation order',
            improvement: 'Consider using Where before Select to filter items earlier in the chain for better performance.',
            category: 'performance'
        }, issues);
    }
    
    private detectMVCPattern(codebase: string): boolean {
        // Simplified detection - check for folders/namespaces
        return codebase.includes('controllers') && codebase.includes('models') && codebase.includes('views');
    }
    
    private detectSingletonUsage(codebase: string): boolean {
        // Simplified detection for singleton pattern
        return codebase.includes('getInstance') || codebase.includes('instance =') || codebase.includes('static instance');
    }
    
    private detectLargeClasses(codebase: string): boolean {
        // Simplified detection for large classes
        const classMatches = codebase.match(/class\s+\w+[\s\n]*{[\s\S]*?}/g) || [];
        for (const classMatch of classMatches) {
            if (classMatch.length > 1000) { // Arbitrary threshold
                return true;
            }
        }
        return false;
    }
    
    private findPatternInDocument(
        document: vscode.TextDocument, 
        pattern: RegExp, 
        issueTemplate: {
            severity: DesignIssue['severity'], 
            description: string, 
            improvement: string,
            category: DesignIssue['category']
        },
        issues: DesignIssue[]
    ): void {
        const text = document.getText();
        let match: RegExpExecArray | null;
        
        while ((match = pattern.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                file: document.uri.fsPath,
                line: position.line + 1,
                column: position.character + 1,
                severity: issueTemplate.severity,
                description: issueTemplate.description,
                improvement: issueTemplate.improvement,
                category: issueTemplate.category
            });
        }
    }
    
    private updateDiagnostics(document: vscode.TextDocument, issues: DesignIssue[]): void {
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            const range = new vscode.Range(
                issue.line - 1, issue.column - 1,
                issue.line - 1, issue.column + 20
            );
            
            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.description}\n${issue.improvement}`,
                this.mapSeverityToDiagnosticSeverity(issue.severity)
            );
            
            diagnostic.source = 'Design Improvement';
            return diagnostic;
        });
        
        this._diagnosticCollection.set(document.uri, diagnostics);
    }
    
    private mapSeverityToDiagnosticSeverity(severity: DesignIssue['severity']): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical': return vscode.DiagnosticSeverity.Error;
            case 'recommendation': return vscode.DiagnosticSeverity.Warning;
            case 'suggestion': return vscode.DiagnosticSeverity.Information;
        }
    }
}
