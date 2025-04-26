import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { SecurityIssue } from '../types';

/**
 * Service for applying automated fixes to security issues
 */
export class SecurityFixService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];

    constructor() {}

    /**
     * Apply an automated fix for a security issue
     */
    public async applyFix(issue: SecurityIssue): Promise<void> {
        // Ensure issue has required properties
        if (!issue.filePath) {
            throw new Error('Issue is missing filePath property');
        }
        
        const document = await vscode.workspace.openTextDocument(issue.filePath);
        const edit = new vscode.WorkspaceEdit();
        
        switch (issue.id) {
            case 'SEC001': // SQL Injection
                await this.fixSqlInjection(document, issue, edit);
                break;
            case 'SEC002': // XSS
                await this.fixXss(document, issue, edit);
                break;
            case 'SEC003': // Path Traversal
                await this.fixPathTraversal(document, issue, edit);
                break;
            case 'SEC004': // Hardcoded Credentials
                await this.fixHardcodedCredentials(document, issue, edit);
                break;
            case 'SEC005': // Weak Crypto
                await this.fixWeakCrypto(document, issue, edit);
                break;
            default:
                throw new Error(`No automated fix available for issue type: ${issue.id}`);
        }

        // Apply the edit
        await vscode.workspace.applyEdit(edit);
    }

    private async fixSqlInjection(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
        const text = line.text;

        // Replace string concatenation with parameterized query
        if (text.includes('${')) {
            const queryMatch = text.match(/["'`](.*?)["'`]/);
            if (queryMatch && queryMatch[1] !== undefined) {
                const query = queryMatch[1];
                const params = [...query.matchAll(/\$\{(.*?)\}/g)].map(m => m[1]);
                const newQuery = query.replace(/\$\{.*?\}/g, '?');
                
                const newText = text.replace(
                    /["'`].*?["'`]/,
                    `'${newQuery}', [${params.join(', ')}]`
                );
                edit.replace(document.uri, line.range, newText);
            }
        }
    }

    private async fixXss(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
        const text = line.text;

        // Replace innerHTML with textContent
        if (text.includes('innerHTML')) {
            const newText = text.replace('innerHTML', 'textContent');
            edit.replace(document.uri, line.range, newText);
        }
        // Replace document.write with safer alternatives
        else if (text.includes('document.write')) {
            const match = text.match(/document\.write\((.*)\)/);
            if (match && match[1] !== undefined) {
                const content = match[1];
                const newText = text.replace(
                    /document\.write\((.*)\)/,
                    `document.body.appendChild(document.createTextNode(${content}))`
                );
                edit.replace(document.uri, line.range, newText);
            }
        }
    }

    private async fixPathTraversal(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
        const text = line.text;

        // Add path.normalize()
        if (text.includes('path.join')) {
            const newText = text.replace(
                /(path\.join\(.*?\))/,
                'path.normalize($1)'
            );
            edit.replace(document.uri, line.range, newText);
        } else {
            const match = text.match(/(["'`].*?["'`])\s*\+/);
            if (match && match[0] !== undefined && match[1] !== undefined) {
                const newText = text.replace(
                    match[0],
                    `path.normalize(${match[1]} +`
                );
                edit.replace(document.uri, line.range, newText + ')');
            }
        }
    }

    private async fixHardcodedCredentials(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
        const text = line.text;

        // Replace hardcoded credentials with environment variables
        const match = text.match(/(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
        if (match && match[1] !== undefined && match[2] !== undefined) {
            const name = match[1];
            const value = match[2];
            const envVar = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            
            // Add to .env if it doesn't exist
            await this.addToEnvFile(envVar, value);
            
            const newText = text.replace(
                /["'`]([^"'`]+)["'`]/,
                `process.env.${envVar}`
            );
            edit.replace(document.uri, line.range, newText);
        }
    }

    private async fixWeakCrypto(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
        const text = line.text;

        // Replace weak hashing algorithms with stronger ones
        if (text.includes('md5')) {
            const newText = text.replace(/["'`]md5["'`]/, '"sha256"');
            edit.replace(document.uri, line.range, newText);
        } else if (text.includes('sha1')) {
            const newText = text.replace(/["'`]sha1["'`]/, '"sha256"');
            edit.replace(document.uri, line.range, newText);
        }
    }

    private async addToEnvFile(name: string, value: string): Promise<void> {
        // Implementation details
        // Added null check for workspace folders
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }
        
        const envFilePath = path.join(workspaceFolder.uri.fsPath, '.env');
        
        // Read existing .env file content or create a new one
        let envContent = '';
        try {
            envContent = await fs.readFile(envFilePath, 'utf-8');
        } catch (error) {
            // File doesn't exist, will create a new one
        }
        
        // Check if the variable already exists
        const regex = new RegExp(`^${name}=.*`, 'm');
        if (!regex.test(envContent)) {
            // Add new variable
            envContent += `\n${name}=${value}`;
            await fs.writeFile(envFilePath, envContent.trim(), 'utf-8');
        }
    }

    /**
     * Apply fix by issue ID and file path
     */
    public async applyFixById(issueId: string, filePath: string): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            // Don't store the editor to avoid unused variable
            await vscode.window.showTextDocument(document);
            
            // Apply fix based on issue type
            const edit = new vscode.WorkspaceEdit();
            const range = this.findIssueRange(document, issueId);
            if (!range) {
                return;
            }

            const text = document.getText(range);
            const replacement = this.generateFix(issueId, text);
            if (replacement) {
                edit.replace(document.uri, range, replacement);
                await vscode.workspace.applyEdit(edit);
                await document.save();
            }
        } catch (error) {
            console.error('Error applying security fix:', error);
            throw error;
        }
    }

    private findIssueRange(document: vscode.TextDocument, issueId: string): vscode.Range | undefined {
        // Simple implementation to find potential issue lines
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text;
            
            switch (issueId) {
                case 'SEC001': // SQL Injection
                    if (text.includes('${') && (text.includes('sql') || text.includes('query'))) {
                        return line.range;
                    }
                    break;
                case 'SEC002': // XSS
                    if (text.includes('innerHTML') || text.includes('document.write')) {
                        return line.range;
                    }
                    break;
                case 'SEC003': // Path Traversal
                    if ((text.includes('path.join') || text.includes('fs.')) && 
                        (text.includes('+') || text.includes('${'))) {
                        return line.range;
                    }
                    break;
                case 'SEC004': // Hardcoded Credentials
                    if ((text.includes('password') || text.includes('token') || 
                        text.includes('key') || text.includes('secret')) && 
                        (text.includes('"') || text.includes("'") || text.includes('`'))) {
                        return line.range;
                    }
                    break;
                case 'SEC005': // Weak Crypto
                    if (text.includes('md5') || text.includes('sha1')) {
                        return line.range;
                    }
                    break;
            }
        }
        
        return undefined;
    }

    private generateFix(issueId: string, originalCode: string): string | undefined {
        switch (issueId) {
            case 'SEC001': // SQL Injection
                return originalCode.replace(/\$\{.*?\}/g, '?');
            case 'SEC002': // XSS
                return originalCode.replace(/innerHTML/g, 'textContent')
                                  .replace(/document\.write\((.*)\)/, 'document.body.appendChild(document.createTextNode($1))');
            case 'SEC003': // Path Traversal
                if (originalCode.includes('path.join')) {
                    return originalCode.replace(/(path\.join\(.*?\))/, 'path.normalize($1)');
                } else {
                    return `path.normalize(${originalCode})`;
                }
            case 'SEC004': // Hardcoded Credentials
                const match = originalCode.match(/(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
                if (match && match[1] !== undefined) {
                    const name = match[1];
                    const envVar = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                    return originalCode.replace(/["'`]([^"'`]+)["'`]/, `process.env.${envVar}`);
                }
                return undefined;
            case 'SEC005': // Weak Cryptography
                return originalCode.replace(/md5/g, 'sha256').replace(/sha1/g, 'sha256');
            default:
                return undefined;
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}