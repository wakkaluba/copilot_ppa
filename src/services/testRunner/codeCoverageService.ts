import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { TestResult } from './testRunnerTypes';

/**
 * Options for code coverage analysis
 */
export interface CodeCoverageOptions {
    /** Path to analyze */
    path?: string;
    /** Custom command to run */
    command?: string;
    /** Coverage tool to use */
    tool?: 'jest' | 'nyc' | 'istanbul' | 'c8' | 'custom';
    /** Path to coverage report */
    reportPath?: string;
    /** Format of coverage report */
    reportFormat?: 'lcov' | 'json' | 'html' | 'text';
    /** Threshold for minimum coverage */
    threshold?: number;
}

/**
 * Coverage data for a file
 */
export interface FileCoverage {
    /** Path to the file */
    path: string;
    /** Percentage of statements covered */
    statements: number;
    /** Percentage of branches covered */
    branches: number;
    /** Percentage of functions covered */
    functions: number;
    /** Percentage of lines covered */
    lines: number;
    /** Overall coverage percentage */
    overall: number;
    /** Line coverage details */
    lineDetails?: {
        /** Lines that are covered */
        covered: number[];
        /** Lines that are not covered */
        uncovered: number[];
        /** Lines that are partially covered */
        partial: number[];
    };
}

/**
 * Summary of code coverage
 */
export interface CoverageSummary {
    /** Overall coverage percentage */
    overall: number;
    /** Statement coverage percentage */
    statements: number;
    /** Branch coverage percentage */
    branches: number;
    /** Function coverage percentage */
    functions: number;
    /** Line coverage percentage */
    lines: number;
    /** Number of files analyzed */
    totalFiles: number;
    /** Coverage data for individual files */
    files: FileCoverage[];
}

/**
 * Service for analyzing code coverage
 */
export class CodeCoverageService {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Code Coverage');
    }

    /**
     * Run code coverage analysis
     */
    public async runCoverageAnalysis(options: CodeCoverageOptions): Promise<TestResult> {
        const workspacePath = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            return {
                success: false,
                message: 'No workspace folder found'
            };
        }

        this.outputChannel.appendLine(`Running code coverage analysis on ${workspacePath}`);
        this.outputChannel.show();

        try {
            // Detect the coverage tool if not specified
            const tool = options.tool || await this.detectCoverageTool(workspacePath);
            if (!tool) {
                return {
                    success: false,
                    message: 'No code coverage tool detected'
                };
            }

            // Build the command to run code coverage
            let command = options.command;
            if (!command) {
                command = this.buildCoverageCommand(tool, options);
            }

            this.outputChannel.appendLine(`Running command: ${command}`);

            // Execute the command
            const result = await this.executeCommand(command, workspacePath);

            // Find and parse the coverage report
            const reportPath = options.reportPath || this.findCoverageReport(workspacePath, tool, options.reportFormat);
            if (reportPath) {
                this.outputChannel.appendLine(`Found coverage report at ${reportPath}`);
                
                const coverageData = await this.parseCoverageReport(reportPath, tool, options.reportFormat);
                
                if (coverageData) {
                    result.codeCoverage = coverageData;
                    
                    // Check if coverage meets threshold
                    const threshold = options.threshold || 80;
                    const passesThreshold = coverageData.overall >= threshold;
                    
                    result.success = result.success && passesThreshold;
                    
                    if (!passesThreshold) {
                        result.message = `Code coverage (${coverageData.overall.toFixed(2)}%) is below threshold (${threshold}%)`;
                    } else {
                        result.message = `Code coverage analysis successful. Overall coverage: ${coverageData.overall.toFixed(2)}%`;
                    }
                }
            } else {
                this.outputChannel.appendLine('No coverage report found');
            }

            return result;
        } catch (error) {
            const errorMsg = `Error running code coverage analysis: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }

    /**
     * Execute a command and return the result
     */
    private async executeCommand(command: string, cwd: string): Promise<TestResult> {
        return new Promise((resolve) => {
            const process = cp.exec(command, { cwd });
            
            let stdout = '';
            let stderr = '';
            
            process.stdout?.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                this.outputChannel.append(output);
            });
            
            process.stderr?.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                this.outputChannel.append(output);
            });
            
            process.on('close', (code) => {
                const success = code === 0;
                const result: TestResult = {
                    success,
                    message: success ? 'Code coverage analysis completed successfully' : 'Code coverage analysis failed',
                    exitCode: code,
                    stdout,
                    stderr
                };
                
                resolve(result);
            });
        });
    }

    /**
     * Detect which code coverage tool is used in the project
     */
    private async detectCoverageTool(workspacePath: string): Promise<string | undefined> {
        // Check package.json for dependencies
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const allDeps = {
                    ...(packageJson.dependencies || {}),
                    ...(packageJson.devDependencies || {})
                };
                
                if (allDeps.jest) {
                    return 'jest';
                }
                
                if (allDeps.nyc || allDeps['istanbul-lib-coverage']) {
                    return 'nyc';
                }
                
                if (allDeps.istanbul) {
                    return 'istanbul';
                }
                
                if (allDeps.c8) {
                    return 'c8';
                }
                
                // Check for scripts that run coverage
                if (packageJson.scripts) {
                    const scriptKeys = Object.keys(packageJson.scripts);
                    for (const key of scriptKeys) {
                        const scriptValue = packageJson.scripts[key].toLowerCase();
                        
                        if (key.includes('coverage') || key.includes('test:cov')) {
                            if (scriptValue.includes('jest')) {
                                return 'jest';
                            }
                            if (scriptValue.includes('nyc')) {
                                return 'nyc';
                            }
                            if (scriptValue.includes('istanbul')) {
                                return 'istanbul';
                            }
                            if (scriptValue.includes('c8')) {
                                return 'c8';
                            }
                            
                            // Found a coverage script but couldn't determine the tool
                            return 'custom';
                        }
                    }
                }
            } catch (error) {
                // Ignore JSON parsing errors
            }
        }
        
        // Check for coverage configuration files
        if (fs.existsSync(path.join(workspacePath, 'jest.config.js')) || 
            fs.existsSync(path.join(workspacePath, 'jest.config.ts'))) {
            return 'jest';
        }
        
        if (fs.existsSync(path.join(workspacePath, '.nycrc')) || 
            fs.existsSync(path.join(workspacePath, '.nycrc.json'))) {
            return 'nyc';
        }
        
        if (fs.existsSync(path.join(workspacePath, '.istanbul.yml'))) {
            return 'istanbul';
        }
        
        return undefined;
    }

    /**
     * Build the command to run code coverage
     */
    private buildCoverageCommand(tool: string, options: CodeCoverageOptions): string {
        switch (tool) {
            case 'jest':
                return 'npx jest --coverage';
                
            case 'nyc':
                return 'npx nyc npm test';
                
            case 'istanbul':
                return 'npx istanbul cover npm test';
                
            case 'c8':
                return 'npx c8 npm test';
                
            default:
                return 'npm run coverage';
        }
    }

    /**
     * Find the coverage report generated by the tool
     */
    private findCoverageReport(workspacePath: string, tool: string, format?: string): string | undefined {
        const possiblePaths: string[] = [];
        
        switch (tool) {
            case 'jest':
                possiblePaths.push(
                    path.join(workspacePath, 'coverage', 'coverage-final.json'),
                    path.join(workspacePath, 'coverage', 'lcov.info'),
                    path.join(workspacePath, 'coverage', 'coverage-summary.json')
                );
                break;
                
            case 'nyc':
            case 'istanbul':
                possiblePaths.push(
                    path.join(workspacePath, '.nyc_output', 'coverage.json'),
                    path.join(workspacePath, 'coverage', 'lcov.info'),
                    path.join(workspacePath, 'coverage', 'coverage-summary.json')
                );
                break;
                
            case 'c8':
                possiblePaths.push(
                    path.join(workspacePath, 'coverage', 'coverage-final.json'),
                    path.join(workspacePath, 'coverage', 'lcov.info')
                );
                break;
                
            default:
                possiblePaths.push(
                    path.join(workspacePath, 'coverage', 'coverage-final.json'),
                    path.join(workspacePath, 'coverage', 'lcov.info'),
                    path.join(workspacePath, 'coverage', 'coverage-summary.json'),
                    path.join(workspacePath, '.nyc_output', 'coverage.json')
                );
                break;
        }
        
        // Filter paths by format if specified
        if (format) {
            const formatExtensions: Record<string, string[]> = {
                'json': ['.json'],
                'lcov': ['.info', '.lcov'],
                'html': ['.html'],
                'text': ['.txt']
            };
            
            const extensions = formatExtensions[format] || [];
            if (extensions.length > 0) {
                possiblePaths.filter(p => extensions.some(ext => p.endsWith(ext)));
            }
        }
        
        // Return the first path that exists
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
        
        return undefined;
    }

    /**
     * Parse the coverage report
     */
    private async parseCoverageReport(reportPath: string, tool: string, format?: string): Promise<CoverageSummary | undefined> {
        try {
            const content = fs.readFileSync(reportPath, 'utf8');
            
            // Determine the format based on the file extension if not specified
            if (!format) {
                if (reportPath.endsWith('.json')) {
                    format = 'json';
                } else if (reportPath.endsWith('.info') || reportPath.endsWith('.lcov')) {
                    format = 'lcov';
                } else if (reportPath.endsWith('.html')) {
                    format = 'html';
                } else {
                    format = 'text';
                }
            }
            
            switch (format) {
                case 'json':
                    return this.parseJsonCoverageReport(content, tool);
                    
                case 'lcov':
                    return this.parseLcovCoverageReport(content);
                    
                case 'text':
                case 'html':
                    return this.extractCoverageFromText(content);
                    
                default:
                    return undefined;
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error parsing coverage report: ${error}`);
            return undefined;
        }
    }

    /**
     * Parse a JSON coverage report
     */
    private parseJsonCoverageReport(content: string, tool: string): CoverageSummary {
        const data = JSON.parse(content);
        
        if (tool === 'jest') {
            return this.parseJestCoverage(data);
        } else if (tool === 'nyc' || tool === 'istanbul') {
            return this.parseNycCoverage(data);
        } else if (tool === 'c8') {
            return this.parseC8Coverage(data);
        }
        
        // Generic JSON parser for common format
        const fileCoverage: FileCoverage[] = [];
        let totalStatements = 0;
        let totalBranches = 0;
        let totalFunctions = 0;
        let totalLines = 0;
        let coveredStatements = 0;
        let coveredBranches = 0;
        let coveredFunctions = 0;
        let coveredLines = 0;
        
        // Try to find coverage data in a variety of formats
        for (const key in data) {
            const file = data[key];
            
            if (file.statements && file.branches && file.functions && file.lines) {
                // Standard format with counters
                totalStatements += file.statements.total || 0;
                coveredStatements += file.statements.covered || 0;
                
                totalBranches += file.branches.total || 0;
                coveredBranches += file.branches.covered || 0;
                
                totalFunctions += file.functions.total || 0;
                coveredFunctions += file.functions.covered || 0;
                
                totalLines += file.lines.total || 0;
                coveredLines += file.lines.covered || 0;
                
                const statementsPct = file.statements.pct || (file.statements.total ? (file.statements.covered / file.statements.total) * 100 : 0);
                const branchesPct = file.branches.pct || (file.branches.total ? (file.branches.covered / file.branches.total) * 100 : 0);
                const functionsPct = file.functions.pct || (file.functions.total ? (file.functions.covered / file.functions.total) * 100 : 0);
                const linesPct = file.lines.pct || (file.lines.total ? (file.lines.covered / file.lines.total) * 100 : 0);
                
                fileCoverage.push({
                    path: key,
                    statements: statementsPct,
                    branches: branchesPct,
                    functions: functionsPct,
                    lines: linesPct,
                    overall: (statementsPct + branchesPct + functionsPct + linesPct) / 4
                });
            }
        }
        
        const statementsPct = totalStatements ? (coveredStatements / totalStatements) * 100 : 0;
        const branchesPct = totalBranches ? (coveredBranches / totalBranches) * 100 : 0;
        const functionsPct = totalFunctions ? (coveredFunctions / totalFunctions) * 100 : 0;
        const linesPct = totalLines ? (coveredLines / totalLines) * 100 : 0;
        
        return {
            overall: (statementsPct + branchesPct + functionsPct + linesPct) / 4,
            statements: statementsPct,
            branches: branchesPct,
            functions: functionsPct,
            lines: linesPct,
            totalFiles: fileCoverage.length,
            files: fileCoverage
        };
    }

    /**
     * Parse Jest coverage format
     */
    private parseJestCoverage(data: any): CoverageSummary {
        // Check if this is the coverage-summary.json format
        if (data.total) {
            const total = data.total;
            const fileKeys = Object.keys(data).filter(key => key !== 'total');
            
            const fileCoverage: FileCoverage[] = fileKeys.map(key => {
                const file = data[key];
                return {
                    path: key,
                    statements: file.statements.pct,
                    branches: file.branches.pct,
                    functions: file.functions.pct,
                    lines: file.lines.pct,
                    overall: (file.statements.pct + file.branches.pct + file.functions.pct + file.lines.pct) / 4
                };
            });
            
            return {
                overall: (total.statements.pct + total.branches.pct + total.functions.pct + total.lines.pct) / 4,
                statements: total.statements.pct,
                branches: total.branches.pct,
                functions: total.functions.pct,
                lines: total.lines.pct,
                totalFiles: fileCoverage.length,
                files: fileCoverage
            };
        }
        
        // Otherwise, process the full coverage data
        const fileCoverage: FileCoverage[] = [];
        let totalStatements = 0;
        let totalBranches = 0;
        let totalFunctions = 0;
        let totalLines = 0;
        let coveredStatements = 0;
        let coveredBranches = 0;
        let coveredFunctions = 0;
        let coveredLines = 0;
        
        for (const filePath in data) {
            const fileData = data[filePath];
            
            const statementsTotal = Object.keys(fileData.statementMap).length;
            const statementsHit = Object.values(fileData.s).filter(hit => hit > 0).length;
            
            const branchesTotal = Object.keys(fileData.branchMap).length * 2; // Each branch has 2 paths
            const branchesHit = Object.values(fileData.b).flat().filter(hit => hit > 0).length;
            
            const functionsTotal = Object.keys(fileData.fnMap).length;
            const functionsHit = Object.values(fileData.f).filter(hit => hit > 0).length;
            
            const linesTotal = Object.keys(fileData.statementMap).length;
            const linesHit = Object.values(fileData.s).filter(hit => hit > 0).length;
            
            totalStatements += statementsTotal;
            coveredStatements += statementsHit;
            
            totalBranches += branchesTotal;
            coveredBranches += branchesHit;
            
            totalFunctions += functionsTotal;
            coveredFunctions += functionsHit;
            
            totalLines += linesTotal;
            coveredLines += linesHit;
            
            const statementsPct = statementsTotal ? (statementsHit / statementsTotal) * 100 : 0;
            const branchesPct = branchesTotal ? (branchesHit / branchesTotal) * 100 : 0;
            const functionsPct = functionsTotal ? (functionsHit / functionsTotal) * 100 : 0;
            const linesPct = linesTotal ? (linesHit / linesTotal) * 100 : 0;
            
            fileCoverage.push({
                path: filePath,
                statements: statementsPct,
                branches: branchesPct,
                functions: functionsPct,
                lines: linesPct,
                overall: (statementsPct + branchesPct + functionsPct + linesPct) / 4
            });
        }
        
        const statementsPct = totalStatements ? (coveredStatements / totalStatements) * 100 : 0;
        const branchesPct = totalBranches ? (coveredBranches / totalBranches) * 100 : 0;
        const functionsPct = totalFunctions ? (coveredFunctions / totalFunctions) * 100 : 0;
        const linesPct = totalLines ? (coveredLines / totalLines) * 100 : 0;
        
        return {
            overall: (statementsPct + branchesPct + functionsPct + linesPct) / 4,
            statements: statementsPct,
            branches: branchesPct,
            functions: functionsPct,
            lines: linesPct,
            totalFiles: fileCoverage.length,
            files: fileCoverage
        };
    }

    /**
     * Parse NYC coverage format
     */
    private parseNycCoverage(data: any): CoverageSummary {
        // Similar structure to parseJestCoverage but with NYC specifics
        // Implementation details omitted for brevity but would follow same pattern
        return this.parseJestCoverage(data); // Fallback to Jest parser as formats are similar
    }

    /**
     * Parse C8 coverage format
     */
    private parseC8Coverage(data: any): CoverageSummary {
        // Similar structure to parseJestCoverage but with C8 specifics
        // Implementation details omitted for brevity but would follow same pattern
        return this.parseJestCoverage(data); // Fallback to Jest parser as formats are similar
    }

    /**
     * Parse LCOV coverage report
     */
    private parseLcovCoverageReport(content: string): CoverageSummary {
        const lines = content.split('\n');
        const fileCoverage: FileCoverage[] = [];
        
        let currentFile: Partial<FileCoverage> = {};
        let totalLF = 0;
        let totalLH = 0;
        let totalFNF = 0;
        let totalFNH = 0;
        let totalBRF = 0;
        let totalBRH = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('SF:')) {
                // Start of a new file
                currentFile = {
                    path: trimmed.substring(3)
                };
            } else if (trimmed.startsWith('LF:')) {
                // Lines found
                const lf = parseInt(trimmed.substring(3));
                totalLF += lf;
            } else if (trimmed.startsWith('LH:')) {
                // Lines hit
                const lh = parseInt(trimmed.substring(3));
                totalLH += lh;
                if (currentFile.path && totalLF > 0) {
                    currentFile.lines = (lh / totalLF) * 100;
                }
            } else if (trimmed.startsWith('FNF:')) {
                // Functions found
                const fnf = parseInt(trimmed.substring(4));
                totalFNF += fnf;
            } else if (trimmed.startsWith('FNH:')) {
                // Functions hit
                const fnh = parseInt(trimmed.substring(4));
                totalFNH += fnh;
                if (currentFile.path && totalFNF > 0) {
                    currentFile.functions = (fnh / totalFNF) * 100;
                }
            } else if (trimmed.startsWith('BRF:')) {
                // Branches found
                const brf = parseInt(trimmed.substring(4));
                totalBRF += brf;
            } else if (trimmed.startsWith('BRH:')) {
                // Branches hit
                const brh = parseInt(trimmed.substring(4));
                totalBRH += brh;
                if (currentFile.path && totalBRF > 0) {
                    currentFile.branches = (brh / totalBRF) * 100;
                }
            } else if (trimmed === 'end_of_record') {
                // End of file record, calculate overall and add to array
                if (currentFile.path) {
                    const statements = currentFile.lines || 0; // Use lines as proxy for statements
                    const branches = currentFile.branches || 0;
                    const functions = currentFile.functions || 0;
                    const lines = currentFile.lines || 0;
                    
                    currentFile.statements = statements;
                    currentFile.overall = (statements + branches + functions + lines) / 4;
                    
                    fileCoverage.push(currentFile as FileCoverage);
                    currentFile = {};
                }
            }
        }
        
        const linesPct = totalLF > 0 ? (totalLH / totalLF) * 100 : 0;
        const functionsPct = totalFNF > 0 ? (totalFNH / totalFNF) * 100 : 0;
        const branchesPct = totalBRF > 0 ? (totalBRH / totalBRF) * 100 : 0;
        const statementsPct = linesPct; // Use lines as proxy for statements
        
        return {
            overall: (statementsPct + branchesPct + functionsPct + linesPct) / 4,
            statements: statementsPct,
            branches: branchesPct,
            functions: functionsPct,
            lines: linesPct,
            totalFiles: fileCoverage.length,
            files: fileCoverage
        };
    }

    /**
     * Extract coverage from plain text output
     */
    private extractCoverageFromText(content: string): CoverageSummary | undefined {
        // Try to find coverage percentages in the text
        const statementsMatch = content.match(/Statements\s*:\s*(\d+\.?\d*)%/i);
        const branchesMatch = content.match(/Branches\s*:\s*(\d+\.?\d*)%/i);
        const functionsMatch = content.match(/Functions\s*:\s*(\d+\.?\d*)%/i);
        const linesMatch = content.match(/Lines\s*:\s*(\d+\.?\d*)%/i);
        
        // If we found any coverage percentages, create a summary
        if (statementsMatch || branchesMatch || functionsMatch || linesMatch) {
            const statements = statementsMatch ? parseFloat(statementsMatch[1]) : 0;
            const branches = branchesMatch ? parseFloat(branchesMatch[1]) : 0;
            const functions = functionsMatch ? parseFloat(functionsMatch[1]) : 0;
            const lines = linesMatch ? parseFloat(linesMatch[1]) : 0;
            
            // Count non-zero percentages to calculate average
            let nonZeroCount = 0;
            let sum = 0;
            
            if (statements > 0) { sum += statements; nonZeroCount++; }
            if (branches > 0) { sum += branches; nonZeroCount++; }
            if (functions > 0) { sum += functions; nonZeroCount++; }
            if (lines > 0) { sum += lines; nonZeroCount++; }
            
            const overall = nonZeroCount > 0 ? sum / nonZeroCount : 0;
            
            return {
                overall,
                statements,
                branches,
                functions,
                lines,
                totalFiles: 0, // Unknown from text output
                files: []
            };
        }
        
        // Look for a simpler "X% coverage" pattern
        const overallMatch = content.match(/coverage\s*:?\s*(\d+\.?\d*)%/i);
        if (overallMatch) {
            const overall = parseFloat(overallMatch[1]);
            return {
                overall,
                statements: overall,
                branches: overall,
                functions: overall,
                lines: overall,
                totalFiles: 0,
                files: []
            };
        }
        
        return undefined;
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }
}
