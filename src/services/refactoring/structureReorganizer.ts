import * as parser from '@typescript-eslint/parser';
import * as path from 'path';
import * as vscode from 'vscode';

export interface StructureSuggestion {
    type: 'split_file' | 'reduce_nesting' | 'split_function' | 'move_method' | 'extract_interface';
    description: string;
    severity: 'suggestion' | 'recommendation' | 'warning';
    location?: { start: number; end: number };
}

export interface StructureAnalysisResult {
    suggestions: StructureSuggestion[];
    summary: string;
    metrics?: {
        complexity: number;
        maintainability: number;
        coupling: number;
    };
}

export interface ReorganizationProposal {
    originalCode: string;
    reorganizedCode: string;
    changes: Array<{
        type: string;
        description: string;
        location: { start: number; end: number };
    }>;
}

/**
 * Service responsible for analyzing and reorganizing code structure
 */
export class StructureReorganizer {
    private readonly supportedLanguages = new Map([
        ['javascript', ['.js', '.jsx']],
        ['typescript', ['.ts', '.tsx']],
        ['python', ['.py']],
        ['java', ['.java']],
        ['csharp', ['.cs']],
        ['ruby', ['.rb']]
    ]);

    /**
     * Analyzes the structure of a file and suggests improvements
     * @param filePath Path to the file to analyze
     * @returns Analysis result with suggestions
     */
    public async analyzeFileStructure(filePath: string): Promise<StructureAnalysisResult> {
        const document = await vscode.workspace.openTextDocument(filePath);
        const text = document.getText();
        const fileExtension = path.extname(filePath).toLowerCase();

        // Determine language and apply appropriate analysis
        for (const [language, extensions] of this.supportedLanguages) {
            if (extensions.includes(fileExtension)) {
                return this.analyzeByLanguage(text, language);
            }
        }

        return {
            suggestions: [],
            summary: "Unsupported file type for structure analysis"
        };
    }

    /**
     * Proposes reorganization for the given code
     */
    public async proposeReorganization(filePath: string): Promise<ReorganizationProposal> {
        const analysisResult = await this.analyzeFileStructure(filePath);
        const document = await vscode.workspace.openTextDocument(filePath);
        const text = document.getText();

        // Create reorganization proposal based on analysis
        return {
            originalCode: text,
            reorganizedCode: await this.generateReorganizedCode(text, analysisResult),
            changes: analysisResult.suggestions.map(s => ({
                type: s.type,
                description: s.description,
                location: s.location || { start: 0, end: 0 }
            }))
        };
    }

    private async analyzeByLanguage(code: string, language: string): Promise<StructureAnalysisResult> {
        switch (language) {
            case 'typescript':
            case 'javascript':
                return this.analyzeJavaScriptStructure(code, language === 'typescript');
            case 'python':
                return this.analyzePythonStructure(code);
            case 'java':
                return this.analyzeJavaStructure(code);
            default:
                return {
                    suggestions: [],
                    summary: `Analysis not implemented for ${language}`
                };
        }
    }

    private async analyzeJavaScriptStructure(code: string, isTypeScript: boolean): Promise<StructureAnalysisResult> {
        const suggestions: StructureSuggestion[] = [];

        try {
            const ast = parser.parse(code, {
                sourceType: 'module',
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true }
            });

            // Analyze file size
            if (code.length > 1000) {
                suggestions.push({
                    type: 'split_file',
                    description: 'File is quite large and might benefit from being split into multiple modules',
                    severity: 'suggestion'
                });
            }

            // Check code nesting
            const maxIndentLevel = this.detectMaxIndentation(code);
            if (maxIndentLevel > 4) {
                suggestions.push({
                    type: 'reduce_nesting',
                    description: `Code has deep nesting (${maxIndentLevel} levels). Consider refactoring to reduce complexity`,
                    severity: 'recommendation'
                });
            }

            // Analyze function size and complexity
            const largeFunctions = this.detectLargeFunctions(code);
            for (const func of largeFunctions) {
                suggestions.push({
                    type: 'split_function',
                    description: `Function '${func.name}' is ${func.lines} lines long. Consider breaking it down into smaller functions`,
                    severity: 'warning',
                    location: func.location
                });
            }

            // Calculate metrics
            const metrics = {
                complexity: this.calculateComplexity(code),
                maintainability: this.calculateMaintainability(code),
                coupling: this.calculateCoupling(code)
            };

            return {
                suggestions,
                summary: `Found ${suggestions.length} structure improvement suggestions`,
                metrics
            };
        } catch (error) {
            return {
                suggestions: [],
                summary: `Error analyzing ${isTypeScript ? 'TypeScript' : 'JavaScript'} code: ${error}`
            };
        }
    }

    private analyzePythonStructure(code: string): Promise<StructureAnalysisResult> {
        // Implementation for Python structure analysis
        return Promise.resolve({
            suggestions: [],
            summary: "Python structure analysis will be implemented in the next release"
        });
    }

    private analyzeJavaStructure(code: string): Promise<StructureAnalysisResult> {
        // Implementation for Java structure analysis
        return Promise.resolve({
            suggestions: [],
            summary: "Java structure analysis will be implemented in the next release"
        });
    }

    private calculateComplexity(code: string): number {
        // Basic cyclomatic complexity calculation
        const controlFlowKeywords = ['if', 'while', 'for', 'case', '&&', '||', '?'];
        return controlFlowKeywords.reduce((count, keyword) =>
            count + (code.match(new RegExp(keyword, 'g')) || []).length, 1);
    }

    private calculateMaintainability(code: string): number {
        const lineCount = code.split('\n').length;
        const commentCount = (code.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
        const commentRatio = commentCount / lineCount;
        return Math.min(100, (commentRatio * 30) + (1 / this.calculateComplexity(code) * 70));
    }

    private calculateCoupling(code: string): number {
        const imports = (code.match(/import .* from ['"].*['"];?/g) || []).length;
        const requires = (code.match(/require\(['"].*['"]\)/g) || []).length;
        return imports + requires;
    }

    private detectMaxIndentation(code: string): number {
        const lines = code.split('\n');
        let maxIndent = 0;

        for (const line of lines) {
            const trimStart = line.length - line.trimStart().length;
            const indentLevel = Math.floor(trimStart / 2); // Assuming 2 spaces per indent level
            maxIndent = Math.max(maxIndent, indentLevel);
        }

        return maxIndent;
    }

    private detectLargeFunctions(code: string): Array<{name: string, lines: number, location: {start: number, end: number}}> {
        const result: Array<{name: string, lines: number, location: {start: number, end: number}}> = [];
        const functionRegex = /(?:function|class|const|let|var)\s+(\w+)\s*(?:=\s*(?:function|\([\s\S]*?\)\s*=>)|\([^)]*\))?[\s]*{/g;

        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            const startPos = match.index;
            const name = match[1];

            let braceCount = 0;
            let endPos = startPos;

            for (let i = startPos; i < code.length; i++) {
                if (code[i] === '{') braceCount++;
                if (code[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        endPos = i;
                        break;
                    }
                }
            }

            const funcCode = code.substring(startPos, endPos + 1);
            const lineCount = funcCode.split('\n').length;

            if (lineCount > 30) { // Consider functions over 30 lines as "large"
                result.push({
                    name,
                    lines: lineCount,
                    location: {start: startPos, end: endPos}
                });
            }
        }

        return result;
    }

    private async generateReorganizedCode(originalCode: string, analysis: StructureAnalysisResult): Promise<string> {
        // This is a placeholder - actual implementation would apply the suggested changes
        return originalCode;
    }
}
