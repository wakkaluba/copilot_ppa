import * as vscode from 'vscode';
import { SecurityIssue } from '../types';

/**
 * Service for applying automated fixes to security issues
 */
export class SecurityFixService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Apply an automated fix for a security issue
     */
    public async applyFix(issue: SecurityIssue): Promise<void> {
        const document = await vscode.workspace.openTextDocument(issue.file);
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
        const line = document.lineAt(issue.line);
        const text = line.text;

        // Replace string concatenation with parameterized query
        if (text.includes('${')) {
            const queryMatch = text.match(/["'`](.*?)["'`]/);
            if (queryMatch) {
                const query = queryMatch[1];
                const params = [...query.matchAll(/\$\{(.*?)\}/g)].map(m => m[1]);
                const newQuery = query.replace(/\$\{.*?\}/g, '?');
                
                const newText = text.replace(
                    /["'`].*?["'`]/,
                    `'${newQuery}', [${params.join(', ')}]`
                );

                edit.replace(
                    document.uri,
                    line.range,
                    newText
                );
            }
        }
    }

    private async fixXss(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        const line = document.lineAt(issue.line);
        const text = line.text;

        // Replace innerHTML with textContent
        if (text.includes('innerHTML')) {
            const newText = text.replace('innerHTML', 'textContent');
            edit.replace(document.uri, line.range, newText);
        }
        // Replace document.write with safer alternatives
        else if (text.includes('document.write')) {
            const match = text.match(/document\.write\((.*)\)/);
            if (match) {
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
        const line = document.lineAt(issue.line);
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
            if (match) {
                const newText = text.replace(
                    match[0],
                    `path.normalize(${match[1]} +`
                );
                edit.replace(document.uri, line.range, newText + ')');
            }
        }
    }

    private async fixHardcodedCredentials(document: vscode.TextDocument, issue: SecurityIssue, edit: vscode.WorkspaceEdit): Promise<void> {
        const line = document.lineAt(issue.line);
        const text = line.text;

        // Replace hardcoded credentials with environment variables
        const match = text.match(/(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
        if (match) {
            const [, name, value] = match;
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
        const line = document.lineAt(issue.line);
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
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {return;}

        const rootPath = workspaceFolders[0].uri.fsPath;
        const envPath = vscode.Uri.file(`${rootPath}/.env`);

        try {
            const envDoc = await vscode.workspace.openTextDocument(envPath);
            const edit = new vscode.WorkspaceEdit();
            
            // Add to end of file if variable doesn't exist
            if (!envDoc.getText().includes(name)) {
                const lastLine = envDoc.lineCount - 1;
                const position = new vscode.Position(lastLine, Number.MAX_VALUE);
                edit.insert(envPath, position, `\n${name}=${value}`);
                await vscode.workspace.applyEdit(edit);
            }
        } catch {
            // .env doesn't exist, create it
            const edit = new vscode.WorkspaceEdit();
            edit.createFile(envPath, { ignoreIfExists: true });
            edit.insert(envPath, new vscode.Position(0, 0), `${name}=${value}\n`);
            await vscode.workspace.applyEdit(edit);
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }

    public async applyFix(issueId: string, filePath: string): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            const editor = await vscode.window.showTextDocument(document);
            const text = document.getText();

            // Apply fix based on issue type
            const edit = new vscode.WorkspaceEdit();
            const range = this.findIssueRange(document, issueId);
            if (!range) {return;}

            const replacement = this.generateFix(issueId, document.getText(range));
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
        // Implementation to find the issue range in the document
        return undefined;
    }

    private generateFix(issueId: string, originalCode: string): string | undefined {
        switch (issueId) {
            case 'SEC001': // SQL Injection
                return originalCode.replace(/\$\{.*?\}/g, '?');
            case 'SEC002': // XSS
                return originalCode.replace(/innerHTML/g, 'textContent');
            case 'SEC005': // Weak Cryptography
                return originalCode.replace(/sha1/g, 'sha256');
            default:
                return undefined;
        }
    }
}