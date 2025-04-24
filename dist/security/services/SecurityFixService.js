"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityFixService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Service for applying automated fixes to security issues
 */
class SecurityFixService {
    context;
    disposables = [];
    constructor(context) {
        this.context = context;
    }
    /**
     * Apply an automated fix for a security issue
     */
    async applyFix(issue) {
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
    async fixSqlInjection(document, issue, edit) {
        const line = document.lineAt(issue.line);
        const text = line.text;
        // Replace string concatenation with parameterized query
        if (text.includes('${')) {
            const queryMatch = text.match(/["'`](.*?)["'`]/);
            if (queryMatch) {
                const query = queryMatch[1];
                const params = [...query.matchAll(/\$\{(.*?)\}/g)].map(m => m[1]);
                const newQuery = query.replace(/\$\{.*?\}/g, '?');
                const newText = text.replace(/["'`].*?["'`]/, `'${newQuery}', [${params.join(', ')}]`);
                edit.replace(document.uri, line.range, newText);
            }
        }
    }
    async fixXss(document, issue, edit) {
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
                const newText = text.replace(/document\.write\((.*)\)/, `document.body.appendChild(document.createTextNode(${content}))`);
                edit.replace(document.uri, line.range, newText);
            }
        }
    }
    async fixPathTraversal(document, issue, edit) {
        const line = document.lineAt(issue.line);
        const text = line.text;
        // Add path.normalize()
        if (text.includes('path.join')) {
            const newText = text.replace(/(path\.join\(.*?\))/, 'path.normalize($1)');
            edit.replace(document.uri, line.range, newText);
        }
        else {
            const match = text.match(/(["'`].*?["'`])\s*\+/);
            if (match) {
                const newText = text.replace(match[0], `path.normalize(${match[1]} +`);
                edit.replace(document.uri, line.range, newText + ')');
            }
        }
    }
    async fixHardcodedCredentials(document, issue, edit) {
        const line = document.lineAt(issue.line);
        const text = line.text;
        // Replace hardcoded credentials with environment variables
        const match = text.match(/(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
        if (match) {
            const [, name, value] = match;
            const envVar = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            // Add to .env if it doesn't exist
            await this.addToEnvFile(envVar, value);
            const newText = text.replace(/["'`]([^"'`]+)["'`]/, `process.env.${envVar}`);
            edit.replace(document.uri, line.range, newText);
        }
    }
    async fixWeakCrypto(document, issue, edit) {
        const line = document.lineAt(issue.line);
        const text = line.text;
        // Replace weak hashing algorithms with stronger ones
        if (text.includes('md5')) {
            const newText = text.replace(/["'`]md5["'`]/, '"sha256"');
            edit.replace(document.uri, line.range, newText);
        }
        else if (text.includes('sha1')) {
            const newText = text.replace(/["'`]sha1["'`]/, '"sha256"');
            edit.replace(document.uri, line.range, newText);
        }
    }
    async addToEnvFile(name, value) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }
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
        }
        catch {
            // .env doesn't exist, create it
            const edit = new vscode.WorkspaceEdit();
            edit.createFile(envPath, { ignoreIfExists: true });
            edit.insert(envPath, new vscode.Position(0, 0), `${name}=${value}\n`);
            await vscode.workspace.applyEdit(edit);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    async applyFix(issueId, filePath) {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            const editor = await vscode.window.showTextDocument(document);
            const text = document.getText();
            // Apply fix based on issue type
            const edit = new vscode.WorkspaceEdit();
            const range = this.findIssueRange(document, issueId);
            if (!range) {
                return;
            }
            const replacement = this.generateFix(issueId, document.getText(range));
            if (replacement) {
                edit.replace(document.uri, range, replacement);
                await vscode.workspace.applyEdit(edit);
                await document.save();
            }
        }
        catch (error) {
            console.error('Error applying security fix:', error);
            throw error;
        }
    }
    findIssueRange(document, issueId) {
        // Implementation to find the issue range in the document
        return undefined;
    }
    generateFix(issueId, originalCode) {
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
exports.SecurityFixService = SecurityFixService;
//# sourceMappingURL=SecurityFixService.js.map