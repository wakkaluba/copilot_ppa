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
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
/**
 * Service for applying automated fixes to security issues
 */
class SecurityFixService {
    constructor() {
        this.disposables = [];
    }
    /**
     * Apply an automated fix for a security issue
     */
    async applyFix(issue) {
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
    async fixSqlInjection(document, issue, edit) {
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
                const newText = text.replace(/["'`].*?["'`]/, `'${newQuery}', [${params.join(', ')}]`);
                edit.replace(document.uri, line.range, newText);
            }
        }
    }
    async fixXss(document, issue, edit) {
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
                const newText = text.replace(/document\.write\((.*)\)/, `document.body.appendChild(document.createTextNode(${content}))`);
                edit.replace(document.uri, line.range, newText);
            }
        }
    }
    async fixPathTraversal(document, issue, edit) {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
        const text = line.text;
        // Add path.normalize()
        if (text.includes('path.join')) {
            const newText = text.replace(/(path\.join\(.*?\))/, 'path.normalize($1)');
            edit.replace(document.uri, line.range, newText);
        }
        else {
            const match = text.match(/(["'`].*?["'`])\s*\+/);
            if (match && match[0] !== undefined && match[1] !== undefined) {
                const newText = text.replace(match[0], `path.normalize(${match[1]} +`);
                edit.replace(document.uri, line.range, newText + ')');
            }
        }
    }
    async fixHardcodedCredentials(document, issue, edit) {
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
            const newText = text.replace(/["'`]([^"'`]+)["'`]/, `process.env.${envVar}`);
            edit.replace(document.uri, line.range, newText);
        }
    }
    async fixWeakCrypto(document, issue, edit) {
        if (!issue.lineNumber) {
            throw new Error('Issue is missing lineNumber property');
        }
        const line = document.lineAt(issue.lineNumber - 1); // Convert to 0-based index
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
        }
        catch (error) {
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
    async applyFixById(issueId, filePath) {
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
        }
        catch (error) {
            console.error('Error applying security fix:', error);
            throw error;
        }
    }
    findIssueRange(document, issueId) {
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
    generateFix(issueId, originalCode) {
        switch (issueId) {
            case 'SEC001': // SQL Injection
                return originalCode.replace(/\$\{.*?\}/g, '?');
            case 'SEC002': // XSS
                return originalCode.replace(/innerHTML/g, 'textContent')
                    .replace(/document\.write\((.*)\)/, 'document.body.appendChild(document.createTextNode($1))');
            case 'SEC003': // Path Traversal
                if (originalCode.includes('path.join')) {
                    return originalCode.replace(/(path\.join\(.*?\))/, 'path.normalize($1)');
                }
                else {
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
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.SecurityFixService = SecurityFixService;
//# sourceMappingURL=SecurityFixService.js.map