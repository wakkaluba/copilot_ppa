/**
 * Mock ESLint and Prettier implementations for static analysis
 * This allows for dependency resolution without needing the actual packages
 */
import * as fs from 'fs';
import * as path from 'path';
import { ESLintIssue } from '../interfaces/StaticAnalysisOptions';

/**
 * Mock ESLint implementation
 */
export class ESLintMock {
    /**
     * Mock lint files implementation
     * @param files Files to lint
     * @returns Array of lint results
     */
    async lintFiles(files: string | string[]): Promise<{
        filePath: string;
        messages: {
            line: number;
            column: number;
            message: string;
            ruleId: string | null;
            severity: number;
        }[];
    }[]> {
        const fileList = Array.isArray(files) ? files : [files];
        const results = [];

        for (const file of fileList) {
            try {
                const content = await fs.promises.readFile(file, 'utf8');
                const lines = content.split('\n');
                const messages = [];

                // Simple linting checks
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // Check for common issues
                    // 1. Check for console.log statements
                    if (line.includes('console.log')) {
                        messages.push({
                            line: i + 1,
                            column: line.indexOf('console.log') + 1,
                            message: 'Unexpected console.log statement',
                            ruleId: 'no-console',
                            severity: 1
                        });
                    }
                    
                    // 2. Check for TODO comments
                    if (line.includes('TODO')) {
                        messages.push({
                            line: i + 1,
                            column: line.indexOf('TODO') + 1,
                            message: 'TODO comment found',
                            ruleId: 'no-todo',
                            severity: 0
                        });
                    }
                    
                    // 3. Check for very long lines
                    if (line.length > 100) {
                        messages.push({
                            line: i + 1,
                            column: 101,
                            message: 'Line exceeds maximum line length of 100',
                            ruleId: 'max-len',
                            severity: 1
                        });
                    }
                }

                results.push({
                    filePath: file,
                    messages
                });
            } catch (error) {
                results.push({
                    filePath: file,
                    messages: [{
                        line: 1,
                        column: 1,
                        message: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
                        ruleId: 'file-error',
                        severity: 2
                    }]
                });
            }
        }

        return results;
    }
}

/**
 * Mock Prettier implementation
 */
export const PrettierMock = {
    /**
     * Mock resolveConfig implementation
     * @param file File path
     * @returns File content
     */
    async resolveConfig(file: string): Promise<string> {
        try {
            return await fs.promises.readFile(file, 'utf8');
        } catch (error) {
            return '';
        }
    },

    /**
     * Mock check implementation - simple formatting checks
     * @param content File content
     * @param options Options including filepath
     * @returns Whether the file is formatted correctly
     */
    async check(content: string, options: { filepath: string }): Promise<boolean> {
        // Simple formatting check - just check a few rules
        if (!content) {return true;}
        
        const lines = content.split('\n');
        
        for (const line of lines) {
            // Check for missing semicolons in JS/TS files
            if ((options.filepath.endsWith('.js') || options.filepath.endsWith('.ts')) && 
                !line.trim().endsWith('{') && 
                !line.trim().endsWith('}') &&
                !line.trim().endsWith(';') && 
                !line.trim().startsWith('//') &&
                !line.trim().startsWith('import') &&
                !line.trim().startsWith('export') &&
                line.trim().length > 0) {
                return false;
            }
            
            // Check for inconsistent indentation
            if (line.startsWith(' ') && !line.startsWith('  ')) {
                return false;
            }
            
            // Check for trailing whitespace
            if (line.endsWith(' ') || line.endsWith('\t')) {
                return false;
            }
        }
        
        return true;
    }
};